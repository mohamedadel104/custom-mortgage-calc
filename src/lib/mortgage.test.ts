import { describe, expect, test } from 'vitest';
import {
  amortize,
  calculate,
  DEFAULTS,
  paymentForTerm,
  sanitizeInputs,
  scheduleCsv,
} from './mortgage';
import { STATES } from '../data/germany';
import { rentVsBuy, RENT_DEFAULTS } from './rentBuy';
import { benchmarkNominal, validSnapshot, staleRate } from './rates';
import { median, validComparable } from './location';

describe('German purchase financing', () => {
  test('Bavaria purchase costs and cash reserve are included exactly once', () => {
    const r = calculate(DEFAULTS);
    expect(r.transferTax).toBe(15750);
    expect(r.notary).toBe(9000);
    expect(r.broker).toBeCloseTo(16065, 8);
    expect(r.buyingCosts).toBeCloseTo(40815, 8);
    expect(r.loan).toBeCloseTo(395815, 8);
    expect(r.cashUsed).toBe(105000);
    expect(r.loan + r.cashUsed).toBeCloseTo(r.totalProject, 8);
    expect(r.payment).toBeCloseTo(2061.5364583333, 6);
  });
  test('all 16 states use their own tax rate, including recent Bremen and Thüringen changes', () => {
    expect(STATES).toHaveLength(16);
    for (const state of STATES)
      expect(calculate({ ...DEFAULTS, state: state.id }).transferTax).toBe(
        (DEFAULTS.price * state.tax) / 100,
      );
    expect(calculate({ ...DEFAULTS, state: 'HB' }).transferTax).toBe(24750);
    expect(calculate({ ...DEFAULTS, state: 'TH' }).transferTax).toBe(22500);
  });
  test('an all-cash purchase creates no debt, interest or phantom payments', () => {
    const r = calculate({ ...DEFAULTS, savings: 2000000 });
    expect(r.loan).toBe(0);
    expect(r.payment).toBe(0);
    expect(r.schedule.rows).toEqual([]);
    expect(r.schedule.totalInterest).toBe(0);
    expect(r.cashUsed).toBe(r.totalProject);
  });
  test('reserve above savings cannot create negative usable cash', () => {
    const r = calculate({ ...DEFAULTS, savings: 10000, reserve: 20000 });
    expect(r.cashUsed).toBe(0);
    expect(r.loan).toBe(r.totalProject);
  });
  test('zero income yields an unavailable ratio, not Infinity', () =>
    expect(calculate({ ...DEFAULTS, income: 0 }).burden).toBeNull());
});

describe('amortization and refinancing', () => {
  test('matches a closed-form balance independently of the monthly simulation', () => {
    const p = { ...DEFAULTS, interest: 4, repayment: 2, fixedYears: 10 };
    const schedule = amortize(300000, p);
    const factor = Math.pow(1 + 0.04 / 12, 120);
    expect(schedule.balanceAtFix).toBeCloseTo(
      300000 * factor - (1500 * (factor - 1)) / (0.04 / 12),
      6,
    );
    expect(schedule.rows[0].interest).toBe(1000);
    expect(schedule.rows[0].principal).toBe(500);
  });
  test('zero-rate loan repays 60000 in exactly 120 monthly payments of 500', () => {
    const schedule = amortize(60000, {
      ...DEFAULTS,
      interest: 0,
      repayment: 10,
      fixedYears: 1,
      targetYears: 10,
      refinanceRate: 0,
    });
    expect(schedule.payoffMonths).toBe(120);
    expect(schedule.totalInterest).toBe(0);
    expect(schedule.balanceAtFix).toBe(54000);
    expect(schedule.refinancePayment).toBe(500);
    expect(schedule.totalPaid).toBe(60000);
  });
  test('every month conserves principal and payment, never crossing below zero', () => {
    const r = calculate({ ...DEFAULTS, extraAnnual: 5000 });
    for (const row of r.schedule.rows) {
      expect(row.opening - row.principal - row.extra).toBeCloseTo(row.balance, 6);
      expect(row.payment).toBeCloseTo(row.principal + row.interest, 6);
      expect(row.balance).toBeGreaterThanOrEqual(0);
    }
    expect(r.schedule.totalPaid - r.schedule.totalInterest).toBeCloseTo(r.loan, 3);
    expect(r.schedule.payoffMonths).toBeLessThanOrEqual(360);
  });
  test('special repayments occur at year end only in the fixed period and are capped by the debt', () => {
    const p = { ...DEFAULTS, extraAnnual: 1000000 };
    const s = amortize(20000, p);
    expect(s.payoffMonths).toBe(12);
    expect(s.remaining).toBe(0);
    expect(s.rows.slice(0, 11).every((r) => r.extra === 0)).toBe(true);
    const r = calculate({ ...DEFAULTS, extraAnnual: 5000 });
    expect(
      r.schedule.rows
        .filter((row) => row.extra > 0)
        .every((row) => row.month % 12 === 0 && row.month <= 120),
    ).toBe(true);
    expect(r.interestSaved).toBeGreaterThan(0);
    expect(r.schedule.balanceAtFix).toBeLessThan(r.baseline.balanceAtFix);
  });
  test('refinancing stress increases payment and reduces monthly room consistently', () => {
    const r = calculate(DEFAULTS);
    for (let i = 1; i < r.stress.length; i++) {
      expect(r.stress[i].payment).toBeGreaterThan(r.stress[i - 1].payment);
      expect(r.stress[i].surplus).toBeLessThan(r.stress[i - 1].surplus);
    }
    expect(r.stress[0].payment).toBeCloseTo(r.schedule.refinancePayment, 6);
  });
  test('term payment handles zero interest and nearly zero rates', () => {
    expect(paymentForTerm(120000, 0, 120)).toBe(1000);
    expect(paymentForTerm(120000, 0.000001, 120)).toBeCloseTo(1000, 3);
  });
  test('invalid and hostile persisted values fall back or clamp without polluting the model', () => {
    const p = sanitizeInputs({
      price: NaN,
      savings: Infinity,
      state: 'XX',
      fixedYears: 30,
      targetYears: 1,
      interest: -9,
      income: 'hello',
    });
    expect(p.price).toBe(DEFAULTS.price);
    expect(p.state).toBe('BY');
    expect(p.interest).toBe(0);
    expect(p.targetYears).toBe(31);
    expect(Number.isFinite(calculate(p).payment)).toBe(true);
  });
  test('CSV includes assumptions and a row for every monthly payment', () => {
    const r = calculate(DEFAULTS),
      csv = scheduleCsv(r);
    expect(csv).toContain('Refinance assumption: 4.5%');
    expect(csv.split('\n').filter((line) => /^\d/.test(line))).toHaveLength(r.schedule.rows.length);
  });
});

describe('rent versus buy', () => {
  test('renter starts with cash used by buyer and both sides invest their cost advantage', () => {
    const p = {
      ...DEFAULTS,
      price: 120000,
      savings: 120000,
      reserve: 0,
      brokerRate: 0,
      notaryRate: 0,
      renovation: 0,
      state: 'BY',
      running: 0,
      maintenance: 0,
      interest: 0,
      repayment: 10,
    };
    const r = rentVsBuy(p, {
      ...RENT_DEFAULTS,
      rent: 1000,
      tenantCosts: 0,
      rentGrowth: 0,
      homeGrowth: 0,
      investmentReturn: 0,
      costGrowth: 0,
      sellingCost: 0,
      years: 1,
    });
    expect(r.end.renterInvestments).toBe(120000);
    // Loan = transfer tax of 4200; monthly payment = 35. Buyer invests 1000 - 35 monthly.
    expect(r.end.buyerInvestments).toBeCloseTo(11580, 6);
    expect(r.end.debt).toBeCloseTo(3780, 6);
    expect(r.end.buyerWealth).toBeCloseTo(127800, 6);
  });
  test('no growth and no costs conserve all-cash purchase equity', () => {
    const p = { ...DEFAULTS, savings: 1000000, renovation: 0, running: 0, maintenance: 0 };
    const r = rentVsBuy(p, {
      ...RENT_DEFAULTS,
      rent: 0,
      tenantCosts: 0,
      homeGrowth: 0,
      investmentReturn: 0,
      sellingCost: 0,
      costGrowth: 0,
      years: 10,
    });
    expect(r.end.buyerWealth).toBe(p.price);
    expect(r.end.renterWealth).toBe(calculate(p).cashUsed);
  });
});

describe('public data and local evidence', () => {
  test('benchmark rate conversion preserves the annual compounded rate', () =>
    expect((Math.pow(1 + benchmarkNominal(4) / 1200, 12) - 1) * 100).toBeCloseTo(4, 10));
  test('stale observations are dated by the source month, not retrieval date', () => {
    expect(staleRate('2026-08', new Date('2026-10-25'))).toBe(false);
    expect(staleRate('2026-05', new Date('2026-10-25'))).toBe(true);
  });
  test('invalid rate payloads are not mistaken for live data', () => {
    expect(validSnapshot({})).toBe(false);
    expect(validSnapshot(null)).toBe(false);
  });
  test('local evidence rejects future dates and executable links', () => {
    const record = {
      id: '1',
      location: 'München',
      date: '2025-01-01',
      price: 450000,
      area: 90,
      kind: 'asking',
      type: 'apartment',
      source: 'https://example.com/evidence', // taste-skill-ignore: synthetic validation fixture, never rendered.
      notes: '',
    }; // taste-skill-ignore: synthetic validation fixture, never rendered in the product.
    expect(validComparable(record)).toBe(true);
    expect(validComparable({ ...record, source: 'javascript:alert(1)' })).toBe(false);
    expect(validComparable({ ...record, date: '2099-01-01' })).toBe(false);
    expect(validComparable({ ...record, area: 0 })).toBe(false);
    expect(validComparable({ ...record, date: '2025-02-31' })).toBe(false);
  });
  test('median handles even, odd and missing samples', () => {
    expect(median([])).toBeNull();
    expect(median([4, 2, 3])).toBe(3);
    expect(median([1, 8, 3, 4])).toBe(3.5);
  });
});
