import { useRef, useState } from 'react';
import {
  Search,
  MapPin,
  ExternalLink,
  ArrowUpRight,
  Plus,
  Trash2,
  Upload,
  Download,
  Info,
  Mountain,
  RefreshCw,
} from 'lucide-react';
import { LineChart } from '../components/Charts';
import { NumberField } from '../components/InputsPanel';
import { downloadFile } from '../components/PlanResults';
import { BAVARIA_LINKS, BAVARIA_REVIEWED, MUNICH_REPORTS, MUNICH_SEGMENTS } from '../data/bavaria';
import { availableNrwTowns, NRW_WITHHELD } from '../data/nrwQuality';
import { euro, percent, type Inputs } from '../lib/mortgage';
import {
  STATE_KEYS,
  NRW_TYPES,
  median,
  validComparable,
  type Comparable,
  type Locality,
  type NrwData,
  type HousePrices,
} from '../lib/location';
import { useDataset } from '../lib/useDataset';
import { readLocal, writeLocal } from '../lib/storage';

const validatePrices = (v: unknown) => {
  const d = v as HousePrices;
  return (
    !!d &&
    Array.isArray(d.observations) &&
    d.observations.length >= 8 &&
    d.observations.every(
      (o) => /^\d{4}-Q[1-4]$/.test(o.period) && Number.isFinite(o.value) && o.value > 0,
    )
  );
};
const validateNrw = (v: unknown) => {
  const d = v as NrwData;
  return (
    !!d &&
    d.schemaVersion === 1 &&
    !!d.towns &&
    Array.isArray(d.zones) &&
    Array.isArray(d.history) &&
    d.zones.every((z) => Array.isArray(z) && z.length === 10 && Number.isFinite(z[7]))
  );
};
const cache = new Map<string, Locality[]>();

export default function Location({
  inputs,
  update,
  goCalculator,
}: {
  inputs: Inputs;
  update: (p: Partial<Inputs>) => void;
  goCalculator: () => void;
}) {
  const [query, setQuery] = useState('80331');
  const [results, setResults] = useState<Locality[]>([]),
    [place, setPlace] = useState<Locality | null>(null);
  const [searching, setSearching] = useState(false),
    [searchError, setSearchError] = useState('');
  const [area, setArea] = useState(90),
    [segment, setSegment] = useState('flatAverage'),
    [embed, setEmbed] = useState(false);
  const [nrwEnabled, setNrwEnabled] = useState(false);
  const [nationalRange, setNationalRange] = useState('all');
  const national = useDataset<HousePrices>('data/house-prices.json', validatePrices);
  const currentSegment = MUNICH_SEGMENTS.find((s) => s.id === segment)!;
  const selectPlace = (p: Locality) => {
    setPlace(p);
    setResults([]);
    update({ state: STATE_KEYS[p.federalState.key] ?? inputs.state });
  };
  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    if (searching || query.trim().length < 2) return;
    setSearching(true);
    setSearchError('');
    setResults([]);
    try {
      const q = query.trim().slice(0, 100),
        escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let entries = cache.get(q);
      if (!entries) {
        const params = new URLSearchParams({
          page: '1',
          pageSize: '20',
          ...(/^\d{5}$/.test(q) ? { postalCode: `^${q}$` } : { name: escaped }),
        });
        const response = await fetch(`https://openplzapi.org/de/Localities?${params}`, {
          signal: AbortSignal.timeout(12000),
        });
        if (!response.ok) throw new Error('Lookup failed');
        const raw: unknown = await response.json();
        if (!Array.isArray(raw)) throw new Error('Unexpected lookup response');
        entries = raw.filter(
          (p): p is Locality =>
            !!p &&
            typeof p.name === 'string' &&
            /^\d{5}$/.test(p.postalCode) &&
            !!STATE_KEYS[p.federalState?.key],
        );
        cache.set(q, entries);
      }
      if (!entries.length)
        setSearchError(
          'No places found. Try a five-digit postcode or the German place name, such as München.',
        );
      else setResults([...new Map(entries.map((p) => [`${p.name}-${p.postalCode}`, p])).values()]);
    } catch {
      setSearchError(
        'The public place lookup is unavailable. You can still explore Bavaria, use the calculator’s state selector and add your own local evidence.',
      );
    } finally {
      setSearching(false);
    }
  };
  const latest = national.data?.observations.at(-1),
    previousYear = national.data?.observations.at(-5);
  const filteredNational =
    national.data?.observations.filter(
      (o) => nationalRange === 'all' || Number(o.period.slice(0, 4)) >= Number(nationalRange),
    ) ?? [];
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <h1>Location research</h1>
          <p>Start in Bavaria. Follow the evidence all the way to the property.</p>
        </div>
        <span className="badge green">
          <Mountain size={14} />
          Bavaria first
        </span>
      </div>
      <section className="location-search card">
        <div className="search-copy">
          <MapPin size={21} />
          <div>
            <h2>Where would you like to live?</h2>
            <p>Look up a German postcode or town and use its state tax in your plan.</p>
          </div>
        </div>
        <form onSubmit={search} className="search-form">
          <label className="sr-only" htmlFor="place-query">
            Postcode or town
          </label>
          <Search size={18} />
          <input
            id="place-query"
            value={query}
            maxLength={100}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 80331 or München"
          />
          <button className="primary-button" disabled={searching || query.trim().length < 2}>
            {searching ? 'Searching…' : 'Find location'}
            <ArrowUpRight size={15} />
          </button>
        </form>
        <p className="microcopy">
          Explicit searches go to OpenPLZ. Financial inputs stay in your browser. Up to 20 matches
          are shown; use a postcode to narrow a large city.
        </p>
        {searchError && (
          <p className="notice warning" role="status">
            {searchError}
          </p>
        )}
        {results.length > 0 && (
          <div className="location-options" aria-label="Location results">
            {results.map((p) => (
              <button key={`${p.name}-${p.postalCode}`} onClick={() => selectPlace(p)}>
                <span>
                  <b>
                    {p.postalCode} · {p.name}
                  </b>
                  <small>
                    {p.federalState.name} {p.municipality?.name ? `· ${p.municipality.name}` : ''}
                  </small>
                </span>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
        )}
        {place && (
          <div className="selected-location">
            <MapPin size={17} />
            <b>
              {place.postalCode} {place.name}
            </b>
            <span>{place.federalState.name} · calculator state updated</span>
            <button className="text-button" onClick={goCalculator}>
              See financing →
            </button>
          </div>
        )}
      </section>
      <div className="location-two-col">
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>Put the asking price in context.</h2>
              <p>Uses the purchase price currently in your calculator.</p>
            </div>
          </div>
          <div className="padded">
            <div className="field-grid">
              <NumberField
                label="Living area · Wohnfläche"
                value={area}
                onChange={setArea}
                suffix="m²"
                min={1}
                max={10000}
              />
              <div className="price-per-metre">
                <span>Your target price / m²</span>
                <strong>{euro(inputs.price / area)}</strong>
                <small>
                  {euro(inputs.price)} ÷ {area} m²
                </small>
              </div>
            </div>
            <p className="microcopy">
              Check whether the quoted living area follows the applicable measurement rules.
              Balconies, roof slopes, land, parking and condition affect comparability.
            </p>
          </div>
        </section>
        <section className="bavaria-card">
          <Mountain size={29} />
          <h2>Go beyond the listing.</h2>
          <p>
            Use the official local committee, land values and the Bavarian market report. Some
            detailed records and reports require payment or a justified interest.
          </p>
          <p>Land reference values cover the land. They do not establish the value of a home.</p>
          <div className="inline-links">
            <a href={BAVARIA_LINKS.boris} target="_blank" rel="noreferrer">
              BORIS Bayern <ExternalLink size={13} />
            </a>
            <a href={BAVARIA_LINKS.committees} target="_blank" rel="noreferrer">
              Local committee <ExternalLink size={13} />
            </a>
          </div>
        </section>
      </div>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>A local history you can trace.</h2>
            <p>Municipal half-year reports · selected reported means in €/m² · H1 2024-H1 2026</p>
          </div>
          <span className="badge amber">Provisional samples</span>
        </div>
        <div className="padded">
          <label className="field">
            <span className="field-label">Property segment</span>
            <select value={segment} onChange={(e) => setSegment(e.target.value)}>
              {MUNICH_SEGMENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <LineChart
            points={MUNICH_REPORTS.map((r, i) => ({
              label: r.period,
              value: currentSegment.values[i],
            }))}
            valueLabel={(n) => euro(n)}
            label={`${currentSegment.label}: Munich reported half-year price means for 2024, 2025 and 2026`}
          />
          <div className="notice info">
            <Info size={17} />
            <p>
              {currentSegment.notes} These are Munich city samples, not values for your selected
              postcode. Housing mix and typical property sizes change; the line is not a
              constant-quality index or an individual valuation. Reports treat current half-year
              prices as provisional.
            </p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Observation period</th>
                  <th>Reported mean / m²</th>
                  <th>Original evidence</th>
                </tr>
              </thead>
              <tbody>
                {MUNICH_REPORTS.map((report, i) => (
                  <tr key={report.year}>
                    <td>{report.period}</td>
                    <td>{euro(currentSegment.values[i])}</td>
                    <td>
                      <a href={report.url} target="_blank" rel="noreferrer">
                        Municipal report · p. 9 <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="microcopy">
            Reviewed {BAVARIA_REVIEWED}; 2025 uses the corrected November publication. This selected
            factual extract is maintained manually. For newer publications and the full historical
            charts, check{' '}
            <a href={BAVARIA_LINKS.munich} target="_blank" rel="noreferrer">
              Munich’s report archive
            </a>
            .
          </p>
        </div>
      </section>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Explore the state’s own market dashboard.</h2>
            <p>
              2026 report · regional housing-price evidence, city/county comparisons and market
              activity.
            </p>
          </div>
          <a
            className="icon-button"
            href={BAVARIA_LINKS.dashboard}
            target="_blank"
            rel="noreferrer"
            aria-label="Open official Bavaria dashboard"
          >
            <ExternalLink size={18} />
          </a>
        </div>
        <div className="padded">
          <p className="body-copy">
            The official interactive dashboard gives access to Bavaria’s published local evidence.
            We link and embed the original so its methodology, updates and attribution stay visible.
            For Nürnberg, the{' '}
            <a href={BAVARIA_LINKS.nuremberg} target="_blank" rel="noreferrer">
              city’s market summary
            </a>{' '}
            also explains current completed-sale ranges and segment differences.
          </p>
          <button className="secondary-button" onClick={() => setEmbed(!embed)}>
            {embed ? 'Close embedded dashboard' : 'Load official interactive dashboard'}
            <ArrowUpRight size={15} />
          </button>
          <p className="microcopy">
            Loading the embed connects to Infogram, a third-party service used by the Bavarian
            publisher, and may use its cookies. You can instead open the original link above.
          </p>
          {embed && (
            <iframe
              className="official-dashboard"
              src={BAVARIA_LINKS.dashboardEmbed}
              title="Official Bavarian property market dashboard 2026"
              loading="lazy"
              referrerPolicy="no-referrer"
              allowFullScreen
            />
          )}
        </div>
      </section>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>How has the broader market moved?</h2>
            <p>
              Transaction-based house-price index · 2025 = 100. This is national, not a local €/m²
              estimate.
            </p>
          </div>
          <select
            aria-label="National history range"
            value={nationalRange}
            onChange={(e) => setNationalRange(e.target.value)}
          >
            <option value="all">Since 2015</option>
            <option value="2020">Since 2020</option>
            <option value="2023">Since 2023</option>
          </select>
        </div>
        <div className="padded">
          {national.loading && <p>Loading official historical data…</p>}
          {national.error && (
            <div className="notice warning">
              {national.error}
              <button onClick={national.reload}>Retry</button>
            </div>
          )}
          {latest && (
            <>
              <div className="index-stats">
                <div>
                  <span>
                    Latest · {latest.period}
                    {latest.status.includes('p') ? ' · provisional' : ''}
                  </span>
                  <b>{latest.value.toFixed(1)}</b>
                </div>
                <div>
                  <span>Year-on-year change</span>
                  <b>
                    {previousYear
                      ? `${percent((latest.value / previousYear.value - 1) * 100)}`
                      : 'Unavailable'}
                  </b>
                </div>
                <div>
                  <span>Geographic coverage</span>
                  <b>Germany overall</b>
                </div>
              </div>
              <LineChart
                points={filteredNational.map((o) => ({
                  label: `${o.period}${o.status.includes('p') ? '*' : ''}`,
                  value: o.value,
                }))}
                valueLabel={(n) => n.toFixed(1)}
                label="German national transaction house-price index from Eurostat / Destatis, base 2025 = 100"
              />
              <p className="microcopy">
                Eurostat / Destatis · * provisional. Source update: {national.data!.sourceUpdated}.
                Retrieved {national.data!.retrievedAt.slice(0, 10)}.{' '}
                <a href={national.data!.url} target="_blank" rel="noreferrer">
                  Original data
                </a>
                . National change cannot establish the past sale value of a particular home.
              </p>
            </>
          )}
        </div>
      </section>
      <Comparables targetPrice={inputs.price} area={area} place={place} />
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>NRW · local property reference values</h2>
            <p>Actual official norm-property reference records and historical summaries.</p>
          </div>
        </div>
        {nrwEnabled ? (
          <NrwPanel place={place} />
        ) : (
          <div className="padded">
            <p className="body-copy">
              Beyond Bavaria, explore over 380 NRW municipalities in the retained source files.
              Ambiguous source locations are withheld. The detailed dataset loads on request.
            </p>
            <button className="secondary-button" onClick={() => setNrwEnabled(true)}>
              Load NRW reference data <Download size={15} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function NrwPanel({ place }: { place: Locality | null }) {
  const nrw = useDataset<NrwData>('data/nrw.json', validateNrw);
  const [municipality, setMunicipality] = useState(
    place?.federalState.key === '05' &&
      !NRW_WITHHELD.some((item) => item.key === place.municipality?.key)
      ? (place.municipality?.key ?? '05315000')
      : '05315000',
  );
  const [type, setType] = useState(1),
    [group, setGroup] = useState('3'),
    [district, setDistrict] = useState('');
  const data = nrw.data;
  if (!data)
    return (
      <div className="padded">
        {nrw.loading ? 'Loading official residential reference records…' : nrw.error}
        <button className="text-button" onClick={nrw.reload}>
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  const towns = availableNrwTowns(data.towns);
  const attributable = towns.some(([key]) => key === municipality);
  const zones = data.zones.filter(
    (z) =>
      attributable &&
      z[0] === municipality &&
      z[3] === type &&
      z[4] === group &&
      z[2].toLowerCase().includes(district.toLowerCase()),
  );
  const history = data.history
    .filter(
      (h) =>
        attributable && h.municipality === municipality && h.type === type && h.group === group,
    )
    .sort((a, b) => a.year - b.year);
  const med = median(zones.map((z) => z[7]));
  return (
    <div className="padded">
      <details className="notice warning">
        <summary>
          {Object.keys(data.towns).length - towns.length} ambiguous source locations withheld
        </summary>
        <p>
          Some source municipality names conflict with the OpenPLZ directory's official keys. Their
          reference records and historical summaries are hidden until attribution is resolved. No
          values have been reassigned. Reviewed 25 October 2026.
        </p>
        <ul>
          {NRW_WITHHELD.map((item) => (
            <li key={item.key}>
              {item.key}: source “{item.source}”; directory “{item.directory}”.
            </li>
          ))}
        </ul>
        <a
          href="https://openplzapi.org/de/FederalStates/05/Municipalities?pageSize=50"
          target="_blank"
          rel="noreferrer"
        >
          Check the municipality directory
        </a>
      </details>
      <div className="filter-grid">
        <label className="field">
          <span className="field-label">Municipality</span>
          <select value={municipality} onChange={(e) => setMunicipality(e.target.value)}>
            {towns
              .sort((a, b) => a[1].localeCompare(b[1], 'de'))
              .map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Property type</span>
          <select value={type} onChange={(e) => setType(Number(e.target.value))}>
            {Object.entries(NRW_TYPES).map(([id, text]) => (
              <option key={id} value={id}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Sale category</span>
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="3">Resale</option>
            <option value="1">New build</option>
            <option value="2">First sale after conversion</option>
            <option value="4">Resale after conversion</option>
          </select>
        </label>
      </div>
      <div className="index-stats">
        <div>
          <span>Matching reference records</span>
          <b>{zones.length}</b>
        </div>
        <div>
          <span>Median reference value</span>
          <b>{med === null ? 'No data' : `${euro(med)} / m²`}</b>
        </div>
        <div>
          <span>Source snapshot</span>
          <b>{data.retrievedAt.slice(0, 10)}</b>
        </div>
      </div>
      <p className="notice info">
        These are reference values for specified norm properties, not sale records, asking prices or
        appraisals. Published municipality medians below are unweighted; coverage and norm
        properties change between years. They are not a like-for-like price index.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reference year</th>
              <th>Median / m²</th>
              <th>Records</th>
              <th>Published range / m²</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td>{h.year}</td>
                <td>{euro(h.median)}</td>
                <td>{h.count}</td>
                <td>
                  {euro(h.min)} - {euro(h.max)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label className="field">
        <span className="field-label">Filter current reference records by district</span>
        <input
          type="search"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="District name"
        />
      </label>
      <div className="table-wrap zone-table">
        <table>
          <thead>
            <tr>
              <th>Zone / district</th>
              <th>Reference / m²</th>
              <th>Norm build year</th>
              <th>Norm area m²</th>
              <th>Valuation date</th>
            </tr>
          </thead>
          <tbody>
            {zones.slice(0, 150).map((z, i) => (
              <tr key={i}>
                <td>
                  {z[1]} · {z[2] || 'Not specified'}
                </td>
                <td>{euro(z[7])}</td>
                <td>{z[5] || 'Not specified'}</td>
                <td>{z[6] || 'Not specified'}</td>
                <td>{z[8]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!zones.length && (
        <p className="microcopy">
          No records for this combination. Try another property type or sale category. Missing is
          not zero.
        </p>
      )}
      <p className="microcopy">
        Showing up to 150 of {zones.length} matching reference records. Other norm-property
        attributes apply; check{' '}
        <a href="https://www.boris.nrw.de/" target="_blank" rel="noreferrer">
          BORIS.NRW
        </a>{' '}
        before comparing an individual property. Source: NRW valuation committees via
        OpenGeodata.NRW · dl-de/zero-2-0.
      </p>
    </div>
  );
}

function Comparables({
  targetPrice,
  area,
  place,
}: {
  targetPrice: number;
  area: number;
  place: Locality | null;
}) {
  const [records, setRecords] = useState<Comparable[]>(() => {
    const r = readLocal<unknown>('zuhause-evidence', []);
    return Array.isArray(r) ? r.filter(validComparable).slice(0, 500) : [];
  });
  const [adding, setAdding] = useState(false),
    [message, setMessage] = useState(''),
    [locationFilter, setLocationFilter] = useState('');
  const [kind, setKind] = useState<'asking' | 'sale'>('asking'),
    [propertyType, setPropertyType] = useState<'apartment' | 'house'>('apartment');
  const [since, setSince] = useState('2020-01-01');
  const fileRef = useRef<HTMLInputElement>(null);
  const save = (next: Comparable[]) => {
    setRecords(next);
    if (!writeLocal('zuhause-evidence', next))
      setMessage('Browser storage unavailable. Export your evidence to keep it after this visit.');
  };
  const filtered = records
    .filter(
      (r) =>
        r.kind === kind &&
        r.type === propertyType &&
        r.date >= since &&
        r.location.toLowerCase().includes(locationFilter.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const med = median(filtered.map((r) => r.price / r.area));
  return (
    <section className="card">
      <div className="card-heading">
        <div>
          <h2>Build a comparison you can defend.</h2>
          <p>
            Keep asking prices and documented sales separate. Save sources, dates and property
            details.
          </p>
        </div>
        <button className="secondary-button" onClick={() => setAdding(!adding)}>
          <Plus size={15} />
          Add evidence
        </button>
      </div>
      <div className="padded">
        <div className="notice info">
          <Info size={17} />
          <p>
            Only evidence you add is included. Records stay on this device, and are not
            independently verified. Use comparable property types, sizes, condition and dates; a
            median of a small or mixed sample is not a valuation.
          </p>
        </div>
        {adding && (
          <form
            className="evidence-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const record: Comparable = {
                id: crypto.randomUUID(),
                location: String(f.get('location')).trim(),
                date: String(f.get('date')),
                price: Number(f.get('price')),
                area: Number(f.get('area')),
                kind: f.get('kind') as Comparable['kind'],
                type: f.get('type') as Comparable['type'],
                source: String(f.get('source')).trim(),
                notes: String(f.get('notes')).trim(),
              };
              if (!validComparable(record)) {
                setMessage(
                  'Check the location, date, positive price and area, and a full http(s) source URL.',
                );
                return;
              }
              if (records.length >= 500) {
                setMessage('Limit: 500 records. Export or remove records before adding more.');
                return;
              }
              save([...records, record]);
              setAdding(false);
              setMessage('Evidence added on this device.');
            }}
          >
            <div className="filter-grid">
              <label className="field">
                <span className="field-label">Location / postcode</span>
                <input
                  name="location"
                  defaultValue={place ? `${place.postalCode} ${place.name}` : ''}
                  required
                  maxLength={150}
                  placeholder="e.g. 80331 München"
                />
              </label>
              <label className="field">
                <span className="field-label">Observation date</span>
                <input
                  type="date"
                  name="date"
                  required
                  max={new Date().toISOString().slice(0, 10)}
                />
              </label>
              <label className="field">
                <span className="field-label">Evidence kind</span>
                <select name="kind">
                  <option value="asking">Asking price</option>
                  <option value="sale">Documented sale</option>
                </select>
              </label>
            </div>
            <div className="filter-grid">
              <label className="field">
                <span className="field-label">Price in €</span>
                <input name="price" type="number" required min={1} max={100000000} step="any" />
              </label>
              <label className="field">
                <span className="field-label">Living area in m²</span>
                <input name="area" type="number" required min={1} max={100000} step="any" />
              </label>
              <label className="field">
                <span className="field-label">Property type</span>
                <select name="type">
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span className="field-label">Evidence URL</span>
              <input type="url" name="source" required maxLength={2000} placeholder="https://…" />
            </label>
            <label className="field">
              <span className="field-label">Condition, build year, notes</span>
              <textarea name="notes" maxLength={2000} rows={2} />
            </label>
            <button className="primary-button">Save evidence</button>
          </form>
        )}
        <div className="filter-grid">
          <label className="field">
            <span className="field-label">Location filter</span>
            <input
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Filter your records by town / postcode"
            />
          </label>
          <label className="field">
            <span className="field-label">Price basis</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
              <option value="asking">Asking prices only</option>
              <option value="sale">Documented sales only</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Property type</span>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as typeof propertyType)}
            >
              <option value="apartment">Apartments only</option>
              <option value="house">Houses only</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Observed on or after</span>
            <input type="date" value={since} onChange={(e) => setSince(e.target.value)} />
          </label>
        </div>
        <div className="index-stats">
          <div>
            <span>Matching records</span>
            <b>{filtered.length}</b>
          </div>
          <div>
            <span>Sample median / m²</span>
            <b>{med === null ? 'Add evidence' : euro(med)}</b>
          </div>
          <div>
            <span>Target vs sample median</span>
            <b>
              {med === null
                ? 'No comparison yet'
                : `${targetPrice / area >= med ? '+' : ''}${percent((targetPrice / area / med - 1) * 100)}`}
            </b>
          </div>
        </div>
        {filtered.length < 5 && (
          <p className="microcopy">
            Limited evidence: fewer than five matching observations. A larger, well-matched sample
            is more informative; a record labelled “sale” still depends on your source.
          </p>
        )}
        {filtered.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Location / date</th>
                  <th>Price</th>
                  <th>€/m²</th>
                  <th>Area</th>
                  <th>Evidence</th>
                  <th>
                    <span className="sr-only">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <b>{r.location}</b>
                      <small>
                        {r.date} · {r.notes}
                      </small>
                    </td>
                    <td>{euro(r.price)}</td>
                    <td>{euro(r.price / r.area)}</td>
                    <td>{r.area} m²</td>
                    <td>
                      <a href={r.source} target="_blank" rel="noreferrer">
                        Source <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={`Remove evidence for ${r.location} dated ${r.date}`}
                        onClick={() => save(records.filter((x) => x.id !== r.id))}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state small">
            <MapPin size={27} />
            <h3>Your evidence starts here.</h3>
            <p>Add a listing, a documented sale or an observation you can source.</p>
          </div>
        )}
        <div className="result-actions">
          <button
            className="secondary-button"
            onClick={() =>
              downloadFile(
                'zuhause-local-evidence.json',
                JSON.stringify({ schemaVersion: 1, records }, null, 2),
                'application/json',
              )
            }
          >
            <Download size={15} />
            Export evidence
          </button>
          <button className="secondary-button" onClick={() => fileRef.current?.click()}>
            <Upload size={15} />
            Import evidence JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 2000000) throw new Error();
                const data = JSON.parse(await file.text());
                if (
                  data.schemaVersion !== 1 ||
                  !Array.isArray(data.records) ||
                  data.records.length > 500 ||
                  !data.records.every(validComparable)
                )
                  throw new Error();
                const merged = [
                  ...new Map(
                    [...records, ...data.records].map((r: Comparable) => [r.id, r]),
                  ).values(),
                ];
                if (merged.length > 500) throw new Error();
                save(merged);
                setMessage('Evidence imported and merged by record ID.');
              } catch {
                setMessage(
                  'Import rejected. Use a valid Zuhause evidence export (up to 500 records and 2 MB).',
                );
              }
              e.target.value = '';
            }}
          />
        </div>
        {message && (
          <p className="microcopy" role="status">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
