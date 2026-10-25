# Working on Zuhause

- Read `docs/CALCULATIONS.md` before changing finance logic and `DATA_SOURCES.md` before changing datasets or coverage claims.
- Bavaria is the priority. Preserve nationwide tax support and keep local facts, asking prices, completed transactions, reference values and national indices clearly distinguished.
- Within Bavaria, prioritize apartments in postcode 81245 and Neupasing; houses are secondary. Do not substitute citywide Munich statistics or neighboring counties for exact neighborhood evidence. Public broker “sold” references do not verify a closing price or sale date. Keep historical Hausgeld, extra parking, WEG reserves and leasehold charges explicit; do not turn listing charges into a current budget.
- Financial inputs and user evidence stay in the browser. No analytics, paid APIs, credentials or backend are required by the default app.
- Keep the pure TypeScript engines independent of UI code. Validate user imports and upstream schemas. Never replace missing evidence with invented values or silently apply new rates to saved scenarios.
- Use the project-local Taste skill at `design/skills/design-taste-frontend/SKILL.md` for UI work. This is an **app**, so read its `references/app-screens.md` and `design/DESIGN.md`; do not impose its marketing-page imagery or motion requirements. Record honest screenshot critiques in `design/REVIEW.md`.
- Run `npm test` and `npm run build` for meaningful changes. Check the production build at desktop, tablet and phone widths when layout changes. Use synthetic examples in tests and screenshots.
- Keep data rights and original source attribution intact. The project MIT license does not relicense third-party data, fonts, tools or municipal reports.
