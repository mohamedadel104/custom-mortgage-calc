// Reviewed 2026-10-25 against OpenPLZ's municipality directory. Do not reassign
// values by either conflicting label or key: the record's location is uncertain.
export const NRW_WITHHELD = [
  { key: '05974004', source: 'Bad Sassendorf', directory: 'Anröchte' },
  { key: '05974028', source: 'Welver', directory: 'Lippstadt, Stadt' },
  { key: '05758032', source: 'Vlotho', directory: 'Spenge, Stadt' },
  { key: '05758020', source: 'Löhne', directory: 'Kirchlengern' },
  { key: '05758024', source: 'Rödinghausen', directory: 'Löhne, Stadt' },
];

export function availableNrwTowns(towns: Record<string, string>) {
  const excluded = new Set(NRW_WITHHELD.map((item) => item.key));
  const candidates = Object.entries(towns).filter(([key]) => !excluded.has(key));
  // New ambiguous labels are withheld as well, until their attribution is reviewed.
  const counts = new Map<string, number>();
  for (const [, name] of candidates) counts.set(name, (counts.get(name) ?? 0) + 1);
  return candidates.filter(([, name]) => counts.get(name) === 1);
}
