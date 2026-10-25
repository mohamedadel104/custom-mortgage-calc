# Contributing

Use Node 22.12+ and `npm ci`. Keep the financial engine independent of React. Run `npm test` and `npm run build` before submitting a pull request. Data importers must fail closed on schema changes and preserve the last valid snapshot.

For calculation changes, document the formula, timing, rounding and assumptions in `docs/CALCULATIONS.md`; add meaningful reference cases or conservation checks. Never silently change a saved plan's rate when a source refreshes.

For new local data, provide the original publisher, a stable source URL, geographic and property-type coverage, observation period, retrieval date, methodology and reuse terms. Distinguish completed transactions from offers, modeled values and reference values. Preserve missing values as missing; never substitute zero or a national estimate for unavailable local evidence.

Bavaria is the priority. Prefer openly licensed municipal/county datasets and official publications. Do not scrape restricted transaction registers, redistribute reports without permission, invent address-level sales or imply nationwide coverage from a small local sample. A documented provider adapter is welcome where public data is insufficient, but keep credentials out of client code and optional integrations out of the default workflow.

For reviewed Munich extracts, verify page 9 of the latest corrected half-year reports, preserve segment definitions and sample caveats, and update the review date. For state tax changes, cite the state statute and its effective date, and update the tests.

Use the project-local Taste skill's **app** workflow and record visual reviews at 1440, 768 and 390 pixels. Keep financial labels readable, primary jobs accessible by keyboard, mobile navigation collapsible and charts backed by table/export evidence. Avoid decorative marketing patterns in the working interface.

Open issues with synthetic examples. Do not post personal financial inputs, addresses, private loan offers or non-public sales documents. Security reports should follow the repository's GitHub security reporting options where enabled.
