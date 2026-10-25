# Zuhause design contract

This is a working financial application. Apply the Taste **app-screen** workflow in `skills/design-taste-frontend/references/app-screens.md`, not the marketing-page workflow.

## Direction

Achromatic ledger, seed **857519272**, drawn 2026-10-25. No redraws. The dealt no-sidebar shell suits six short destinations without removing space from the financing workbench. Light blue-grey paper (`#f2f4f7`) gives the app the character of a financing worksheet. Locally hosted Geist carries text and tabular figures. Black/neutral controls recede; the main data line gets the one blue hue. Status uses restrained semantic colour.

The product's signature is the **fixed-rate boundary**: the part determined by the entered contract stays distinct from the refinancing assumption. A dashed future line names what is uncertain. No decorative illustration, marketing hero, KPI icons, gradients, invented social proof or vanity data.

## Questions and jobs

| View       | First question                                               | Primary job                                                              |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Financing  | What would this home cost each month, and what debt remains? | Edit property/loan assumptions and save a scenario.                      |
| Location   | What evidence supports this asking price?                    | Find a place, inspect original observations and add comparable evidence. |
| Comparison | Which financing trade-off fits my budget?                    | Load or compare up to three plans.                                       |
| Rent/buy   | What happens if I invest and rent instead?                   | Change shared assumptions and inspect both net-asset paths.              |
| Market     | How current and relevant are these rates?                    | Inspect the source and explicitly apply a planning benchmark.            |
| Guide      | What do I need to understand before signing?                 | Read explanations and complete the buying checklist.                     |

## Data inventory

The purchase price, transaction costs, cash used and mortgage reconcile. Nominal rates and initial repayment determine first-month payments; monthly schedule rows conserve principal. The fixed period and payoff target are shared by chart, schedule, stress tests and copy. Bank rates and national indices carry source periods; local evidence names geography and property segment. Asking prices remain separate from sales. Missing evidence stays missing. User-created records start empty.

## Layout and accessibility

One centered 1200px canvas; desktop financing is 360px controls + 12px gutter + 828px results. Other grids use the same 12px gutter and land on the same edges. On small screens, the payment answer precedes the controls, navigation folds into a menu, and tables scroll within their own frame. The independent desktop input pane is pinned and scrolls when tall; do not stretch it to match every output panel.

Page titles 24–26px, sections 16px, working text 13–14px, headline payment 36–38px. Quiet 8px panels and 6px controls, no resting shadows. Menus, tooltips and notifications may float with a shadow. Visible keyboard focus, native field labels, sufficient text contrast, reduced-motion support and explicit empty/error/loading states are required. Do not make a paragraph of caveats microscopic to fit a card.

Charts must keep an honest scale and time order. Use straight segments, no invented smoothing, no rainbow palette. A source table or export provides the exact observations where a chart cannot carry all detail. Interactive controls must work without chart hover. Monetary values are estimates; explain the rounding contract.

## Repeatable review

```sh
npm run build
npm run preview -- --port 4180
npm run design:lint
npm run design:inspect
```

Use `--out .taste-skill/<round>` for separate review rounds. Check 1440, 768 and 390 pixels. Open every emitted screenshot; measurements alone do not establish quality. Record findings and the top three changes in `REVIEW.md`. Limit critique/fix loops to three rounds per the skill. Do not claim blind-user validation or an independent design jury.

The full skill is read directly at this path for this project; a global Codex installation is not required. To update it, inspect the upstream changes, retain its MIT notice and rerun checks. It does not execute as part of the public website or production build.
