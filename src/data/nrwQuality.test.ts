import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { availableNrwTowns, NRW_WITHHELD } from './nrwQuality';

test('uncertain attribution is withheld instead of merging or reassigning locations', () => {
  expect(
    availableNrwTowns({
      '05315000': 'Köln',
      '05974004': 'Bad Sassendorf',
      '05111000': 'Duplicate source label',
      '05112000': 'Duplicate source label',
    }),
  ).toEqual([['05315000', 'Köln']]);
});

test('retained NRW snapshot keeps attributable neighbours available', () => {
  const data = JSON.parse(readFileSync('public/data/nrw.json', 'utf8'));
  const keys = new Set(availableNrwTowns(data.towns).map(([key]) => key));
  for (const issue of NRW_WITHHELD) expect(keys.has(issue.key)).toBe(false);
  for (const key of ['05974008', '05974048', '05758036', '05758028']) {
    expect(keys.has(key)).toBe(true);
  }
});
