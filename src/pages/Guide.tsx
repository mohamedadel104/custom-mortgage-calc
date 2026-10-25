import { ArrowUpRight, BookOpen, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { SOURCES } from '../data/germany';
import { BAVARIA_LINKS } from '../data/bavaria';
import { readLocal, writeLocal } from '../lib/storage';

const TOPICS = [
  [
    'Eigenkapital',
    'The money you bring.',
    'Your savings need to cover more than a deposit. Taxes, notary, registration, brokerage and renovation are all part of the purchase. Keep a separate emergency reserve. A lender’s loan-to-value uses its own collateral valuation, which can be lower than your agreed price. Our ratio uses the purchase price so you can reproduce it.',
  ],
  [
    'Annuitätendarlehen',
    'One payment. Two jobs.',
    'Your monthly mortgage payment pays interest and reduces the loan. At the start, more goes to interest. As the balance shrinks, the same payment repays more principal. Initial monthly payment = loan × (nominal interest rate + initial annual repayment rate) ÷ 12. Percentages must be expressed as decimals.',
  ],
  [
    'Sollzins & Effektivzins',
    'Know which rate you are comparing.',
    'Sollzins is the nominal borrowing rate used in this model. Effektiver Jahreszins is the regulatory annual percentage rate and includes specified costs and payment timing. Compare like-for-like lender offers using their APR and their repayment terms. The app’s compounded interest figure excludes fees and is not that regulatory APR.',
  ],
  [
    'Zinsbindung',
    'The fixed rate has an end date.',
    'A 10-year fixed rate does not mean the mortgage is paid off in 10 years. The remaining balance, or Restschuld, needs to be repaid or refinanced. This model recalculates the later payment to reach your target repayment year. Try a higher future rate and a shorter target term to see the risk.',
  ],
  [
    'Sondertilgung',
    'Extra payments buy you less interest.',
    'An extra repayment reduces the outstanding balance. Whether you can make it for free, how much and when depends on your contract. This model pays the entered euro amount at the end of each year during the fixed period only. It assumes the contract permits that amount. After refinancing, it assumes no further special repayments.',
  ],
  [
    'Kaufnebenkosten',
    'The price tag is only the beginning.',
    'Transfer tax depends on the property’s federal state. Notary and land-registry charges follow GNotKG and the actual transaction; the percentage here is a planning allowance. Brokerage is negotiable: enter your buyer share including VAT. Rules on splitting commission for consumer purchases of apartments or single-family houses depend on who engaged the broker (§§ 656b-656d BGB); 3.57% is an example, not a statutory rate.',
  ],
  [
    'Hausgeld & Instandhaltung',
    'Leave space for the home itself.',
    'For apartments, inspect the WEG accounts, meeting minutes, economic plan, reserves and possible special assessments. Hausgeld can include utilities, management and maintenance reserves. Enter each expense once across running costs and maintenance. Ask about heating replacement, roof, windows, energy certificate, leasehold charges and any planned major work.',
  ],
  [
    'KfW & BayernLabo',
    'Check support before you commit.',
    'KfW and Bavarian housing programmes can complement a bank loan, subject to current income, household, property, energy and application conditions. Check timing with the administering institution before entering a binding commitment. Subsidies are not deducted automatically here; a subsidised loan is a separate loan with its own terms, not free equity.',
  ],
  [
    'Kündigung & Vorfälligkeit',
    'Flexibility depends on the contract and the law.',
    'For relevant fixed-rate loans, § 489 BGB can allow ordinary termination after 10 years from full receipt of the loan, with six months’ notice. A later agreement on rate or repayment can change the relevant start date. Selling or repaying earlier may involve prepayment compensation and other costs. This calculator does not model those charges.',
  ],
  [
    'Bodenrichtwert & Kaufpreis',
    'Land, homes and asking prices are different.',
    'A Bodenrichtwert is a reference value for land in a zone, not the market value of an apartment or its building. NRW Immobilienrichtwerte are reference values for defined norm properties. Asking prices are what a seller requests; completed sale prices are what was agreed. A national price index measures change over time, not euros per square metre in your street.',
  ],
];
const CHECKLIST = [
  'Set a budget that survives higher rates and lower income.',
  'Keep an emergency reserve separate from your deposit.',
  'Inspect the building, energy certificate and renovation needs.',
  'Read the land register, easements and any leasehold terms.',
  'For flats, inspect WEG minutes, reserves and special assessments.',
  'Verify local sale evidence, date, property type and living area.',
  'Compare several financing offers, APRs and fixed periods.',
  'Check KfW and BayernLabo eligibility and application timing.',
  'Confirm extra-payment rights and construction drawdown charges.',
  'Read the notarial draft and clarify every unresolved condition.',
];

export default function Guide() {
  const [checked, setChecked] = useState<string[]>(() => {
    const saved = readLocal<unknown>('zuhause-checklist', []);
    return Array.isArray(saved) ? saved.filter((x) => typeof x === 'string') : [];
  });
  const [persistError, setPersistError] = useState(false);
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <h1>The mortgage guide</h1>
          <p>No background in banking required. Start here, then make the numbers your own.</p>
        </div>
        <BookOpen className="title-icon" size={36} />
      </div>
      <div className="guide-intro">
        <div>
          <h2>Buy with a plan you understand.</h2>
          <p>
            A low monthly payment can hide a large remaining debt. Look at the whole purchase, your
            day-to-day budget and what happens when the fixed rate ends.
          </p>
        </div>
      </div>
      <div className="guide-grid">
        {TOPICS.map(([term, title, body], i) => (
          <details className="card guide-topic" key={term} open={i < 2}>
            <summary>
              <span className="term-label">{term}</span>
              <h2>{title}</h2>
              <span className="topic-plus">+</span>
            </summary>
            <p>{body}</p>
          </details>
        ))}
      </div>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Your home-buying checklist</h2>
            <p>Saved on this device when browser storage is available.</p>
          </div>
          <span className="badge green">
            {checked.length} / {CHECKLIST.length}
          </span>
        </div>
        <div className="checklist">
          {CHECKLIST.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={checked.includes(item)}
                onChange={() => {
                  const next = checked.includes(item)
                    ? checked.filter((v) => v !== item)
                    : [...checked, item];
                  setChecked(next);
                  setPersistError(!writeLocal('zuhause-checklist', next));
                }}
              />
              <span className="custom-check">{checked.includes(item) && <Check size={13} />}</span>
              <span>{item}</span>
            </label>
          ))}
        </div>
        {persistError && (
          <p className="notice warning">
            Browser storage is unavailable. Your checklist lasts for this visit only.
          </p>
        )}
      </section>
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Go to the original sources.</h2>
          </div>
          <ArrowUpRight />
        </div>
        <div className="resource-grid">
          {[
            ['Independent consumer guidance', SOURCES.consumer],
            ['KfW home ownership · programme 124', SOURCES.kfw],
            ['BayernLabo housing support', BAVARIA_LINKS.bayernlabo],
            ['Early termination · § 489 BGB', SOURCES.cancellation],
            ['Broker commission · § 656c BGB', SOURCES.broker],
            ['Bavarian local valuation committees', BAVARIA_LINKS.committees],
          ].map(([title, url]) => (
            <a key={title} href={url} target="_blank" rel="noreferrer">
              {title}
              <ExternalLink size={15} />
            </a>
          ))}
        </div>
      </section>
      <p className="fine-print">
        This resource explains a planning model; it cannot determine a lender’s approval, an
        individual property value or your entitlement to financial support. Legal rules and
        programmes should be checked at the source for your transaction date.
      </p>
    </div>
  );
}
