import { readFile, writeFile, rename } from 'node:fs/promises';
import { parseHousePrices } from './prices-core.mjs';
const url =
  'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hpi_q?geo=DE&purchase=TOTAL&unit=I25_Q&sinceTimePeriod=2015-Q1';
const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Eurostat HTTP ${response.status}`);
const raw = await response.json();
const observations = parseHousePrices(raw);
const destination = new URL('../public/data/house-prices.json', import.meta.url);
const previous = await readFile(destination, 'utf8')
  .then(JSON.parse)
  .catch(() => null);
if (previous && observations.at(-1).period < previous.observations.at(-1).period)
  throw new Error('Eurostat response regressed');
if (JSON.stringify(previous?.observations) === JSON.stringify(observations))
  console.log('House price data unchanged.');
else {
  const data = {
    schemaVersion: 1,
    retrievedAt: new Date().toISOString(),
    sourceUpdated: raw.updated,
    url,
    source: 'Eurostat · Destatis',
    dataset: 'prc_hpi_q',
    scope: 'Germany nationally; all dwellings purchased by households',
    unit: 'Index · 2025 = 100',
    observations,
  };
  await writeFile(
    new URL('../public/data/house-prices.json.tmp', import.meta.url),
    JSON.stringify(data, null, 2) + '\n',
  );
  await rename(new URL('../public/data/house-prices.json.tmp', import.meta.url), destination);
  console.log(
    `Saved ${observations.length} national quarterly observations through ${observations.at(-1).period}.`,
  );
}
