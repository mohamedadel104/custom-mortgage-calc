export interface Locality {
  postalCode: string;
  name: string;
  municipality?: { key: string; name: string };
  federalState: { key: string; name: string };
}
export const STATE_KEYS: Record<string, string> = {
  '01': 'SH',
  '02': 'HH',
  '03': 'NI',
  '04': 'HB',
  '05': 'NW',
  '06': 'HE',
  '07': 'RP',
  '08': 'BW',
  '09': 'BY',
  '10': 'SL',
  '11': 'BE',
  '12': 'BB',
  '13': 'MV',
  '14': 'SN',
  '15': 'ST',
  '16': 'TH',
};
export const NRW_TYPES: Record<number, string> = {
  1: 'Apartments',
  2: 'Detached houses',
  3: 'Terraced & semi-detached houses',
};
export type Zone = [string, string, string, number, string, string, string, number, string, string];
export interface NrwData {
  schemaVersion: number;
  retrievedAt: string;
  source: string;
  towns: Record<string, string>;
  zones: Zone[];
  history: {
    municipality: string;
    type: number;
    group: string;
    year: number;
    median: number;
    count: number;
    min: number;
    max: number;
  }[];
}
export interface HousePrices {
  retrievedAt: string;
  sourceUpdated: string;
  source: string;
  url: string;
  unit: string;
  observations: { period: string; value: number; status: string }[];
}
export function median(values: number[]): number | null {
  if (!values.length) return null;
  const a = [...values].sort((x, y) => x - y),
    mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}
export interface Comparable {
  id: string;
  location: string;
  date: string;
  price: number;
  area: number;
  kind: 'asking' | 'sale';
  type: 'apartment' | 'house';
  source: string;
  notes: string;
}
export function validComparable(raw: unknown): raw is Comparable {
  if (!raw || typeof raw !== 'object') return false;
  const c = raw as Comparable;
  return (
    typeof c.id === 'string' &&
    typeof c.location === 'string' &&
    c.location.length > 0 &&
    c.location.length <= 150 &&
    typeof c.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(c.date) &&
    Number.isFinite(Date.parse(c.date)) &&
    new Date(c.date).toISOString().slice(0, 10) === c.date &&
    c.date <= new Date().toISOString().slice(0, 10) &&
    Number.isFinite(c.price) &&
    c.price > 0 &&
    c.price <= 100000000 &&
    Number.isFinite(c.area) &&
    c.area >= 1 &&
    c.area <= 100000 &&
    ['asking', 'sale'].includes(c.kind) &&
    ['apartment', 'house'].includes(c.type) &&
    typeof c.source === 'string' &&
    /^https?:\/\//i.test(c.source) &&
    c.source.length <= 2000 &&
    typeof c.notes === 'string' &&
    c.notes.length <= 2000
  );
}
export function escapeCsv(value: string | number) {
  let s = String(value);
  if (/^[=+@\-\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
