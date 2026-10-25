import { test, expect } from 'vitest';
import { observationsFromCsv, parseCsv } from './rates-core.mjs';
import { parseHousePrices } from './prices-core.mjs';
import { readDbf } from './dbf.mjs';
import { readFileSync } from 'node:fs';

test('CSV handles quoted commas, escaped quotes, CRLF and final line without newline', () => {
  expect(parseCsv('KEY,TITLE\r\na,"A, B"\r\nb,"a ""quote"""')).toEqual([
    ['KEY', 'TITLE'],
    ['a', 'A, B'],
    ['b', 'a "quote"'],
  ]);
});
test('rate parser rejects missing schema, blanks, wrong series and future observations', () => {
  const key = 'M.DE.B.A2C.O.R.A.2250.EUR.N';
  expect(() => observationsFromCsv('unexpected', key)).toThrow();
  const csv = `KEY,TIME_PERIOD,OBS_VALUE\nMIR.${key},2025-01,3.6\nMIR.${key},2025-02,\nWRONG,2025-03,9\nMIR.${key},2099-01,4\n`;
  expect(observationsFromCsv(csv, key, new Date('2026-01-01'))).toEqual([
    { period: '2025-01', value: 3.6 },
  ]);
});
test('Eurostat parser fails closed on a changed base or multidimensional response', () => {
  expect(() => parseHousePrices({ class: 'dataset', size: [2, 8], id: ['geo', 'time'] })).toThrow();
});
test('DBF reader validates record bounds', () =>
  expect(() => readDbf(new Uint8Array(40))).toThrow());
test('retained public snapshots are usable and contain transparent coverage', () => {
  const rates = JSON.parse(readFileSync('public/data/rates.json', 'utf8'));
  expect(rates.series).toHaveLength(3);
  for (const s of rates.series) {
    expect(s.observations.length).toBeGreaterThan(0);
    expect(s.latest).toEqual(s.observations.at(-1));
  }
  const prices = JSON.parse(readFileSync('public/data/house-prices.json', 'utf8'));
  expect(prices.unit).toContain('2025 = 100');
  expect(prices.observations.length).toBeGreaterThan(40);
  const nrw = JSON.parse(readFileSync('public/data/nrw.json', 'utf8'));
  expect(Object.keys(nrw.towns).length).toBeGreaterThan(300);
  expect(nrw.zones.length).toBeGreaterThan(10000);
  expect(nrw.sources.every((s) => /^[a-f0-9]{64}$/.test(s.sha256))).toBe(true);
  expect(nrw.description).toContain('not individual sale prices');
});
