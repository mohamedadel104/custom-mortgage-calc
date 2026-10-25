export const SERIES = [
  { id: 'oneToFive', key: 'M.DE.B.A2C.I.R.A.2250.EUR.N', label: 'Over 1–5 years fixed' },
  { id: 'fiveToTen', key: 'M.DE.B.A2C.O.R.A.2250.EUR.N', label: 'Over 5–10 years fixed' },
  { id: 'overTen', key: 'M.DE.B.A2C.P.R.A.2250.EUR.N', label: 'Over 10 years fixed' },
];

// SDMX CSV can contain quoted commas and escaped quotation marks in metadata.
export function parseCsv(text) {
  const rows = [];
  let row = [],
    cell = '',
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if (c === '\n' && !quoted) {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  return rows;
}

export function observationsFromCsv(text, key, now = new Date()) {
  const [header, ...rows] = parseCsv(text.replace(/^\uFEFF/, ''));
  const periodIndex = header?.indexOf('TIME_PERIOD'),
    valueIndex = header?.indexOf('OBS_VALUE');
  const keyIndex = header?.indexOf('KEY');
  if (periodIndex < 0 || valueIndex < 0 || keyIndex < 0)
    throw new Error('Unexpected ECB CSV schema');
  const observations = rows
    .filter((row) => {
      const value = row[valueIndex],
        period = row[periodIndex];
      return (
        row[keyIndex] === `MIR.${key}` &&
        /^\d{4}-(0[1-9]|1[0-2])$/.test(period ?? '') &&
        value?.trim() !== '' &&
        Number.isFinite(Number(value)) &&
        Number(value) >= 0 &&
        Number(value) <= 25 &&
        new Date(`${period}-01T00:00:00Z`) <= now
      );
    })
    .map((row) => ({ period: row[periodIndex], value: Number(row[valueIndex]) }))
    .sort((a, b) => a.period.localeCompare(b.period));
  if (!observations.length) throw new Error('ECB response contained no valid observations');
  return observations;
}
