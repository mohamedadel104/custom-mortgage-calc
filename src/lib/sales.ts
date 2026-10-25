import type { RateSeries } from './rates';
import type { PublicSaleReference } from '../data/localSales';

export function rateInPeriod(series: RateSeries | undefined, start: string, end: string) {
  const serial = (period: string) => Number(period.slice(0, 4)) * 12 + Number(period.slice(5, 7));
  const expected = serial(end) - serial(start) + 1;
  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(start) ||
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(end) ||
    expected < 1
  )
    return null;
  const rows = (series?.observations ?? [])
    .filter((row) => row.period >= start && row.period <= end)
    .sort((a, b) => a.period.localeCompare(b.period));
  // Ambiguous duplicate source months cannot receive extra weight.
  if (!rows.length || new Set(rows.map((row) => row.period)).size !== rows.length) return null;
  return {
    mean: rows.reduce((total, row) => total + row.value, 0) / rows.length,
    min: Math.min(...rows.map((row) => row.value)),
    max: Math.max(...rows.map((row) => row.value)),
    months: rows.length,
    expected,
    complete: rows.length === expected,
    first: rows[0].period,
    last: rows.at(-1)!.period,
  };
}

export function referenceCoverage(
  records: PublicSaleReference[],
  postcode: string,
  type: string,
  area: string,
) {
  const matching = records.filter(
    (record) =>
      record.postcode === postcode &&
      (type === 'all' ||
        record.type === type ||
        (type === 'house' && record.type !== 'apartment')) &&
      (area === 'all' || record.area === area),
  );
  return {
    records: matching,
    withDisplayedPrice: matching.filter((record) => record.displayedPrice !== null).length,
    withClosingPrice: matching.filter((record) => record.closingPrice !== null).length,
    withSaleDate: matching.filter((record) => record.saleDate !== null).length,
  };
}
