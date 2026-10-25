import { STATES } from '../data/germany';

export interface Inputs {
  price: number;
  state: string;
  savings: number;
  reserve: number;
  renovation: number;
  notaryRate: number;
  brokerRate: number;
  interest: number;
  repayment: number;
  fixedYears: number;
  refinanceRate: number;
  targetYears: number;
  extraAnnual: number;
  income: number;
  living: number;
  running: number;
  maintenance: number;
}

export const DEFAULTS: Inputs = {
  price: 450000,
  state: 'BY',
  savings: 120000,
  reserve: 15000,
  renovation: 10000,
  notaryRate: 2,
  brokerRate: 3.57,
  interest: 3.75,
  repayment: 2.5,
  fixedYears: 10,
  refinanceRate: 4.5,
  targetYears: 30,
  extraAnnual: 0,
  income: 6500,
  living: 2200,
  running: 300,
  maintenance: 250,
};

// Bounds apply to forms, persisted scenarios and calculations; no NaN/Infinity may enter the model.
export const BOUNDS: Record<Exclude<keyof Inputs, 'state'>, [number, number]> = {
  price: [10000, 20000000],
  savings: [0, 30000000],
  reserve: [0, 30000000],
  renovation: [0, 10000000],
  notaryRate: [0, 10],
  brokerRate: [0, 15],
  interest: [0, 20],
  repayment: [0.1, 20],
  fixedYears: [1, 30],
  refinanceRate: [0, 25],
  targetYears: [1, 60],
  extraAnnual: [0, 1000000],
  income: [0, 1000000],
  living: [0, 1000000],
  running: [0, 100000],
  maintenance: [0, 100000],
};

export function sanitizeInputs(raw: unknown): Inputs {
  const result = { ...DEFAULTS };
  if (!raw || typeof raw !== 'object') return result;
  const source = raw as Record<string, unknown>;
  for (const key of Object.keys(BOUNDS) as Array<keyof typeof BOUNDS>) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      result[key] = Math.max(BOUNDS[key][0], Math.min(BOUNDS[key][1], value));
    }
  }
  result.fixedYears = Math.round(result.fixedYears);
  result.targetYears = Math.max(Math.round(result.targetYears), result.fixedYears + 1);
  if (STATES.some((state) => state.id === source.state)) result.state = source.state as string;
  return result;
}

export function paymentForTerm(principal: number, annualRate: number, months: number): number {
  if (principal <= 0) return 0;
  const r = annualRate / 1200;
  return r === 0
    ? principal / Math.max(1, months)
    : (principal * r) / -Math.expm1(-Math.max(1, months) * Math.log1p(r));
}

export interface Month {
  month: number;
  opening: number;
  payment: number;
  interest: number;
  principal: number;
  extra: number;
  balance: number;
  totalInterest: number;
  totalPaid: number;
}
export interface Schedule {
  rows: Month[];
  balanceAtFix: number;
  refinancePayment: number;
  totalInterest: number;
  totalPaid: number;
  payoffMonths: number | null;
  remaining: number;
}

// End-of-month payments; special repayments at the end of every twelfth month,
// during the fixed period only. Refinancing uses a fresh payment for the remaining target term.
export function amortize(
  principal: number,
  p: Inputs,
  extra = p.extraAnnual,
  refinanceRate = p.refinanceRate,
): Schedule {
  const initialPayment = (principal * (p.interest + p.repayment)) / 1200;
  let balance = principal,
    totalInterest = 0,
    totalPaid = 0,
    balanceAtFix = 0,
    refinancePayment = 0;
  const rows: Month[] = [];
  let payoffMonths: number | null = principal <= 0 ? 0 : null;
  for (let month = 1; month <= 720 && balance > 0.005; month++) {
    if (month === p.fixedYears * 12 + 1) {
      refinancePayment = paymentForTerm(
        balance,
        refinanceRate,
        (p.targetYears - p.fixedYears) * 12,
      );
    }
    const interest = (balance * (month <= p.fixedYears * 12 ? p.interest : refinanceRate)) / 1200;
    const payment = Math.min(
      balance + interest,
      month <= p.fixedYears * 12 ? initialPayment : refinancePayment,
    );
    const principalPaid = payment - interest;
    const special =
      month % 12 === 0 && month <= p.fixedYears * 12
        ? Math.min(extra, Math.max(0, balance - principalPaid))
        : 0;
    const opening = balance;
    balance = Math.max(0, balance - principalPaid - special);
    totalInterest += interest;
    totalPaid += payment + special;
    rows.push({
      month,
      opening,
      payment,
      interest,
      principal: principalPaid,
      extra: special,
      balance,
      totalInterest,
      totalPaid,
    });
    if (month === p.fixedYears * 12) balanceAtFix = balance;
    if (balance <= 0.005) {
      balance = 0;
      payoffMonths = month;
    }
  }
  return {
    rows,
    balanceAtFix,
    refinancePayment,
    totalInterest,
    totalPaid,
    payoffMonths,
    remaining: balance,
  };
}

export function calculate(raw: Inputs) {
  const p = sanitizeInputs(raw);
  const state = STATES.find((state) => state.id === p.state)!;
  const transferTax = (p.price * state.tax) / 100;
  const notary = (p.price * p.notaryRate) / 100;
  const broker = (p.price * p.brokerRate) / 100;
  const buyingCosts = transferTax + notary + broker;
  const totalProject = p.price + buyingCosts + p.renovation;
  const cashAvailable = Math.max(0, p.savings - p.reserve);
  const cashUsed = Math.min(cashAvailable, totalProject);
  const loan = Math.max(0, totalProject - cashUsed);
  const payment = (loan * (p.interest + p.repayment)) / 1200;
  const housing = payment + p.running + p.maintenance;
  const monthlyBudget = housing + p.extraAnnual / 12;
  const surplus = p.income - p.living - monthlyBudget;
  const burden = p.income > 0 ? (monthlyBudget / p.income) * 100 : null;
  const ltv = (loan / p.price) * 100;
  const schedule = amortize(loan, p);
  const baseline = p.extraAnnual > 0 ? amortize(loan, p, 0) : schedule;
  const annual: Month[] = schedule.rows.filter(
    (row) => row.month % 12 === 0 || row.month === schedule.payoffMonths,
  );
  const stress = [0, 1, 2, 3].map((delta) => {
    const rate = Math.min(25, p.refinanceRate + delta);
    const payment = paymentForTerm(
      schedule.balanceAtFix,
      rate,
      (p.targetYears - p.fixedYears) * 12,
    );
    return { rate, payment, surplus: p.income - p.living - p.running - p.maintenance - payment };
  });
  return {
    p,
    state,
    transferTax,
    notary,
    broker,
    buyingCosts,
    totalProject,
    cashAvailable,
    cashUsed,
    loan,
    payment,
    housing,
    monthlyBudget,
    surplus,
    burden,
    ltv,
    schedule,
    baseline,
    annual,
    stress,
    interestSaved: Math.max(0, baseline.totalInterest - schedule.totalInterest),
    effectiveInterest: (Math.pow(1 + p.interest / 1200, 12) - 1) * 100,
  };
}

export const euro = (value: number, decimals = 0) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
export const percent = (value: number, decimals = 1) =>
  `${new Intl.NumberFormat('en-GB', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value)}%`;
export const compactEuro = (value: number) =>
  `${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(value / 1000)}k €`;

export function scheduleCsv(result: ReturnType<typeof calculate>): string {
  const p = result.p;
  const meta = `# Zuhause mortgage scenario\n# Price EUR: ${p.price}; State: ${p.state}; Loan EUR: ${result.loan.toFixed(2)}\n# Nominal rate: ${p.interest}%; Initial repayment: ${p.repayment}%; Fixed years: ${p.fixedYears}; Refinance assumption: ${p.refinanceRate}%; Target years: ${p.targetYears}\n# Annual extra EUR: ${p.extraAnnual} (fixed period only); Monthly payments, unrounded internally; illustrative projection\n`;
  return (
    meta +
    'Month,Opening balance EUR,Regular payment EUR,Interest EUR,Principal EUR,Extra repayment EUR,Closing balance EUR\n' +
    result.schedule.rows
      .map((r) =>
        [r.month, r.opening, r.payment, r.interest, r.principal, r.extra, r.balance]
          .map((n) => n.toFixed(2))
          .join(','),
      )
      .join('\n')
  );
}
