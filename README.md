# A place to call home

An original Vega / Vega-Lite story about **Housing and Renting in Australia**, by **Alp Tuna**.

## Review locally

```powershell
npm.cmd ci
npm.cmd run dev
```

Open **http://127.0.0.1:5173/**. The committed extracts make the site independent of ABS and AIHW availability at viewing time. Node 24 is recommended; the production build has no Python dependency.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd exec playwright -- install chromium
npm.cmd exec playwright -- test
```

The browser tests expect the development server to be running. They check all fourteen charts at 1440, 768 and 390 pixels, page overflow, data tables and guided selection. Screenshots are saved under `test-results/` (ignored by Git).

## What is implemented

- Four chapters, an original architectural illustration, fourteen charts, three map designs and a conclusion.
- Real Census 2021, CPI to July 2026 and CRA March 2026 extracts, with provenance and source-table references.
- All 335 eligible SA3 regions in the parallel-coordinates context; three guided community highlights.
- A verified 48-cell AIHW payment heatmap, separate severe-burden state map and assistance comparison.
- Equal-column responsive layout, local fonts, keyboard controls, data tables and readable chart JSON.
- A manually triggered GitHub Pages workflow, ready for the approved repository.

## Review and submission documents

- [Implementation and design rationale](docs/IMPLEMENTATION.md)
- [Rubric and tutor review gate](docs/REVIEW.md)
- [Submission text and interview preparation](docs/SUBMISSION.md)
- [Data processing and source definitions](docs/DATA.md)
- [Design tokens](DESIGN.md)

**Not yet published.** Pushing and deployment require Alp Tuna’s approval. The repository URL has not been supplied and no remote is configured. The workflow runs only when manually requested; a push does not deploy it.

The hand-drawn sketch, tutor decisions, student ID/studio details and final public URL remain human submission tasks. No mark or idiom classification is guaranteed by the implementation.

## Project structure

| Path | Purpose |
|---|---|
| `index.html` | Narrative, semantic page structure, authorship and sources |
| `src/main.js` | Chart embedding, responsive arrangements, data tables, guided selections |
| `src/style.css` | Layout, typography, colour and accessibility |
| `public/charts/*.json` | Fourteen readable, original Vega / Vega-Lite specifications |
| `scripts/build-charts.mjs` | Rebuild those specifications from the verified extracts |
| `public/data/` | Small published-data extracts and simplified geography |
| `scripts/prepare_data.py` | Extract disjoint Census cells and published AIHW percentages |
| `scripts/prepare-maps.mjs` | Simplify geography and derive geometric symbol positions |
| `.github/workflows/pages.yml` | Manual-only Pages deployment |

## Rebuild the data (optional)

Python 3.11 with `openpyxl` and `pypdf` is required. The downloads are large and stored in the ignored `.cache/` directory.

```powershell
py -3.11 scripts/acquire_sources.py
py -3.11 scripts/prepare_data.py
node scripts/prepare-maps.mjs
node scripts/validate-data.mjs
node scripts/build-charts.mjs
```

Run the stages in that order. Map preparation adds the SA4 coordinates required by validation. Public data is about **0.88 MB**; raw source archives, assignment materials, and course notes are not published.

## Publishing after approval

1. Confirm the destination repository URL and obtain explicit approval of this version.
2. Configure its Git remote and push the reviewed commits.
3. Enable GitHub Pages with GitHub Actions as its source.
4. Manually run **Publish reviewed story** on `main`.
5. Verify the public page, every chart, JSON link and sketch PDF while signed out; then fill the submission template’s URLs.

The workflow follows [GitHub’s custom Pages workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
