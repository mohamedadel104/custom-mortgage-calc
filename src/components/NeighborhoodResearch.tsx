import { useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import {
  NEUPASING_DEVELOPMENTS,
  NEUPASING_QUARTER,
  NEUPASING_REVIEWED,
  HISTORICAL_PROJECT_PRICES,
  HISTORICAL_PROJECT_PRICE_SOURCE,
  developmentCoverage,
} from '../data/neupasing';
import { euro, percent } from '../lib/mortgage';
import { rateInPeriod } from '../lib/sales';
import type { RateSeries } from '../lib/rates';
import { downloadFile } from './PlanResults';

export default function NeighborhoodResearch({ series }: { series: RateSeries | undefined }) {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState('all');
  const coverage = developmentCoverage(NEUPASING_DEVELOPMENTS);
  const matching = NEUPASING_DEVELOPMENTS.filter(
    (r) =>
      filter === 'all' ||
      (filter === 'retail' ? r.retailSoldReported !== null : r.blockAcquiredHomes !== null),
  );
  const visible = showAll ? matching : matching.slice(0, 4);
  return (
    <section className="card neighborhood-research" aria-label="Neupasing apartment developments">
      <div className="card-heading">
        <div>
          <h2>Neupasing · the scale of the apartment market</h2>
          <p>Paul-Gerhardt-Allee quarter · project evidence within your 81245 focus</p>
        </div>
      </div>
      <div className="padded">
        <div className="sales-stats neighborhood-stats">
          <div>
            <span>Homes in the whole quarter</span>
            <strong>≈{NEUPASING_QUARTER.homes.toLocaleString('en-GB')}</strong>
            <small>Municipal stock count · includes rental housing</small>
          </div>
          <div>
            <span>Sold / handed over to owners</span>
            <strong>{coverage.retailSoldReported}</strong>
            <small>Developer reports · @home + Belvedere</small>
          </div>
          <div>
            <span>Homes in one block purchase</span>
            <strong>{coverage.blockAcquiredHomes}</strong>
            <small>Announced 2024 · institutional acquisition</small>
          </div>
          <div>
            <span>Project / subset records reviewed</span>
            <strong>{coverage.records}</strong>
            <small>Selected coverage · not every local development</small>
          </div>
        </div>
        <p className="sales-coverage-line">
          <b>Thousands of homes; far fewer public individual prices.</b> Construction, developer
          sell-out and individual price disclosure answer different questions. The smaller reference
          sample below is not the area’s sales total.
        </p>
        <a className="source-link" href={NEUPASING_QUARTER.url} target="_blank" rel="noreferrer">
          Munich’s official quarter overview · {NEUPASING_QUARTER.hectares} hectares{' '}
          <ExternalLink size={12} />
        </a>
        <div className="research-jumps" aria-label="Research sections">
          <button
            className="text-button"
            onClick={() => document.getElementById('individual-sales')?.scrollIntoView()}
          >
            Individual apartment prices ↓
          </button>
          <button
            className="text-button"
            onClick={() => document.getElementById('mortgage-history')?.scrollIntoView()}
          >
            Historical mortgage rates ↓
          </button>
        </div>
        <div className="development-heading">
          <h3>Development and acquisition records</h3>
          <label className="field">
            <span className="field-label">Development evidence</span>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setShowAll(false);
              }}
            >
              <option value="all">All reviewed records</option>
              <option value="retail">Reported sold / handed over</option>
              <option value="block">Documented block purchases</option>
            </select>
          </label>
        </div>
        <div className="development-list">
          {visible.map((project) => (
            <article key={project.id} className="development-row">
              <div className="development-identity">
                <h3>{project.name}</h3>
                <p>{project.location}</p>
              </div>
              <div className="development-count">
                <strong>
                  {project.id === 'artec-wa7' ? '≈' : ''}
                  {project.homes}
                </strong>
                <span>homes in this record</span>
              </div>
              <div className="development-evidence">
                <b>{project.status}</b>
                <p>{project.completion}</p>
                <details>
                  <summary>Scope & original sources</summary>
                  <p>
                    {project.countBasis}. {project.notes}
                  </p>
                  <div className="development-sources">
                    {project.sources.map((source) => (
                      <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                        {source.publisher} <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </details>
              </div>
            </article>
          ))}
        </div>
        {matching.length > 4 && (
          <button className="text-button development-more" onClick={() => setShowAll(!showAll)}>
            {showAll
              ? 'Show first four records'
              : `Show all ${matching.length} development records`}
          </button>
        )}
        <p className="microcopy">
          Reviewed 25 Oct 2026. The ≈2,400 quarter total includes these developments. The 295
          developer-reported sales/handover units and the 68-home block purchase are different
          measures; neither discloses closing prices. Individual references can overlap these
          projects. These counts must not be added into a total transaction count.
        </p>
        <details className="project-price-history">
          <summary>Historic new-build asking prices · 2017 projects with mortgage context</summary>
          <p className="microcopy">
            A contemporary broker review published on 19 September 2017 records these advertised
            ranges. The rates match the publication month, not an undisclosed sale date. Fixation
            category follows the rate selector below: {series?.label ?? 'loading rates'}.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Advertised range / m²</th>
                  <th>Sep 2017 mortgage average · DE</th>
                </tr>
              </thead>
              <tbody>
                {HISTORICAL_PROJECT_PRICES.map((item) => {
                  const month = item.publishedAt.slice(0, 7);
                  const rate = rateInPeriod(series, month, month);
                  return (
                    <tr key={item.projectId}>
                      <td>{item.project}</td>
                      <td>
                        {euro(item.low)}–{euro(item.high)}
                      </td>
                      <td>{rate ? percent(rate.mean, 2) : 'Unavailable'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <a
            className="source-link"
            href={HISTORICAL_PROJECT_PRICE_SOURCE.url}
            target="_blank"
            rel="noreferrer"
          >
            {HISTORICAL_PROJECT_PRICE_SOURCE.publisher} <ExternalLink size={12} />
          </a>
          <p className="microcopy">
            Asking ranges from selected project listings, not a verified sale-price series or a
            constant-quality price index. No mean or price growth is inferred from these ranges.
          </p>
        </details>
        <button
          className="secondary-button"
          onClick={() =>
            downloadFile(
              'neupasing-development-evidence.json',
              JSON.stringify(
                {
                  schemaVersion: 1,
                  reviewedAt: NEUPASING_REVIEWED,
                  quarter: NEUPASING_QUARTER,
                  developments: NEUPASING_DEVELOPMENTS,
                  historicalAskingRanges: HISTORICAL_PROJECT_PRICES,
                  historicalPriceSource: HISTORICAL_PROJECT_PRICE_SOURCE,
                },
                null,
                2,
              ),
              'application/json',
            )
          }
        >
          <Download size={14} /> Export neighborhood evidence
        </button>
      </div>
    </section>
  );
}
