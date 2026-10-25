import {
  ArrowDownToLine,
  ArrowUpRight,
  BookmarkPlus,
  CircleCheck,
  Info,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { calculate, euro, percent, scheduleCsv } from '../lib/mortgage';
import { DebtChart } from './Charts';

export function downloadFile(name: string, data: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function PlanResults({
  result: r,
  onSave,
}: {
  result: ReturnType<typeof calculate>;
  onSave: () => void;
}) {
  const p = r.p;
  const first = r.schedule.rows[0];
  const comfortable = r.surplus >= 500 && (r.burden ?? 100) < 40;
  return (
    <div className="results">
      <section className="payment-card">
        <div className="payment-top">
          <h2>Monthly mortgage payment</h2>
          <span className="subtle-pill">{p.fixedYears}-year fixed rate</span>
        </div>
        <div className="payment-amount">
          {euro(r.payment, 2)}
          <span>/ month</span>
        </div>
        <p>{euro(r.housing, 2)} including property running costs and maintenance.</p>
        <div className="payment-split">
          <div>
            <span className="dot light" />
            Interest <b>{euro(first?.interest ?? 0, 2)}</b>
          </div>
          <div>
            <span className="dot lime" />
            Principal repayment{' '}
            <b>
              {euro(
                Math.round(r.payment * 100) / 100 - Math.round((first?.interest ?? 0) * 100) / 100,
                2,
              )}
            </b>
          </div>
        </div>
        <div className="payment-bar">
          <span style={{ width: `${(p.interest / (p.interest + p.repayment)) * 100}%` }} />
        </div>
        <div className="payment-bottom">
          <ShieldCheck size={15} />
          <span>First month breakdown · excludes property running costs</span>
        </div>
      </section>
      <div className="stat-grid">
        <article className="card stat">
          <span>Loan you’ll need</span>
          <strong>{euro(r.loan)}</strong>
          <small>{percent(r.ltv)} of the purchase price</small>
        </article>
        <article className="card stat">
          <span>Upfront buying costs</span>
          <strong>{euro(r.buyingCosts)}</strong>
          <small>{percent((r.buyingCosts / p.price) * 100)} of the purchase price</small>
        </article>
        <article className="card stat">
          <span>Debt after {p.fixedYears} years</span>
          <strong>{euro(r.schedule.balanceAtFix)}</strong>
          <small>To repay or refinance</small>
        </article>
      </div>
      {p.reserve > p.savings && (
        <div className="notice warning">
          <TriangleAlert size={18} />
          <p>
            Your cash reserve exceeds your savings. The model uses no savings toward the purchase;
            the requested reserve is not fully funded.
          </p>
        </div>
      )}
      {r.cashAvailable < r.buyingCosts && (
        <div className="notice warning">
          <TriangleAlert size={18} />
          <p>
            Your usable savings do not cover buying costs. Financing these costs can be harder to
            obtain and may carry a higher rate.
          </p>
        </div>
      )}
      {r.ltv > 100 && (
        <div className="notice warning">
          <TriangleAlert size={18} />
          <p>
            The loan exceeds the property price. This plan depends on financing fees or renovation
            as well as the home. A lender may require more cash.
          </p>
        </div>
      )}
      <section className="card projection-card">
        <div className="card-heading">
          <div>
            <h2>Remaining debt over time</h2>
            <p>Blue: fixed-rate contract · Dashed: refinancing assumption</p>
          </div>
        </div>
        <DebtChart rows={r.schedule.rows} loan={r.loan} fixedYears={p.fixedYears} />
        <div className="projection-stats">
          <div>
            <span>Projected debt-free in</span>
            <b>
              {r.schedule.payoffMonths === null
                ? 'Beyond 60 years'
                : `${Math.floor(r.schedule.payoffMonths / 12)} years${r.schedule.payoffMonths % 12 ? `, ${r.schedule.payoffMonths % 12} months` : ''}`}
            </b>
          </div>
          <div>
            <span>Total projected interest</span>
            <b>{euro(r.schedule.totalInterest)}</b>
          </div>
          <div>
            <span>Payment after rate fix</span>
            <b>
              {euro(r.schedule.refinancePayment)}
              <small> / month</small>
            </b>
          </div>
        </div>
        {p.extraAnnual > 0 && (
          <div className="extra-note">
            <CircleCheck size={16} />
            Your extra repayments reduce projected interest by {euro(r.interestSaved)} versus the
            same plan without them.
          </div>
        )}
      </section>
      <section className="card comfort-card">
        <div className="card-heading">
          <div>
            <h2>Room in your monthly budget</h2>
          </div>
          <span className={`badge ${comfortable ? 'green' : 'amber'}`}>
            {comfortable ? <CircleCheck size={13} /> : <TriangleAlert size={13} />}
            {comfortable ? 'Some breathing room' : 'Take a closer look'}
          </span>
        </div>
        <div className="budget-bar" aria-label="Monthly budget allocation">
          <span style={{ flex: r.housing, background: '#37634b' }} />
          <span style={{ flex: p.living, background: '#afbd9c' }} />
          <span style={{ flex: p.extraAnnual / 12, background: '#b9995b' }} />
          <span style={{ flex: Math.max(0, r.surplus), background: '#e8eddf' }} />
        </div>
        <div className="budget-detail">
          <div>
            <span>
              <i style={{ background: '#37634b' }} />
              All-in housing
            </span>
            <b>{euro(r.housing)}</b>
          </div>
          <div>
            <span>
              <i style={{ background: '#afbd9c' }} />
              Other living costs
            </span>
            <b>{euro(p.living)}</b>
          </div>
          {p.extraAnnual > 0 && (
            <div>
              <span>
                <i style={{ background: '#b9995b' }} />
                Save for extra repayments
              </span>
              <b>{euro(p.extraAnnual / 12)}</b>
            </div>
          )}
          <div>
            <span>
              <i style={{ background: '#e8eddf' }} />
              Left each month
            </span>
            <b className={r.surplus < 0 ? 'negative' : ''}>{euro(r.surplus)}</b>
          </div>
        </div>
        <p className="microcopy">
          Housing includes {euro(p.running)} running costs + {euro(p.maintenance)} maintenance.{' '}
          {r.burden === null
            ? 'Add income to see the housing-to-income ratio.'
            : `${percent(r.burden)} of take-home income goes to housing and planned extra repayments.`}{' '}
          The 40% indicator is a planning heuristic, not a lending decision.
        </p>
      </section>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Refinancing stress test</h2>
            <p>
              Monthly payment on the remaining {euro(r.schedule.balanceAtFix)} after year{' '}
              {p.fixedYears}.
            </p>
          </div>
          <ArrowUpRight size={20} />
        </div>
        <div className="stress-grid">
          {r.stress.map((s, i) => (
            <div key={i} className={i === 0 ? 'stress-base' : ''}>
              <span>{percent(s.rate)} rate</span>
              <b>{euro(s.payment)}</b>
              <small className={s.surplus < 0 ? 'negative' : ''}>
                {euro(s.surplus)} left / month
              </small>
            </div>
          ))}
        </div>
        <p className="microcopy inset">
          Repaid by year {p.targetYears}. Future rates are assumptions. Extra repayments stop after
          the initial fixed period.
        </p>
      </section>
      <details className="card breakdown">
        <summary>
          <h2>Where every euro goes</h2>
          <span>
            View cost breakdown <ArrowDownToLine size={15} />
          </span>
        </summary>
        <div className="breakdown-inner">
          <dl>
            {[
              ['Purchase price', p.price],
              [`Transfer tax · ${r.state.name} · ${percent(r.state.tax)}`, r.transferTax],
              ['Notary & land registry allowance', r.notary],
              ['Buyer’s broker fee incl. VAT', r.broker],
              ['Renovation & moving', p.renovation],
              ['Total project cost', r.totalProject],
              ['Savings used (after reserve)', -r.cashUsed],
              ['Loan required', r.loan],
              ['Total projected loan payments', r.schedule.totalPaid],
              ['Project cost + projected interest', r.totalProject + r.schedule.totalInterest],
            ].map(([label, amount]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{euro(Number(amount))}</dd>
              </div>
            ))}
          </dl>
          <p className="microcopy">
            Effective annual interest from monthly compounding: {percent(r.effectiveInterest, 2)}.
            This excludes fees and is not a lender’s regulatory APR (effektiver Jahreszins).
          </p>
        </div>
      </details>
      <details className="card schedule">
        <summary>
          <h2>Your repayment schedule</h2>
          <span>
            Year by year <ArrowDownToLine size={15} />
          </span>
        </summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Interest / year</th>
                <th>Repaid / year</th>
                <th>Debt remaining</th>
              </tr>
            </thead>
            <tbody>
              {r.annual.map((row, i) => {
                const prev = r.annual[i - 1];
                return (
                  <tr key={row.month}>
                    <td>
                      {Math.ceil(row.month / 12)}
                      {row.month === p.fixedYears * 12 ? ' · Rate fix ends' : ''}
                    </td>
                    <td>{euro(row.totalInterest - (prev?.totalInterest ?? 0))}</td>
                    <td>{euro((prev?.balance ?? r.loan) - row.balance)}</td>
                    <td>{euro(row.balance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
      <div className="result-actions">
        <button className="primary-button" onClick={onSave}>
          <BookmarkPlus size={17} />
          Save & compare this plan
        </button>
        <button
          className="secondary-button"
          onClick={() => downloadFile('zuhause-repayment-schedule.csv', scheduleCsv(r))}
        >
          <ArrowDownToLine size={16} />
          Export monthly CSV
        </button>
      </div>
      <p className="fine-print">
        <Info size={14} />
        Planning estimates for a fully drawn owner-occupied annuity loan. Monthly payments are
        calculated without intermediate rounding. Running costs are held constant. Excludes lender
        fees, construction drawdowns, tax relief and subsidies. See the guide for details.
      </p>
    </div>
  );
}
