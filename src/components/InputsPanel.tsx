import { useId, useState } from 'react';
import {
  Building2,
  ChevronDown,
  CircleHelp,
  Coins,
  RotateCcw,
  Wallet,
  SlidersHorizontal,
} from 'lucide-react';
import { BOUNDS, DEFAULTS, euro, percent, type Inputs } from '../lib/mortgage';
import { STATES } from '../data/germany';

export function NumberField({
  label,
  value,
  onChange,
  suffix = '€',
  hint,
  min = 0,
  max = 20000000,
  step = 1,
  slider = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  slider?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {hint && (
          <span className="help" tabIndex={0} aria-label={hint}>
            <CircleHelp size={13} />
            <span role="tooltip">{hint}</span>
          </span>
        )}
      </label>
      <div className="number-box">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={draft ?? value}
          onChange={(e) => {
            setDraft(e.target.value);
            const v = Number(e.target.value);
            if (e.target.value && Number.isFinite(v) && v >= min && v <= max) onChange(v);
          }}
          onBlur={() => {
            if (draft !== null) onChange(Math.min(max, Math.max(min, Number(draft) || min)));
            setDraft(null);
          }}
        />
        <span>{suffix}</span>
      </div>
      {slider && (
        <input
          className="slider"
          aria-label={`${label} slider`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ '--range': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
        />
      )}
    </div>
  );
}

export default function InputsPanel({
  inputs,
  update,
  onReset,
}: {
  inputs: Inputs;
  update: (patch: Partial<Inputs>) => void;
  onReset: () => void;
}) {
  const state = STATES.find((s) => s.id === inputs.state)!;
  const field = (
    key: Exclude<keyof Inputs, 'state'>,
    label: string,
    options: Partial<React.ComponentProps<typeof NumberField>> = {},
  ) => (
    <NumberField
      label={label}
      value={inputs[key]}
      onChange={(value) => update({ [key]: value })}
      min={BOUNDS[key][0]}
      max={BOUNDS[key][1]}
      {...options}
    />
  );
  return (
    <section className="card inputs-card" aria-label="Mortgage inputs">
      <div className="card-heading">
        <div>
          <h2>Your starting point</h2>
          <p>Starting inputs are examples. Enter your own quote or use the market data.</p>
        </div>
        <button
          className="icon-button"
          onClick={onReset}
          aria-label="Reset calculator"
          title="Reset to example"
        >
          <RotateCcw size={17} />
        </button>
      </div>
      <details className="input-section" open>
        <summary>
          <span className="section-number">
            <Building2 size={16} />
          </span>
          <div>
            <b>The property</b>
            <small>Kaufpreis & Kaufnebenkosten</small>
          </div>
          <ChevronDown size={16} />
        </summary>
        <div className="section-content">
          {field('price', 'Purchase price', {
            step: 5000,
            hint: 'The agreed property price, before taxes, fees and renovation.',
          })}
          <div className="field">
            <label htmlFor="state">
              Federal state <span className="muted">Bundesland</span>
            </label>
            <select
              id="state"
              value={inputs.state}
              onChange={(e) => update({ state: e.target.value })}
            >
              {STATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="tax-note">
            <span>Property transfer tax</span>
            <b>
              {percent(state.tax)} <span>· {euro((inputs.price * state.tax) / 100)}</span>
            </b>
          </div>
          <div className="field-grid">
            {field('notaryRate', 'Notary & land registry', {
              suffix: '%',
              step: 0.1,
              hint: 'Combined planning allowance, not a statutory flat fee. Actual costs depend on the transaction and GNotKG.',
            })}
            {field('brokerRate', 'Buyer’s broker fee', {
              suffix: '%',
              step: 0.01,
              hint: 'Your share including VAT. Enter 0 for a purchase without a broker. 3.57% is an editable example, not a legal requirement.',
            })}
          </div>
          {field('renovation', 'Renovation & moving budget', { step: 1000 })}
        </div>
      </details>
      <details className="input-section" open>
        <summary>
          <span className="section-number">
            <Coins size={16} />
          </span>
          <div>
            <b>Your financing</b>
            <small>Eigenkapital, Zins & Tilgung</small>
          </div>
          <ChevronDown size={16} />
        </summary>
        <div className="section-content">
          <div className="field-grid">
            {field('savings', 'Available savings', { step: 1000 })}
            {field('reserve', 'Keep as cash reserve', {
              step: 1000,
              hint: 'Cash you keep out of the purchase for emergencies. This is subtracted from available savings.',
            })}
          </div>
          <div className="field-grid">
            {field('interest', 'Interest rate · Sollzins', {
              suffix: '%',
              step: 0.05,
              hint: 'Annual nominal borrowing rate. The starting 3.75% is illustrative. Use a lender quote or explicitly apply a market benchmark.',
            })}
            {field('repayment', 'Initial repayment · Tilgung', {
              suffix: '%',
              step: 0.1,
              hint: 'Annual initial principal repayment as a percentage of the original loan. This is added to interest to calculate the regular payment.',
            })}
          </div>
          <div className="field">
            <label htmlFor="fixed">
              Fixed-rate period <span className="muted">Zinsbindung</span>
            </label>
            <div className="segmented" id="fixed" role="group" aria-label="Fixed-rate period">
              {[5, 10, 15, 20].map((years) => (
                <button
                  key={years}
                  className={inputs.fixedYears === years ? 'selected' : ''}
                  onClick={() =>
                    update({
                      fixedYears: years,
                      targetYears: Math.max(inputs.targetYears, years + 1),
                    })
                  }
                >
                  {years} years
                </button>
              ))}
            </div>
          </div>
          <p className="microcopy">
            Your rate is fixed for {inputs.fixedYears} years. Any balance left will need a new
            financing plan.
          </p>
        </div>
      </details>
      <details className="input-section">
        <summary>
          <span className="section-number">
            <Wallet size={16} />
          </span>
          <div>
            <b>Your monthly comfort zone</b>
            <small>Income, living costs & upkeep</small>
          </div>
          <ChevronDown size={16} />
        </summary>
        <div className="section-content">
          {field('income', 'Household take-home income', { step: 100 })}
          {field('living', 'Other monthly living costs', {
            step: 50,
            hint: 'Food, transport, childcare, other debt and regular spending. Exclude current rent if buying will replace it.',
          })}
          <div className="field-grid">
            {field('running', 'Property running costs', {
              step: 25,
              hint: 'Utilities, insurance, property tax and administration. For flats, include relevant Hausgeld, avoiding double counting.',
            })}
            {field('maintenance', 'Maintenance reserve', {
              step: 25,
              hint: 'A monthly planning allowance for repairs and special assessments. Avoid counting a WEG reserve twice if already in Hausgeld.',
            })}
          </div>
        </div>
      </details>
      <details className="input-section">
        <summary>
          <span className="section-number">
            <SlidersHorizontal size={16} />
          </span>
          <div>
            <b>Plan the years ahead</b>
            <small>Extra repayments & refinancing</small>
          </div>
          <ChevronDown size={16} />
        </summary>
        <div className="section-content">
          {field('extraAnnual', 'Annual extra repayment', {
            step: 500,
            hint: 'Paid at each year end during the fixed-rate period. Check your contract’s Sondertilgung limits; the calculator does not assume the lender permits it.',
          })}
          {field('refinanceRate', 'Future refinancing rate', {
            suffix: '%',
            step: 0.1,
            hint: 'A scenario assumption, not a forecast. Applies after the fixed-rate period.',
          })}
          {field('targetYears', 'Total target repayment period', {
            suffix: 'years',
            min: inputs.fixedYears + 1,
            step: 1,
            hint: 'Measured from the start of the mortgage. The refinancing payment is recalculated to repay the remaining balance within this total period.',
          })}
          <button
            className="text-button"
            onClick={() =>
              update({
                extraAnnual: DEFAULTS.extraAnnual,
                refinanceRate: DEFAULTS.refinanceRate,
                targetYears: DEFAULTS.targetYears,
              })
            }
          >
            Restore long-term assumptions
          </button>
        </div>
      </details>
      <div className="input-footer">Recalculates as you edit. No account needed.</div>
    </section>
  );
}
