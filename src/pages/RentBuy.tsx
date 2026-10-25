import { useState } from 'react';
import { ArrowLeftRight, Info } from 'lucide-react';
import { NumberField } from '../components/InputsPanel';
import { LineChart } from '../components/Charts';
import { euro, type Inputs } from '../lib/mortgage';
import { RENT_DEFAULTS, rentVsBuy, type RentBuyAssumptions } from '../lib/rentBuy';

export default function RentBuy({ inputs }: { inputs: Inputs }) {
  const [a, setA] = useState(RENT_DEFAULTS),
    [view, setView] = useState<'buyer' | 'renter'>('buyer');
  const result = rentVsBuy(inputs, a);
  const field = (
    key: keyof RentBuyAssumptions,
    label: string,
    suffix = '%',
    min = 0,
    max = 20,
    step = 0.5,
  ) => (
    <NumberField
      key={key}
      label={label}
      suffix={suffix}
      min={min}
      max={max}
      step={step}
      value={a[key]}
      onChange={(v) => setA({ ...a, [key]: v })}
    />
  );
  const difference = result.end.buyerWealth - result.end.renterWealth;
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <h1>Rent versus buy</h1>
          <p>A transparent comparison of housing equity and investing the cash-flow difference.</p>
        </div>
        <ArrowLeftRight size={30} className="title-icon" />
      </div>
      <div className="notice info">
        <Info size={17} />
        <p>
          Uses your current calculator property and mortgage. Both paths invest any monthly cost
          advantage at the same assumed return. The renter also invests the cash you would have put
          into the purchase. Common unused savings and your emergency reserve are excluded from both
          sides.
        </p>
      </div>
      <div className="location-two-col">
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>Make the assumptions explicit.</h2>
              <p>All future growth and returns are scenarios.</p>
            </div>
          </div>
          <div className="padded">
            <div className="field-grid">
              {field('rent', 'Monthly cold rent', '€', 0, 100000, 50)}
              {field('tenantCosts', 'Tenant running costs', '€', 0, 10000, 25)}
              {field('rentGrowth', 'Annual rent growth')}
              {field('homeGrowth', 'Annual property growth', '%', -10, 15, 0.5)}
              {field('investmentReturn', 'Annual investment return', '%', -10, 20, 0.5)}
              {field('costGrowth', 'Annual running-cost growth')}
              {field('sellingCost', 'Selling costs', '%', 0, 15, 0.5)}
              {field('years', 'Compare after', 'years', 1, 40, 1)}
            </div>
          </div>
        </section>
        <section className="payment-card wealth-card">
          <h2>{difference >= 0 ? 'Buying' : 'Renting'} leads by</h2>
          <strong>{euro(Math.abs(difference))}</strong>
          <p>After {a.years} years, under your assumptions and estimated selling costs.</p>
          <dl>
            <div>
              <dt>Projected property value</dt>
              <dd>{euro(result.end.homeValue)}</dd>
            </div>
            <div>
              <dt>Estimated selling costs</dt>
              <dd>{euro((result.end.homeValue * a.sellingCost) / 100)}</dd>
            </div>
            <div>
              <dt>Net property equity after sale</dt>
              <dd>{euro(result.end.netHome)}</dd>
            </div>
            <div>
              <dt>Buyer’s investment portfolio</dt>
              <dd>{euro(result.end.buyerInvestments)}</dd>
            </div>
            <div>
              <dt>Buyer · net assets</dt>
              <dd>{euro(result.end.buyerWealth)}</dd>
            </div>
            <div>
              <dt>Renter · portfolio</dt>
              <dd>{euro(result.end.renterWealth)}</dd>
            </div>
            <div>
              <dt>Buyer’s remaining mortgage</dt>
              <dd>{euro(result.end.debt)}</dd>
            </div>
          </dl>
        </section>
      </div>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Net assets over time</h2>
          </div>
          <div className="segmented">
            <button className={view === 'buyer' ? 'selected' : ''} onClick={() => setView('buyer')}>
              Buyer
            </button>
            <button
              className={view === 'renter' ? 'selected' : ''}
              onClick={() => setView('renter')}
            >
              Renter
            </button>
          </div>
        </div>
        <div className="padded">
          <LineChart
            points={result.points.map((p) => ({
              label: `Year ${p.year}`,
              value: view === 'buyer' ? p.buyerWealth : p.renterWealth,
            }))}
            valueLabel={(n) => euro(n)}
            label={`${view} net assets under the entered rent-versus-buy assumptions`}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Buyer net assets</th>
                  <th>Renter portfolio</th>
                  <th>Difference · buyer minus renter</th>
                </tr>
              </thead>
              <tbody>
                {result.points
                  .filter((p) => p.year === 1 || p.year % 5 === 0 || p.year === a.years)
                  .map((p) => (
                    <tr key={p.year}>
                      <td>{p.year}</td>
                      <td>{euro(p.buyerWealth)}</td>
                      <td>{euro(p.renterWealth)}</td>
                      <td>{euro(p.buyerWealth - p.renterWealth)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <p className="fine-print">
        Nominal euros; no inflation adjustment. Assumes equal starting wealth and comparable homes,
        end-of-month contributions, reinvested returns, property growth on purchase price only, and
        a hypothetical sale at each horizon. Excludes investment taxes and fees, property
        capital-gains tax, prepayment penalties, subsidies, transaction timing and the value of
        housing flexibility. It assumes all cost differences can be funded; check household
        affordability separately. Returns and price growth are not forecasts.
      </p>
    </div>
  );
}
