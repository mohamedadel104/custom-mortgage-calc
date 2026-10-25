import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { rateInPeriod, referenceCoverage } from './sales';
import type { RateSeries } from './rates';
import { PUBLIC_SALE_REFERENCES } from '../data/localSales';
import {
  NEUPASING_DEVELOPMENTS,
  NEUPASING_QUARTER,
  HISTORICAL_PROJECT_PRICES,
  developmentCoverage,
} from '../data/neupasing';

const series: RateSeries = {
  id: 'fiveToTen',
  key: 'fixture',
  label: 'Test series',
  url: '',
  latest: { period: '2025-03', value: 4 },
  observations: [
    { period: '2025-01', value: 2 },
    { period: '2025-03', value: 4 },
  ],
};

test('period means do not fill missing months or pass partial coverage as a full period', () => {
  expect(rateInPeriod(series, '2025-01', '2025-03')).toMatchObject({
    mean: 3,
    months: 2,
    expected: 3,
    complete: false,
  });
  expect(rateInPeriod(series, '2025-03', '2025-03')).toMatchObject({
    mean: 4,
    months: 1,
    complete: true,
  });
  expect(rateInPeriod(series, '2024-01', '2024-12')).toBeNull();
  expect(rateInPeriod(series, '2025-12', '2025-01')).toBeNull();
  expect(
    rateInPeriod(
      { ...series, observations: [...series.observations, series.observations[0]] },
      '2025-01',
      '2025-12',
    ),
  ).toBeNull();
});

test('local reference counts keep postcode, source geography and unverified prices separate', () => {
  const coverage = referenceCoverage(PUBLIC_SALE_REFERENCES, '81245', 'all', 'all');
  expect(coverage.records).toHaveLength(19);
  expect(coverage.withDisplayedPrice).toBe(7);
  expect(coverage.withClosingPrice).toBe(0);
  expect(coverage.withSaleDate).toBe(0);
  expect(
    referenceCoverage(PUBLIC_SALE_REFERENCES, '81245', 'all', 'Neupasing').records,
  ).toHaveLength(0);
  expect(referenceCoverage(PUBLIC_SALE_REFERENCES, '80331', 'all', 'all').records).toHaveLength(0);
  expect(referenceCoverage(PUBLIC_SALE_REFERENCES, '81245', 'semi', 'all').records).toHaveLength(2);
  expect(referenceCoverage(PUBLIC_SALE_REFERENCES, '81245', 'house', 'all').records).toHaveLength(
    5,
  );
  const apartments = referenceCoverage(PUBLIC_SALE_REFERENCES, '81245', 'apartment', 'all');
  expect(apartments.records).toHaveLength(14);
  expect(apartments.withDisplayedPrice).toBe(4);
  expect(
    referenceCoverage(PUBLIC_SALE_REFERENCES, '81245', 'apartment', 'Pasing').records,
  ).toHaveLength(4);
  expect(new Set(PUBLIC_SALE_REFERENCES.map((r) => r.id)).size).toBe(PUBLIC_SALE_REFERENCES.length);
});

test('neighborhood stock, developer sales and a block acquisition remain separate measures', () => {
  expect(NEUPASING_QUARTER.homes).toBe(2400);
  expect(NEUPASING_QUARTER.approximate).toBe(true);
  expect(developmentCoverage(NEUPASING_DEVELOPMENTS)).toEqual({
    records: 10,
    retailSoldReported: 295,
    blockAcquiredHomes: 68,
  });
  expect(NEUPASING_DEVELOPMENTS.find((r) => r.id === 'muenchner-wohnen-own-build')).toMatchObject({
    homes: 54,
    retailSoldReported: null,
    blockAcquiredHomes: null,
  });
  expect(
    NEUPASING_DEVELOPMENTS.find((r) => r.id === 'prisma-pasing')?.retailSoldReported,
  ).toBeNull();
  const projectUnits = PUBLIC_SALE_REFERENCES.filter((r) => r.projectId === 'bls-at-home');
  expect(projectUnits).toHaveLength(7);
  expect(projectUnits.every((r) => r.saleDate === null && r.closingPrice === null)).toBe(true);
  expect(new Set(NEUPASING_DEVELOPMENTS.map((r) => r.id)).size).toBe(NEUPASING_DEVELOPMENTS.length);
  expect(
    HISTORICAL_PROJECT_PRICES.every(
      (r) =>
        r.low > 0 && r.high >= r.low && NEUPASING_DEVELOPMENTS.some((d) => d.id === r.projectId),
    ),
  ).toBe(true);
});

test('apartment evidence preserves historical charges, conflicting years and removed prices', () => {
  const old = PUBLIC_SALE_REFERENCES.find((r) => r.id === 'fischer-187')!;
  expect(old.displayedPrice).toBeNull();
  expect(old.saleDate).toBeNull();
  expect(old.hausgeldPeriod).toContain('2006');
  expect(old.reserveExtraMonthly).toBe(88);
  expect(PUBLIC_SALE_REFERENCES.find((r) => r.id === 'duerrenberger-149')?.buildYear).toBeNull();
  const lease = PUBLIC_SALE_REFERENCES.find((r) => r.id === 'duerrenberger-158')!;
  expect(lease.leasehold).toBe(true);
  expect(lease.groundRentMonthly).toBe(343.58);
  expect(lease.parkingPrice).toBe(25000);
  expect(
    PUBLIC_SALE_REFERENCES.every((r) => r.displayedPrice === null || r.displayedPrice > 0),
  ).toBe(true);
});

test('historical rate bounds follow chronological order without mutating source observations', () => {
  const unordered = { ...series, observations: [...series.observations].reverse() };
  expect(rateInPeriod(unordered, '2025-01', '2025-12')).toMatchObject({
    first: '2025-01',
    last: '2025-03',
  });
  expect(unordered.observations[0].period).toBe('2025-03');
});

test('retained rates cover historical comparison periods for every fixation category', () => {
  const data = JSON.parse(readFileSync('public/data/rates.json', 'utf8'));
  for (const item of data.series) {
    expect(item.observations[0].period).toBe('2003-01');
    expect(rateInPeriod(item, '2025-01', '2025-12')).toMatchObject({ months: 12, complete: true });
    const latestYear = item.latest.period.slice(0, 4);
    const latestMonth = Number(item.latest.period.slice(5, 7));
    expect(rateInPeriod(item, `${latestYear}-01`, `${latestYear}-12`)).toMatchObject({
      months: latestMonth,
      complete: latestMonth === 12,
    });
  }
});
