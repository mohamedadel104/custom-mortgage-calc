# Visual review log

Self-review of the production build with Taste's app-screen workflow, not independent user testing. Direction: Achromatic ledger, seed 857519272. No redraws or inspector rule allowances.

## Round 1

Seen in one second: the monthly mortgage amount, beside a detailed property form.

Idea: Germany's fixed-rate mortgage boundary becomes a visible split between contractual calculations and future refinancing assumptions.

Live job: editing the price changes payment, acquisition costs, debt, budget and refinancing cases together.

Layout: financing = pinned controls and a result stream; research = search, sourced observations, evidence ledger; comparison = assumption table; guide = definitions and checklist.

Self-review scores: design 7.0, usability 7.0, creativity 7.0, content 8.0; weighted 7.1. App rules apply; marketing-page image and motion caps do not.

Top three visible problems:

1. `round-1/mobile-fold.jpg`: the form occupies the first screen and the payment is below it. Move the answer above the inputs on small screens without duplicating the calculation.
2. Desktop and mobile sheets: most working text is below 13px. Increase labels, supporting text and field metadata to 13px.
3. Debt chart: a solid green curve treats the refinancing assumption like the fixed contract. Use the main blue data hue for the fixed period and a dashed neutral segment afterward; remove the decorative area gradient.

Inspector: 0 failing checks, 2 warnings (small text and independent panel heights). Source lint separately reported semantic state-code and overlay-shadow false positives.

## Round 2

Seen in one second: the payment answer comes first on phones; desktop keeps the editable property pane beside results.

Idea and live job unchanged. Actual loaded font: Geist Variable at every tested width.

Self-review scores: design 7.5, usability 8.0, creativity 7.0, content 8.0; weighted 7.6.

Top three visible problems:

1. The SVG viewBox shrinks label text on phones. Size charts to the container, use stable physical text sizes and choose fewer x-axis ticks on narrow plots.
2. A three-point municipal history repeats the first x label. Deduplicate tick indices and use rounded, even y-scale steps; support negative net-asset values without clipping.
3. The rent/buy summary has an empty band beside its assumptions. Fill it with the relevant property-value, sale-cost, equity and investment bridge, and state the horizon beside the result.

Inspector after readability changes: financing 0 failing checks / 1 warning; market and guide 0 / 0; research 0 / 1; rent/buy 0 / 1. The research/rent panel warnings were addressed by balancing real content. Financing's independent pinned input pane intentionally has a different height from the adjacent result stream; it is a working control pane, not a peer statistic card.

## Round 3

Seen in one second: the monthly payment, its first-month split and the remaining debt at the fixed-rate boundary. The phone layout puts the answer before the form. The subject, idea and live job remain the same.

Opened every emitted fold and full-page sheet at 1440 × 900, 768 × 1024 and 390 × 844 across all six destinations. Finance values come from the synthetic scenario below, while external observations retain their real source dates. Tested a changed purchase price, saving/removing a scenario, Munich postcode lookup, loading the NRW snapshot and filtering Köln reference records to Altstadt districts.

Final corrections: narrow charts use three distinct time labels instead of four crowded dates; physical SVG label sizes remain readable; first-payment cents reconcile. No extra design directions or rule allowances were introduced.

Self-review scores: design 7.5, usability 8.0, creativity 7.0, content 8.0; weighted 7.6. This is a coherent working application, not a claim of award-level art direction.

Final inspector results: calculator 0 FAIL / 1 WARN; location 0 / 0; comparison 0 / 0; rent/buy 0 / 1; market 0 / 0; guide 0 / 0. The calculator warning is the intentionally independent pinned control pane. Rent/buy retains approximately 71px of space below the shorter assumptions form beside its longer asset reconciliation; this is a minor remaining layout imperfection. Source lint: 0 FAIL / 14 WARN, consisting of official state-code strings, the explanatory phrase “more than a deposit” and shadows belonging to actual menus, tooltips and notifications. No visual rules were disabled to obtain a pass.

## Final review scope

Final production screenshots and measurements are generated under `.taste-skill/` (ignored build/review output). The checked-in preview is `preview.jpg`. The input examples are synthetic: Bavaria, €450,000 purchase price, €120,000 savings, €15,000 reserve and 3.75% illustrative interest. They must be replaced by a user's own assumptions, not presented as a bank offer.

Remaining limits: local price coverage varies; Munich extracts are manually reviewed; Bavaria's broader local dashboard remains the official third-party original. Long evidence tables scroll within their frame on phones. The self-review is not a claim of award-level quality or a blind user study.

Post-review data correction: five NRW source codes with conflicting municipality labels are withheld from the selector, records and historical summaries. The loaded-data view explains the exclusions in an expandable note. Source records remain unchanged for reproducibility. This is an attribution safeguard, not another art-direction round.

## 81245 apartment and neighborhood evidence revision

Same Achromatic ledger direction and seed; no redraw or rule allowance. The screen’s question is now: how much apartment activity is documented around Neupasing, what prices are public, and which mortgage conditions belonged to the same period? The product-specific element is the evidence bridge from neighborhood housing stock to developer sales/handover claims, block acquisitions and individual price disclosure. The amounts are sourced facts, not illustrative transaction counts.

Round 1 (house-focused first attempt): 0 FAIL / 0 WARN. Opened every fold and page sheet. The top three issues were the wrong property default for the user, a phone first screen without a numeric answer, and evidence without apartment costs. Corrected the default to apartments, compacted the search/header and added rooms, Hausgeld periods, parking and leasehold charges. This was a product-scope problem despite passing measurements.

Round 2: 0 FAIL / 0 WARN. Opened all seven emitted sheets at 1440, 768 and 390 pixels. Seven individual apartment examples were readable, but still communicated an inadequate view of neighborhood scale. The user explicitly challenged that coverage. Expanded research to the municipality’s roughly 2,400-home quarter, ten project/subset records, two developer sold/handover reports covering 295 homes, and a separate 68-home block acquisition. Added seven real @home unit references and three dated 2017 project asking ranges. Capped visible project and individual rows at four with real show-all controls. Source price placeholders and missing sale dates stay missing.

Round 3: 0 FAIL / 1 WARN (`below-fold`: only two of five main blocks begin on the desktop first screen). Opened all eight emitted sheets at all three widths. Retained the warning deliberately: the user’s neighborhood-scale question takes priority in the first block, while individual property details and finance tables remain separate, reachable through direct scroll buttons. Compressing every evidence definition, price record and time-series panel into one desktop screen would make the source distinctions harder to read. No check was disabled. The phone first screen now shows all four neighborhood metrics, including their stock/sales/block-purchase meanings. New apartment rows preserve 13px supporting text and exact cents for disclosed monthly charges. After the sheets, clarified “sale date” versus building completion and removed an artificial empty neighborhood-label filter; actual project labels remain selectable.

Self-review scores for the final revision: design 7.5, usability 8.0, creativity 7.0, content 8.0 (weighted 7.6). These are self-review judgments, not an independent jury. Browser checks cover developer evidence filters, period/fixation updates, partial 2026 coverage, empty property selections and house/apartment switching. Counts come from the retained records; project subsets and individual examples are not added to the quarter or a transaction total. Final source lint remains 0 FAIL / 14 WARN for the previously documented state-code strings, guide phrase and actual overlay shadows.
