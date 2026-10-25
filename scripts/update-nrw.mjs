import { unzipSync } from 'fflate';
import { writeFile, readFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { readDbf } from './dbf.mjs';

const base = 'https://www.opengeodata.nrw.de/produkte/infrastruktur_bauen_wohnen/boris/IRW/';
const median = (values) => {
  const v = [...values].sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};
const sources = [],
  history = [],
  zones = [],
  towns = {};
for (const year of [2020, 2025, 'current']) {
  const url = `${base}IRW_${year === 'current' ? '' : `${year}_`}EPSG25832_Shape.zip`;
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`NRW download failed: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const files = unzipSync(bytes, { filter: (file) => /\.(dbf|cpg)$/i.test(file.name) });
  const dbf = Object.entries(files).find(([name]) => /\.dbf$/i.test(name));
  if (!dbf) throw new Error('DBF missing from NRW export');
  const cpg = Object.entries(files).find(([name]) => /\.cpg$/i.test(name));
  const encoding =
    cpg && /utf.?8|65001/i.test(new TextDecoder().decode(cpg[1])) ? 'utf-8' : 'windows-1252';
  const rows = readDbf(dbf[1], encoding);
  if (!rows.length || !['GESL', 'GENA', 'IMRW', 'TEILMA', 'STAG'].every((key) => key in rows[0]))
    throw new Error('NRW schema changed');
  const groups = new Map();
  let count = 0;
  const seen = new Set();
  for (const row of rows) {
    if (
      !/^05\d{6}$/.test(row.GESL) ||
      !['1', '2', '3'].includes(row.TEILMA) ||
      !(Number(row.IMRW) > 0) ||
      !/^\d{2}\.\d{2}\.\d{4}$/.test(row.STAG)
    )
      continue;
    const identity = [
      row.GESL,
      row.WNUM,
      row.TEILMA,
      row.OBJGR,
      row.STAG,
      row.IMRW,
      row.BJ,
      row.WHNFL,
    ].join('|');
    if (seen.has(identity)) continue; // Polygon fragments can repeat a reference record.
    seen.add(identity);
    towns[row.GESL] = row.GENA;
    const period = row.STAG.slice(-4),
      key = [row.GESL, row.TEILMA, row.OBJGR, period].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(Number(row.IMRW));
    count++;
    if (year === 'current')
      zones.push([
        row.GESL,
        row.WNUM,
        row.ORTST || row.NAME_IRW || row.GEBIET,
        Number(row.TEILMA),
        row.OBJGR,
        row.BJ,
        row.WHNFL,
        Number(row.IMRW),
        row.STAG,
        row.PLZ,
      ]);
  }
  if (count < 100) throw new Error('Unexpectedly small NRW reference dataset');
  for (const [key, values] of groups) {
    const [municipality, type, group, period] = key.split('|');
    history.push({
      municipality,
      type: Number(type),
      group,
      year: Number(period),
      median: median(values),
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    });
  }
  sources.push({
    url,
    year,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    records: count,
    lastModified: response.headers.get('last-modified'),
  });
  console.log(`Validated ${count} residential reference records from ${year}.`);
}
const data = {
  schemaVersion: 1,
  retrievedAt: new Date().toISOString(),
  source: 'Gutachterausschüsse für Grundstückswerte NRW · OpenGeodata.NRW',
  license: 'Datenlizenz Deutschland – Zero – Version 2.0',
  licenseUrl: 'https://www.govdata.de/dl-de/zero-2-0',
  description:
    'Official property reference values for norm properties, not individual sale prices or land-only values. Historical summaries are unweighted medians of published reference records, not a constant-quality price index. Coverage and norm properties can change.',
  columns: [
    'municipality',
    'zone',
    'district',
    'type',
    'objectGroup',
    'buildYear',
    'livingArea',
    'eurPerSqm',
    'referenceDate',
    'postalCode',
  ],
  sources,
  towns,
  history,
  zones,
};
const destination = new URL('../public/data/nrw.json', import.meta.url);
const previous = await readFile(destination, 'utf8')
  .then(JSON.parse)
  .catch(() => null);
if (JSON.stringify(previous?.sources) === JSON.stringify(sources))
  console.log('NRW data unchanged.');
else {
  await writeFile(
    new URL('../public/data/nrw.json.tmp', import.meta.url),
    JSON.stringify(data) + '\n',
  );
  await rename(new URL('../public/data/nrw.json.tmp', import.meta.url), destination);
}
console.log(
  `${Object.keys(towns).length} municipalities; ${zones.length} current residential reference records.`,
);
