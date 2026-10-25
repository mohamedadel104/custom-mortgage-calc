import { readFile, writeFile, rename } from 'node:fs/promises';
import { SERIES, observationsFromCsv } from './rates-core.mjs';

const destination = new URL('../public/data/rates.json', import.meta.url);
const previous = await readFile(destination, 'utf8')
  .then(JSON.parse)
  .catch(() => null);
const series = await Promise.all(
  SERIES.map(async (item) => {
    const url = `https://data-api.ecb.europa.eu/service/data/MIR/${item.key}?format=csvdata&lastNObservations=24`;
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(25000),
          headers: { Accept: 'text/csv' },
        });
        if (!response.ok) throw new Error(`ECB HTTP ${response.status}`);
        const observations = observationsFromCsv(await response.text(), item.key);
        const latest = observations.at(-1);
        const old = previous?.series?.find((s) => s.id === item.id)?.latest;
        if (old && latest.period < old.period)
          throw new Error('ECB response is older than the retained snapshot');
        return { ...item, url, latest, observations };
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }),
);

// Only replace the snapshot after ALL series pass validation. Failed jobs retain prior data.
// Avoid daily commits when the source observations have not changed.
if (previous && JSON.stringify(previous.series) === JSON.stringify(series)) {
  console.log('Official rate observations unchanged; keeping the verified snapshot.');
} else {
  const snapshot = {
    schemaVersion: 1,
    retrievedAt: new Date().toISOString(),
    provider: 'European Central Bank · national data from Deutsche Bundesbank',
    frequency: 'monthly',
    unit: 'percent per annum',
    measure:
      'Annualised agreed rate (AAR) / narrowly defined effective rate (NDER), new housing loans to German households; excludes non-interest fees.',
    series,
  };
  await writeFile(
    new URL('../public/data/rates.json.tmp', import.meta.url),
    `${JSON.stringify(snapshot, null, 2)}\n`,
  );
  await rename(new URL('../public/data/rates.json.tmp', import.meta.url), destination);
  console.log(
    `Saved ${series.length} ECB series. Latest periods: ${series.map((s) => `${s.id}: ${s.latest.period}`).join(', ')}`,
  );
}
