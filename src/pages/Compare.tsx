import { GitCompareArrows, Plus, Trash2, Download, Upload } from 'lucide-react';
import { useRef } from 'react';
import { calculate, euro, percent, sanitizeInputs, type Inputs } from '../lib/mortgage';
import { downloadFile } from '../components/PlanResults';

export interface SavedPlan {
  id: string;
  name: string;
  inputs: Inputs;
  savedAt: string;
}
export default function Compare({
  plans,
  save,
  onChange,
  load,
  message,
}: {
  plans: SavedPlan[];
  save: () => void;
  onChange: (plans: SavedPlan[]) => void;
  load: (p: Inputs) => void;
  message: (text: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const rows: Array<[string, (r: ReturnType<typeof calculate>) => string]> = [
    ['Purchase price', (r) => euro(r.p.price)],
    ['State', (r) => r.state.name],
    ['Purchase costs', (r) => euro(r.buyingCosts)],
    ['Loan amount', (r) => euro(r.loan)],
    ['Savings kept aside', (r) => euro(r.p.savings - r.cashUsed)],
    ['Nominal interest', (r) => percent(r.p.interest, 2)],
    ['Initial repayment', (r) => percent(r.p.repayment)],
    ['Fixed period', (r) => `${r.p.fixedYears} years`],
    ['Mortgage / month', (r) => euro(r.payment)],
    ['All-in housing / month', (r) => euro(r.housing)],
    ['Left monthly · incl. extra saving', (r) => euro(r.surplus)],
    ['Debt when rate fix ends', (r) => euro(r.schedule.balanceAtFix)],
    ['Future rate assumption', (r) => percent(r.p.refinanceRate)],
    ['Refinanced payment / month', (r) => euro(r.schedule.refinancePayment)],
    ['Annual extra · fixed period', (r) => euro(r.p.extraAnnual)],
    ['Projected total interest', (r) => euro(r.schedule.totalInterest)],
    ['Target repayment period', (r) => `${r.p.targetYears} years`],
  ];
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <h1>Compare financing plans</h1>
          <p>Compare up to three scenarios. Save them on this device or export a backup.</p>
        </div>
        <button className="primary-button" onClick={save} disabled={plans.length >= 3}>
          <Plus size={16} />
          Save current plan
        </button>
      </div>
      {plans.length === 0 ? (
        <div className="card empty-state">
          <GitCompareArrows size={40} />
          <h2>One home. A few possible futures.</h2>
          <p>
            Save your plan, change the deposit, rate or repayment, then save another to see the
            difference.
          </p>
          <button className="primary-button" onClick={save}>
            Save your first scenario
          </button>
        </div>
      ) : (
        <section className="card">
          <div className="table-wrap compare-table">
            <table>
              <thead>
                <tr>
                  <th>Financing assumptions</th>
                  {plans.map((plan) => (
                    <th key={plan.id}>
                      <input
                        className="plan-name"
                        aria-label={`Scenario name: ${plan.name}`}
                        value={plan.name}
                        maxLength={50}
                        onChange={(e) =>
                          onChange(
                            plans.map((p) =>
                              p.id === plan.id ? { ...p, name: e.target.value } : p,
                            ),
                          )
                        }
                      />
                      <small>Saved {new Date(plan.savedAt).toLocaleDateString('en-GB')}</small>
                      <div className="plan-actions">
                        <button className="text-button" onClick={() => load(plan.inputs)}>
                          Load plan →
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Remove ${plan.name}`}
                          onClick={() => onChange(plans.filter((p) => p.id !== plan.id))}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, getValue]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    {plans.map((plan) => (
                      <td key={plan.id}>{getValue(calculate(plan.inputs))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <div className="result-actions">
        <button
          className="secondary-button"
          onClick={() =>
            downloadFile(
              'zuhause-scenarios.json',
              JSON.stringify({ schemaVersion: 1, plans }, null, 2),
              'application/json',
            )
          }
        >
          <Download size={15} />
          Export scenarios
        </button>
        <button className="secondary-button" onClick={() => fileRef.current?.click()}>
          <Upload size={15} />
          Import scenarios
        </button>
        <input
          type="file"
          ref={fileRef}
          accept=".json,application/json"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              if (file.size > 100000) throw new Error();
              const data = JSON.parse(await file.text());
              if (
                data.schemaVersion !== 1 ||
                !Array.isArray(data.plans) ||
                data.plans.length > 3 ||
                data.plans.some(
                  (p: SavedPlan) =>
                    !p || typeof p.name !== 'string' || !p.inputs || typeof p.inputs !== 'object',
                )
              )
                throw new Error();
              onChange(
                data.plans.map((p: SavedPlan) => ({
                  id: crypto.randomUUID(),
                  name: p.name.slice(0, 50),
                  inputs: sanitizeInputs(p.inputs),
                  savedAt: new Date().toISOString(),
                })),
              );
              message('Imported scenarios replace the comparison slots.');
            } catch {
              message(
                'Import rejected. Choose a valid Zuhause scenario export with at most three plans.',
              );
            }
            e.target.value = '';
          }}
        />
      </div>
      <p className="fine-print">
        Each saved plan includes its own assumptions. Official rate-data updates do not overwrite
        saved rates. Projections depend on the future refinancing rate entered in each plan.
      </p>
    </div>
  );
}
