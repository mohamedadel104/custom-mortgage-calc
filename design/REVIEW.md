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
