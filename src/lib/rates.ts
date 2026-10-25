export interface Observation {
  period: string;
  value: number;
}
export interface RateSeries {
  id: string;
  key: string;
  label: string;
  url: string;
  latest: Observation;
  observations: Observation[];
}
export interface RateSnapshot {
  schemaVersion: number;
  retrievedAt: string;
  provider: string;
  measure: string;
  series: RateSeries[];
}

export function validSnapshot(raw: unknown): raw is RateSnapshot {
  if (!raw || typeof raw !== 'object') return false;
  const data = raw as RateSnapshot;
  const validObservation = (o: Observation) =>
    o &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(o.period) &&
    Number.isFinite(o.value) &&
    o.value >= 0 &&
    o.value <= 25;
  return (
    data.schemaVersion === 1 &&
    typeof data.retrievedAt === 'string' &&
    Number.isFinite(Date.parse(data.retrievedAt)) &&
    Array.isArray(data.series) &&
    ['oneToFive', 'fiveToTen', 'overTen'].every((id) =>
      data.series.some(
        (s) =>
          s &&
          s.id === id &&
          validObservation(s.latest) &&
          Array.isArray(s.observations) &&
          s.observations.length > 0 &&
          s.observations.every(validObservation),
      ),
    )
  );
}

export function staleRate(period: string, now = new Date()): boolean {
  const [year, month] = period.split('-').map(Number);
  return now.getUTCFullYear() * 12 + now.getUTCMonth() - (year * 12 + month - 1) > 3;
}

export function periodLabel(period?: string) {
  return period
    ? new Date(`${period}-01T12:00:00Z`).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'not available';
}

// Approximation for a monthly annuity; an AAR benchmark is not a lender's nominal quote or an APR.
export const benchmarkNominal = (annualized: number) =>
  (Math.pow(1 + annualized / 100, 1 / 12) - 1) * 1200;
