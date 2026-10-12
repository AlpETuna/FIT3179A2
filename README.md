# A place to call home

A Vega / Vega-Lite data story about **Housing and Renting in Australia**, by **Alp Tuna**.

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
| `src/main.js` | Chart embedding, responsive layouts, data tables, guided selections |
| `src/style.css` | Layout, typography, colour and accessibility |
| `public/charts/*.json` | The fourteen Vega / Vega-Lite chart specifications |
| `public/data/` | Published-data extracts and simplified geography |
| `.github/workflows/pages.yml` | GitHub Pages deployment |

## Deployment

Every push to `main` builds the site with Vite and publishes `dist/` to GitHub Pages. The workflow can also be run by hand from the Actions tab.
