export function parseHousePrices(raw) {
  if (
    raw?.class !== 'dataset' ||
    !Array.isArray(raw.size) ||
    raw.size.slice(0, -1).some((n) => n !== 1) ||
    raw.id?.at(-1) !== 'time' ||
    !raw.dimension?.geo?.category?.index?.hasOwnProperty('DE') ||
    !raw.dimension?.unit?.category?.index?.hasOwnProperty('I25_Q') ||
    !raw.dimension?.purchase?.category?.index?.hasOwnProperty('TOTAL')
  )
    throw new Error('Unexpected Eurostat dimensions or index base');
  const result = Object.entries(raw.dimension.time.category.index)
    .map(([period, i]) => ({ period, value: raw.value[i], status: raw.status?.[i] ?? '' }))
    .filter(
      (p) =>
        /^\d{4}-Q[1-4]$/.test(p.period) &&
        typeof p.value === 'number' &&
        Number.isFinite(p.value) &&
        p.value > 0,
    )
    .sort((a, b) => a.period.localeCompare(b.period));
  if (result.length < 8) throw new Error('Too few house price observations');
  return result;
}
