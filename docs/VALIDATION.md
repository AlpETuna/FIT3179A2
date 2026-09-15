# Validation record — 16 September 2026

## Passed

- **Production build:** `npm run build`.
- **16 chart/data tests:** all fourteen specifications run against their actual local source extracts; linked signals update; parallel coordinates contains 335 × 4 observations; CRA figures agree with rounded published counts within tolerance; CPI preserves the published relative change; every displayed heatmap/cartogram cell label meets 4.5:1 text contrast.
- **6 browser tests:** all charts render at 1440, 768 and 390px; no page horizontal overflow or browser errors; data tables and guided buttons work; keyboard activation works; a failed specification preserves its table and supports retry; the production build works under a repository-style subpath at desktop and phone widths.
- **Production request check:** no failed requests and no external network dependencies while loading/rendering the story. Source links remain external by design, but are not required to draw the charts.
- **Specification accessibility:** all fourteen readable JSON links return valid Vega / Vega-Lite specifications from the simulated repository subpath.
- **Data validation:** 335 SA3s, 88 SA4s, eight jurisdictions, 48 payment cells and 28 common CPI months; geometry joins and range checks pass. Public data totals approximately 0.88 MB.
- **Visual inspection:** full-page, hero, maps, composition plots, profiles, matrix, scatter and cartogram screenshots inspected on desktop/phone. Corrections included complete Tasmania framing, wrapping small-screen labels, preserving all three mosaic column labels, and contrast-aware matrix text.
- **Dependency audit:** `npm audit --json` reported zero vulnerabilities at the time of this check.

## Practical limits

Browser automation used isolated Chromium, not every browser/device. The build emits Vite’s size advisory for the approximately 861 KB uncompressed shared Vega/Vega-Lite application bundle (about 296 KB gzip). Chart libraries and fonts are bundled locally to avoid fragile external embeds.

No live GitHub deployment has occurred. Signed-out public verification must happen after the user approves publishing and supplies the repository URL. Automated checks do not determine rubric classifications, replace the hand-drawn sketch, complete the official submission document or guarantee a mark.

Screenshots are in the ignored `test-results/` directory. Run the production build before the browser suite; leave `npm run dev` running for the development-server checks.
