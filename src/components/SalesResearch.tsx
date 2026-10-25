import { useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { PUBLIC_SALE_REFERENCES } from '../data/localSales';
import { MUNICH_REPORTS, MUNICH_SEGMENTS } from '../data/bavaria';
import { referenceCoverage, rateInPeriod } from '../lib/sales';
import { validSnapshot, type RateSnapshot } from '../lib/rates';
import { useDataset } from '../lib/useDataset';
import { euro, percent } from '../lib/mortgage';
import { downloadFile } from './PlanResults';
import { LineChart } from './Charts';
import NeighborhoodResearch from './NeighborhoodResearch';

export default function SalesResearch({ postcode }: { postcode: string }) {
  const rates = useDataset<RateSnapshot>('data/rates.json', validSnapshot);
  const [type, setType] = useState('apartment'),
    [area, setArea] = useState('all');
  const [year, setYear] = useState('2025'),
    [fix, setFix] = useState('fiveToTen');
  const [segment, setSegment] = useState('flatAverage');
  const [showAll, setShowAll] = useState(false);
  const coverage = referenceCoverage(PUBLIC_SALE_REFERENCES, postcode, type, area);
  const series = rates.data?.series.find((item) => item.id === fix);
  const rate = rateInPeriod(series, `${year}-01`, `${year}-12`);
  const years = [...new Set(series?.observations.map((o) => o.period.slice(0, 4)) ?? [])].reverse();
  const priceSegment = MUNICH_SEGMENTS.find((item) => item.id === segment)!;
  const areas = [
    ...new Set(PUBLIC_SALE_REFERENCES.filter((r) => r.postcode === postcode).map((r) => r.area)),
  ];
  const sortedRecords = [...coverage.records].sort(
    (a, b) => Number(b.displayedPrice !== null) - Number(a.displayedPrice !== null),
  );
  const visibleRecords = showAll ? sortedRecords : sortedRecords.slice(0, 4);
  return (
    <>
      {postcode === '81245' && <NeighborhoodResearch series={series} />}
      <section
        className="card sales-research"
        id="individual-sales"
        aria-label="Public sales evidence"
      >
        <div className="card-heading">
          <div>
            <h2>{postcode} · individual sold-reference sample</h2>
            <p>
              {postcode === '81245'
                ? 'Individual broker and developer references across the postcode. This is a partial price sample, not total neighborhood sales.'
                : 'No property-level sample has been reviewed for this postcode. Broader city context remains separately labeled below.'}
            </p>
          </div>
        </div>
        <div className="padded">
          <div className="sales-filter-row">
            <label className="field">
              <span className="field-label">Property type</span>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setShowAll(false);
                }}
              >
                <option value="apartment">Apartments</option>
                <option value="house">All houses</option>
                <option value="semi">Semi-detached</option>
                <option value="terraced">Terraced / corner terrace</option>
                <option value="all">All properties</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Source area / project</span>
              <select
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  setShowAll(false);
                }}
              >
                <option value="all">All of {postcode}</option>
                {areas.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Year to compare rates</span>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {(years.length ? years : ['2025']).map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Initial rate fixation</span>
              <select value={fix} onChange={(e) => setFix(e.target.value)}>
                <option value="oneToFive">Over 1–5 years</option>
                <option value="fiveToTen">Over 5–10 years</option>
                <option value="overTen">Over 10 years</option>
              </select>
            </label>
          </div>
          <div className="sales-stats">
            <div>
              <span>Sold references found</span>
              <strong>{coverage.records.length}</strong>
              <small>In this reviewed sample</small>
            </div>
            <div>
              <span>With a displayed price</span>
              <strong>{coverage.withDisplayedPrice}</strong>
              <small>Final sale price unconfirmed</small>
            </div>
            <div>
              <span>Verified closing prices</span>
              <strong>{coverage.withClosingPrice}</strong>
              <small>In this sample, not all market sales</small>
            </div>
            <div>
              <span>
                {year} mortgage average · DE{rate && !rate.complete ? ' (partial)' : ''}
              </span>
              <strong>{rate ? percent(rate.mean, 2) : '—'}</strong>
              <small>
                {rate
                  ? `${rate.months}/${rate.expected} months · ${series?.label}`
                  : 'Rate data unavailable'}
              </small>
              <button
                className="text-button"
                onClick={() => document.getElementById('mortgage-history')?.scrollIntoView()}
              >
                See monthly history ↓
              </button>
            </div>
          </div>
          <p className="sales-coverage-line">
            <b>Total completed sales in {postcode}: unknown.</b> The counts above describe this
            retained sample, not every sale in the area.
          </p>
          <p className="notice info">
            These broker and developer pages say “sold”. Their displayed Kaufpreis may be an asking
            price; it is not proof of the final amount paid. None discloses a verified sale date, so
            these records cannot be assigned to a sale year or a historical mortgage rate. Missing
            dates stay missing.
          </p>
          {coverage.records.length ? (
            <div className="sale-reference-list">
              {visibleRecords.map((record) => (
                <article className="sale-reference" key={record.id}>
                  <div className="sale-reference-main">
                    <div>
                      <h3>
                        {record.type === 'apartment'
                          ? 'Apartment'
                          : record.type === 'semi'
                            ? 'Semi-detached house'
                            : 'Terraced house'}{' '}
                        · {record.livingArea} m²
                        {record.rooms !== undefined &&
                          ` · ${record.rooms} room${record.rooms === 1 ? '' : 's'}`}
                      </h3>
                      <p>
                        {record.area}
                        {record.plotArea !== null && ` · ${record.plotArea} m² plot`}
                        {record.floor !== undefined && ` · Floor ${record.floor}`}
                        {` · Baujahr ${record.buildYear ?? 'unresolved'}`}
                      </p>
                    </div>
                    <div className="sale-reference-price">
                      <b>
                        {record.displayedPrice === null
                          ? 'Price not disclosed'
                          : euro(record.displayedPrice)}
                      </b>
                      <small>
                        {record.displayedPrice === null
                          ? 'Closing price also undisclosed'
                          : 'Displayed listing price'}
                      </small>
                      {record.displayedPrice !== null && (
                        <small>
                          {euro(record.displayedPrice / record.livingArea)} / m² · excludes extra
                          parking
                        </small>
                      )}
                    </div>
                  </div>
                  {record.type === 'apartment' && (
                    <div className="apartment-costs">
                      <p>
                        <b>
                          Hausgeld:{' '}
                          {record.hausgeldMonthly !== undefined
                            ? `${euro(record.hausgeldMonthly, 2)} / month`
                            : 'not disclosed'}
                        </b>
                        {record.reserveExtraMonthly !== undefined &&
                          ` + ${euro(record.reserveExtraMonthly, 2)} / month reserve contribution`}
                      </p>
                      {record.hausgeldPeriod && (
                        <p>
                          {record.hausgeldPeriod}. Confirm the current Wirtschaftsplan before
                          budgeting.
                        </p>
                      )}
                      {record.parkingPrice !== undefined && record.displayedPrice !== null && (
                        <p>
                          Extra parking: {euro(record.parkingPrice)} · advertised property +
                          parking: {euro(record.displayedPrice + record.parkingPrice)} before
                          purchase costs
                        </p>
                      )}
                      {record.groundRentMonthly !== undefined && (
                        <p>
                          <b>Erbbauzins: {euro(record.groundRentMonthly, 2)} / month as listed</b> ·
                          additional leasehold charge · lease until {record.leaseEndYear}
                        </p>
                      )}
                    </div>
                  )}
                  <p>{record.notes}</p>
                  <div className="sale-reference-footer">
                    <span>
                      Publisher: sold · Sale date: unknown
                      {record.leasehold === true
                        ? ' · Leasehold'
                        : record.leasehold === false
                          ? ' · Freehold as reported'
                          : ' · Tenure not verified'}
                    </span>
                    <a href={record.url} target="_blank" rel="noreferrer">
                      {record.publisher} · {record.id} <ExternalLink size={12} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="sales-empty">
              <h3>No reviewed references for this selection</h3>
              <p>
                This means no matching evidence in the retained sample. It does not mean no
                properties sold here. Try all of 81245, or add your own sourced evidence below.
              </p>
            </div>
          )}
          {coverage.records.length > 4 && (
            <button className="text-button development-more" onClick={() => setShowAll(!showAll)}>
              {showAll
                ? 'Show first four references'
                : `Show all ${coverage.records.length} individual references`}
            </button>
          )}
          <p className="microcopy">
            Sources reviewed 25 Oct 2026. Selected public references, deduplicated by publisher and
            property ID; cross-publisher duplicates cannot be fully ruled out. Not an exhaustive
            internet search or a certified transaction database. The original source determines the
            area label. No precise Neupasing boundary has been applied.
          </p>
          {(type === 'apartment' || type === 'all') && (
            <p className="microcopy">
              For apartments, Hausgeld is a separate monthly building charge, not your mortgage
              payment. Check WEG accounts, reserves and planned special assessments; avoid counting
              the same reserve contribution twice. Historical listing charges are not current
              budgets.
            </p>
          )}
          <button
            className="secondary-button"
            onClick={() =>
              downloadFile(
                `public-references-${postcode}.json`,
                JSON.stringify(
                  {
                    schemaVersion: 1,
                    postcode,
                    reviewedAt: '2026-10-25',
                    evidence:
                      'Broker-marked sold references; displayed prices are not verified closing prices.',
                    records: coverage.records,
                  },
                  null,
                  2,
                ),
                'application/json',
              )
            }
          >
            <Download size={14} /> Export these source records
          </button>
        </div>
      </section>
      <section className="card" id="mortgage-history" aria-label="Historical mortgage conditions">
        <div className="card-heading">
          <div>
            <h2>What were mortgage rates at the time?</h2>
            <p>
              Germany-wide new housing loans · ECB / Deutsche Bundesbank · monthly history from 2003
            </p>
          </div>
        </div>
        <div className="padded">
          {rates.loading && <p>Loading historical rates…</p>}
          {rates.error && (
            <p className="notice warning">
              {rates.error} <button onClick={rates.reload}>Retry</button>
            </p>
          )}
          {rate && (
            <>
              <div className="sales-rate-readout">
                <strong>{percent(rate.mean, 2)}</strong>
                <div>
                  <b>{rate.complete ? `${year} average` : `${year} available-month average`}</b>
                  <p>
                    {rate.months} of {rate.expected} months available · monthly range{' '}
                    {percent(rate.min, 2)}–{percent(rate.max, 2)}
                  </p>
                </div>
              </div>
              <LineChart
                points={series!.observations
                  .filter((o) => o.period.startsWith(year))
                  .map((o) => ({ label: o.period, value: o.value }))}
                valueLabel={(n) => percent(n, 2)}
                label={`Monthly German mortgage rates in ${year}`}
              />
              {!rate.complete && (
                <p className="notice warning">
                  Incomplete year: only {rate.first} to {rate.last} is available. This is not a
                  full-year average.
                </p>
              )}
            </>
          )}
          <p className="microcopy">
            Arithmetic mean of published monthly AAR/NDER observations, equally weighted by month,
            excluding non-interest fees. Not a local borrower average, a bank quote, or the actual
            financing rate paid by a property's buyer. Observation dates are not sale dates.
          </p>
          {series && (
            <a
              className="source-link"
              href={`https://data.ecb.europa.eu/data/datasets/MIR/MIR.${series.key}`}
              target="_blank"
              rel="noreferrer"
            >
              Original ECB series <ExternalLink size={12} />
            </a>
          )}
        </div>
      </section>
      <section className="card" aria-label="Broader Munich price context">
        <div className="card-heading">
          <div>
            <h2>Broader context · Munich completed-sale statistics</h2>
            <p>Citywide reported means. These do not estimate 81245 or Neupasing.</p>
          </div>
        </div>
        <div className="padded">
          <label className="field">
            <span className="field-label">Munich property segment</span>
            <select value={segment} onChange={(e) => setSegment(e.target.value)}>
              {MUNICH_SEGMENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          {segment.startsWith('flat') && (
            <p className="microcopy">
              These retained municipal apartment means cover new builds. They do not establish a
              resale-apartment price for 81245; use the individually sourced references above for
              property details.
            </p>
          )}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Reported mean / m²</th>
                  <th>Sales in price sample</th>
                  <th>DE mortgage rate · {series?.label ?? 'selected fixation'}</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {MUNICH_REPORTS.map((report, index) => {
                  const average = rateInPeriod(series, `${report.year}-01`, `${report.year}-06`);
                  return (
                    <tr key={report.year}>
                      <td>{report.period}</td>
                      <td>{euro(priceSegment.values[index])}</td>
                      <td>Not disclosed here</td>
                      <td>
                        {average
                          ? `${percent(average.mean, 2)} · ${average.months}/6 months`
                          : 'Unavailable'}
                      </td>
                      <td>
                        <a href={report.url} target="_blank" rel="noreferrer">
                          Report p. 9 <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="microcopy">
            {priceSegment.notes} Provisional, rounded municipal price samples. Changing property mix
            and sizes affect comparisons. The source extracts do not disclose a segment count; no
            count is inferred from broader market totals.
          </p>
        </div>
      </section>
    </>
  );
}
