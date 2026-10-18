# A place to call home

A Vega / Vega-Lite data story about **Housing and Renting in Australia**, by **Alp Tuna**, for FIT3179 Data Visualisation 2 (Monash University, October 2026).

The repository is named `FIT3195A2`, so the GitHub Pages address uses that name.

Live site: https://alpetuna.github.io/FIT3195A2/

## Run locally

```powershell
npm.cmd ci
npm.cmd run dev
```

Open **http://127.0.0.1:5173/**. Node 24 is recommended.

## Project structure

| Path | Purpose |
|---|---|
| `index.html` | Narrative, page structure, authorship and sources |
| `src/main.js` | Chart embedding, data tables, guided selections |
| `src/style.css` | Layout, typography, colour and accessibility |
| `public/charts/*.json` | The fourteen Vega / Vega-Lite chart specifications. Each loads its data from `public/data/` and sizes itself to its container, with no changes made by JavaScript (the choropleth's view sizes are the one exception). To try one in the [Vega editor](https://vega.github.io/editor/), replace `data/` with `https://alpetuna.github.io/FIT3195A2/data/`. |
| `public/data/` | Published-data extracts and simplified geography |
| `A2sketch.png`, `A2sketch.pdf` | The hand-drawn sketch |
| `.github/workflows/pages.yml` | GitHub Pages deployment |

## Deployment

Every push to `main` builds the site with Vite and publishes `dist/` to GitHub Pages. The workflow can also be run by hand from the Actions tab.
