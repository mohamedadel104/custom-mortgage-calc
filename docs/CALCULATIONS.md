# Calculation contract

All rates are annual percentages in inputs. Currency is EUR. This is an owner-occupied, fully drawn annuity-loan planning model; it is not a lender quote or approval model.

## Acquisition

`transfer tax = purchase price × state rate / 100`

`buying costs = transfer tax + notary/registry allowance + buyer broker commission including VAT`

`project cost = purchase price + buying costs + renovation/moving budget`

`usable savings = max(0, savings − protected reserve)`

`cash used = min(project cost, usable savings)`

`loan = max(0, project cost − cash used)`

Loan-to-price is loan divided by purchase price. It is not the lender's collateral-based Beleihungsauslauf. The calculator may show financing above 100% of the property price; this does not imply a bank will offer it. A reserve larger than savings triggers a warning and cannot create negative usable savings.

Transfer tax uses the full entered property price; exemptions, separately valued movable property, complex construction/land contracts and transaction-date historical tax rates are not modeled. Notary and registry percentage inputs are allowances, not statutory fee calculations.

## Initial annuity and monthly schedule

`monthly payment = initial loan × (nominal interest + initial repayment) / 1200`

For each month, interest is opening balance × annual nominal rate / 1200. Principal equals regular payment less interest. The last payment is capped at balance plus interest, and principal never crosses below zero. Inputs are finite, bounded and sanitized. Positive initial repayment prevents intentional interest-only/negative-amortization loans in this model.

Special repayment is entered in euros, occurs after the regular payment every twelfth month, is capped by the remaining balance, and is made only within the initial fixed-rate period. It reduces debt while keeping regular payments constant during that period. No contractual extra-payment entitlement is inferred. The comparison without extras uses the same rates and target term.

The engine retains full floating-point precision internally and formats displayed values. Monthly CSV exports round each displayed field to cents, so independently rounded components can differ by a cent. Actual lender schedules can differ due to day-count conventions, booking dates and contractual rounding.

## Refinancing

At the fixed-period boundary, the remaining balance becomes the refinanced principal. The future rate is a user assumption. With `r = future nominal rate / 1200` and `n = (total target years − fixed years) × 12`:

`payment = balance × r / (1 − (1+r)^−n)`

At zero interest, payment = balance / n. Logarithmic/exponential functions retain accuracy near zero. The target term is constrained to exceed the fixed period. A schedule ends on payoff or after 720 months; a loan paid off during the fixed period has zero balance and zero refinancing payment.

Stress cases apply the entered future rate plus 0, 1, 2 and 3 percentage points, capped at the supported 25% model boundary, to the same remaining debt and term. These are scenarios, not predictions.

## Monthly budget

All-in housing = mortgage + running costs + maintenance. Planned special repayments are budgeted as annual amount / 12 during the initial fixed period. Monthly room = income − other living costs − all-in housing − special repayment saving. The first-period ratio includes those planned special repayments. The 40% ratio and €500 remaining-cash indicator are editable-product heuristics in code, not legal limits or underwriting rules. Zero income produces an unavailable ratio.

Income, running costs and living costs are held constant in the mortgage view. Refinancing stress assumes no continued special repayments. For apartments, avoid double counting WEG reserves in both Hausgeld and maintenance.

## Market benchmark rate

The ECB series are annualised agreed rates / narrowly defined effective rates on new German household housing loans, not regulatory APRs including fees. Applying a source benchmark explicitly converts it to an approximate monthly nominal planning rate:

`nominal percent = 1200 × ((1 + AAR / 100)^(1/12) − 1)`

This compounding conversion is an approximation; it does not derive a bank's actual Sollzins from mixed statistical conventions, determine an offer or change the chosen fixed period. New source observations never overwrite the user's saved scenario.

## Historical rate comparisons

Historical rate context in Locations uses the equally weighted arithmetic mean of the monthly published AAR/NDER values within the selected calendar period. It reports available and expected months, never fills missing months with zero, and rejects duplicate-month observations. This is a descriptive benchmark, not the actual rate on a property's loan. An undated broker reference is never joined to the review year's rate. Citywide half-year price summaries are joined only to January–June rates of the same year.

Dated historical project asking-price ranges use the article’s publication month for mortgage context, explicitly labeled as such. Construction completion, sell-out, publication, contract and handover dates are different events; none is substituted for a unit’s undisclosed sale date. Neighborhood housing stock, developer-reported sold units, institutional acquisition units and individual reference samples are never added into one transaction count.

## Rent versus buy

The renter starts with a portfolio equal to the buyer's cash used for acquisition. Common unused savings/reserves are excluded on both paths. Every month both portfolios accrue the assumed monthly-equivalent return; then the less expensive housing path invests its cost advantage. Ownership costs comprise scheduled payments, actual special repayment when due, and property running/maintenance costs grown by the entered cost inflation. Renting costs comprise cold rent grown by rent growth plus tenant running costs grown by cost inflation.

At each year end, hypothetical owner assets = property price grown by the property-growth assumption × (1 − selling cost percentage) − remaining debt + buyer portfolio. Renter assets = renter portfolio. Renovation outlay is a cost, not an automatic increase in property value. All figures are nominal. Growth, returns and cost differences are hypothetical and may be unaffordable in practice; check the household budget independently.

Excludes investment/capital-gains taxes, investment fees, early repayment penalties, subsidy tranches, property-specific appreciation, mortgage insurance, construction drawdowns, commitment interest, rent regulation, tax relief, pensions and individual eligibility.
