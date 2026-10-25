import { useState } from 'react';
import { ArrowUpRight, RefreshCw, ExternalLink, Info } from 'lucide-react';
import { LineChart } from '../components/Charts';
import { percent, type Inputs } from '../lib/mortgage';
import { benchmarkNominal, periodLabel, staleRate, type RateSnapshot } from '../lib/rates';
import { SOURCES, TAX_REVIEWED } from '../data/germany';
import { BAVARIA_LINKS, BAVARIA_REVIEWED } from '../data/bavaria';

export default function Market({
  rates,
  error,
  reload,
  update,
  goCalculator,
}: {
  rates: RateSnapshot | null;
  error: string;
  reload: () => void;
  update: (p: Partial<Inputs>) => void;
  goCalculator: () => void;
}) {
  const [seriesId, setSeriesId] = useState('fiveToTen');
  const series = rates?.series.find((s) => s.id === seriesId);
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <h1>Market data & sources</h1>
          <p>Official observations, clear dates and assumptions you control.</p>
        </div>
        <button className="secondary-button" onClick={reload}>
          <RefreshCw size={16} />
          Reload snapshot
        </button>
      </div>
      {error && <div className="notice warning">{error}</div>}
      <div className="market-stats">
        {rates?.series.map((s) => (
          <button
            key={s.id}
            className={`card market-rate ${s.id === seriesId ? 'active' : ''}`}
            onClick={() => setSeriesId(s.id)}
          >
            <span>{s.label}</span>
            <strong>{percent(s.latest.value, 2)}</strong>
            <small>{periodLabel(s.latest.period)} · Germany</small>
            <span className={`badge ${staleRate(s.latest.period) ? 'amber' : 'green'}`}>
              {staleRate(s.latest.period) ? 'Older observation' : 'Monthly observation'}
            </span>
          </button>
        ))}
      </div>
      {series && (
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>{series.label}</h2>
              <p>
                New housing loans to German households · annualised agreed rate / narrowly defined
                effective rate
              </p>
            </div>
          </div>
          <div className="padded">
            <LineChart
              points={series.observations.map((o) => ({ label: o.period, value: o.value }))}
              valueLabel={(n) => percent(n, 2)}
              label="Historical German monthly mortgage rates from the ECB"
            />
            <div className="notice info">
              <Info size={17} />
              <p>
                These are monthly statistical averages, published with a delay, excluding
                non-interest fees. Your offer depends on the property, income, loan-to-value and
                lender. They are not today’s advertised rates or a personal quote.
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                update({ interest: Math.round(benchmarkNominal(series.latest.value) * 100) / 100 });
                goCalculator();
              }}
            >
              Use {percent(benchmarkNominal(series.latest.value), 2)} planning rate{' '}
              <ArrowUpRight size={15} />
            </button>
            <p className="microcopy">
              Converts the annualised rate to an approximate monthly-compounded nominal rate: 12 ×
              ((1 + annual rate)^(1/12) − 1). Applying it does not change your fixed period or
              predict your lender’s offer.
            </p>
            <p className="microcopy">
              Series: MIR.{series.key}
              <br />
              Snapshot retrieved:{' '}
              {new Date(rates!.retrievedAt).toLocaleString('en-GB', {
                timeZone: 'Europe/Berlin',
              })}{' '}
              (Berlin time). Reload checks the site’s retained snapshot; the daily repository job
              checks the ECB.
            </p>
          </div>
        </section>
      )}
      {!rates && !error && (
        <div className="card empty-state">Loading the official rate snapshot…</div>
      )}
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Open the original. Check the details.</h2>
          </div>
        </div>
        <div className="source-list">
          {[
            [
              'ECB Data Portal',
              'Three German new-business housing-loan series. Updated by the repository daily; source observations are monthly.',
              SOURCES.ecb,
            ],
            [
              'Deutsche Bundesbank',
              'National source and methodology for MFI interest statistics.',
              SOURCES.bundesbank,
            ],
            [
              'Eurostat / Destatis · house prices',
              'National quarterly transaction-price index. Base 2025 = 100. Provisional observations retain their source flags.',
              'https://ec.europa.eu/eurostat/databrowser/view/prc_hpi_q/default/table?lang=en',
            ],
            [
              'Bavaria · official market dashboard',
              `Report 2026; regional property-price evidence. Source register reviewed ${BAVARIA_REVIEWED}. Local reports and Bavarian extracts are reviewed manually.`,
              BAVARIA_LINKS.dashboard,
            ],
            [
              'Munich · municipal reports',
              'Selected factual half-year means from page 9 of the 2024, corrected 2025 and 2026 reports. These are sample-dependent and provisional.',
              BAVARIA_LINKS.munich,
            ],
            [
              'OpenGeodata.NRW · property reference values',
              '2020, 2025 and current residential reference records. Monthly import, SHA-256 source checksums; dl-de/zero-2-0. Not individual sale prices.',
              'https://www.opengeodata.nrw.de/produkte/infrastruktur_bauen_wohnen/boris/IRW/',
            ],
            [
              'State property transfer taxes',
              `Manually reviewed ${TAX_REVIEWED}. Brandenburg’s overview plus Bremen’s current statute (5.5% from 1 July 2025). Rules do not auto-update.`,
              SOURCES.tax,
            ],
            [
              'Bremen · current tax statute',
              'The correction to the older cross-state overview.',
              SOURCES.bremen,
            ],
            [
              'OpenPLZ',
              'Place and postcode lookup on explicit search. OpenPLZ receives the search text and your IP address. Derived from open postal and geographic sources; no financial inputs are sent.',
              'https://www.openplzapi.org/en/',
            ],
          ].map(([title, text, url]) => (
            <a key={title} href={url} target="_blank" rel="noreferrer">
              <div>
                <b>{title}</b>
                <p>{text}</p>
              </div>
              <ExternalLink size={16} />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
