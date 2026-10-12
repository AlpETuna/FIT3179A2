# Full implementation and design rationale

## Domain, audience and central question

**Assigned topic:** Housing and Renting in Australia, exactly as recorded in `A2Brief/TOPIC.md`.

**Domain:** Australian occupied housing: tenure, dwelling form, household composition, regional income and housing costs, and rental pressure among assistance recipients.

**Audience:** A general Australian reader, including someone unfamiliar with Census geography or statistical charts. The page is an authored presentation with optional guided highlights.

**Question:** How do the homes Australians live in, their location and their household resources shape the experience of renting?

**Narrative:** establish the national housing mix → locate regional variation → contextualise prices with incomes and dwelling profiles → examine current price change and a properly defined household-level affordability measure → draw the sources together without confusing their populations.

## Technology and why

| Choice | Reason |
|---|---|
| Vega-Lite 6 for most charts | Declarative, readable encodings; meets the assignment’s assessed-chart restriction |
| Native Vega 6 for the treemap, alluvial and parallel coordinates | Explicit hierarchy, band geometry and multi-axis layouts require lower-level control |
| Vite with plain HTML/CSS/JavaScript | A static story needs no application framework, backend, account system or database |
| Bundled Vega libraries and local fonts | The public page and its embedded elements do not depend on third-party CDNs |
| Locally hosted JSON and TopoJSON | Small downloads, stable cross-origin behaviour and readable source specifications |
| Python for minimal official-table extraction | Reproducible code/field selection avoids manual transcription and invented joint distributions |
| Mapshaper | Shared-topology simplification and dissolves; avoids a large geospatial Python dependency stack |
| Vega View API | Updates the `featured` signal in two separately embedded charts while retaining all national context |
| Native HTML tables and details | Keyboard- and screen-reader-accessible alternatives to visual encoding, hover and colour |
| Manually triggered GitHub Pages workflow | A reviewable deployment path that obeys the requested approval gate |

## Chart framework: What / Why / How

The Why column states Munzner-style action–target pairs. All source tables are tabular unless tree or geometry is explicitly noted. Counts, percentages, medians and index values are quantitative; type/state/region IDs are categorical; time is ordered.

| # / idiom | What: data and attributes | Why: action–target | How and justification |
|---|---|---|---|
| 1 Waffle | G37, tenure category + dwelling count/share | Summarise part-to-whole | 100 tiles make the national renting share approachable. Exact printed percentages correct the unavoidable whole-tile approximation. Unknown tenure stays visible. |
| 2 Treemap | G36, tree: dwelling type → storey/subtype; leaf count | Summarise hierarchy; compare proportions | Nesting conveys the genuine taxonomy; area conveys homes. This adds building structure, rather than repeating tenure. Small leaves retain tooltips and table rows. |
| 3 Mosaic | G37, tenure × dwelling joint table; cell count | Compare conditional proportions; identify association | Column width conveys prevalence of each dwelling type; height conveys tenure within it. This shows association without fabricating joint cells. The prose explains both encodings. |
| 4 Alluvial | G42, composition × dwelling joint table | Identify associations; summarise part-to-whole | Constant-width bands connect actual categories and show the scale of each association. The text explicitly rules out a movement-over-time interpretation. |
| 5 Choropleth | SA3 geometry + G02 median weekly rent | Locate regional variation and extremes | Sequential lightness encodes an intensive measure appropriate to choropleths. Albers preserves area; metropolitan insets counter small urban polygons. Unavailable areas remain grey. |
| 6 Proportional-symbol map | SA4 geometry-derived locations + G37 rented counts and shares | Locate concentrations; compare magnitude | Circle area can show an extensive count without equating land area and households. Colour adds the rental share so the map says more than “large cities are large”. |
| 7 Histogram | 335 SA3 rent medians, $50 intervals | Summarise distribution; locate common ranges | Counts intervals of a quantitative variable, not named categories. Every region counts once. Retained because it explains the prevalence of regional prices; replacing it with synthetic dot-density locations adds uncredited processing and spatial assumptions. |
| 8 Scatterplot | G02 income and rent medians for each SA3 | Identify correlation; compare featured items | Position on two common quantitative axes supports accurate comparison. Published national medians provide context; no regression or ratio is presented as household stress. |
| 9 Box plot | Regional medians grouped by state | Compare distributions; locate spread | Common rent axis reveals within-state diversity concisely. The caption defines the box, centre and whiskers, including the “median of regional medians” distinction. |
| 10 Parallel coordinates | 335 regions × income, rent, mortgage/week and apartment share | Compare multivariate profiles; locate featured items in context | All regions supply meaningful context; three highlighted profiles show combinations of attributes. Independent raw-unit axes are labelled. Selection reduces emphasis, not the underlying population. |
| 11 Multi-line CPI | Two original monthly price indices, 28 common months | Compare trends | A shared start at 100 compares relative price change across the same period. Direct explanation replaces unexplained “rebasing”. Solid/dashed lines add a non-colour distinction. |
| 12 State choropleth | Eight state/territory boundaries + >50% after-CRA burden | Locate severe burden; compare jurisdictions | Real boundaries make this a genuine map idiom; small jurisdictions get offshore labels with leader lines. This uses a distinct severity threshold, so it does not repeat the >30% overall state measure. |
| 13 Heatmap | Verified CRA state × six payment groups; after-CRA stress | Compare groups; locate high/low combinations | 48 cells support pattern reading across both dimensions. The overall column is omitted. Printed values and a complete table support precise reading; mobile transposes the same matrix. |
| 14 Paired dots | Eight states, two CRA stress calculations | Compare paired magnitudes | A line links the same recipient population with and without assistance in the calculation. Different shapes distinguish the endpoints. Conservatively counted as basic. |

The histogram asks how common price ranges are nationally; the box plot asks how distributions differ between states; the choropleth asks where differences occur. Their shared rent variable allows continuity, but their different tasks are stated explicitly. They are not counted as three separate measures of affordability.

## Interaction

The default story is complete with all three case studies visible. Four buttons select all, Melbourne City, Casey–South or Bendigo. These were chosen as accessible examples of an inner-city, outer-suburban and regional setting within one state; they are not a representative national sample. A searchable 340-region explorer is deliberately absent.

The buttons update both the scatterplot and the parallel-coordinate profile using a shared `featured` signal. Background data stays visible. Text explains the selected community, so hover and colour are not essential. Distinct line styles identify profiles when all three are visible. Tooltips supply details on demand; expandable tables provide full values. A failed chart displays an error and retry control with its table still accessible.

## Layout and illustration

Maximum content width is 1,120px with a 32px gutter. Figure rows use only **6/6 or 12**: one repeated middle sight line, aligned source text and figure rules. Dense maps, the national profiles and the 48-cell matrix get full width; lighter plots are paired with a second figure or explanatory text. Under 1,000px, figures stack. At phone widths, the matrix transposes, map insets stack and profile labels wrap. The page never needs horizontal scrolling; wide data tables scroll inside their own labelled region.

The opening uses an original clean architectural elevation of a house, townhouse and apartment block. It establishes the topic without falsely portraying a dwelling type as owned or rented. The same house/apartment glyphs support the dwelling legend. The illustration is qualitative and not counted as an assessed chart. It is not the compulsory hand-drawn sketch.

## Typography

**Bitter explicitly matches the housing topic:** its sturdy slab-like serifs and clear structural forms echo built architecture while giving the story a human reading voice. **Public Sans** supports neutral public-information body copy and chart labels. The contrast between the two families creates hierarchy without adding more fonts.

Headlines are capped at 38px; body copy is 18px with a 1.65 line height. Prose is capped at 36ch so no rendered line exceeds ten words; this is checked at 1440, 768 and 390px. Figure explanations are 14–15px. Small chart labels are checked at each target viewport. Sentence case, restrained weights, left alignment and tabular numerical formatting make comparisons easier. Fonts are bundled locally.

## Colour scheme and purpose

CSS tokens use OKLCH; Vega receives equivalent sRGB colours for its parser.

| Role | Colour | Justification |
|---|---|---|
| Canvas | White `#ffffff` | Clear separation from chart marks and reliable contrast |
| Main text | Charcoal `#1d1d1d` | Strong reading contrast without a heavy black page |
| Supporting text | Grey `#585858` | A quieter hierarchy that remains readable |
| Renting / primary | Burnt orange `#8f4715` | A warm, grounded accent that links the housing narrative and renting category consistently |
| Mortgage | Blue `#2b6399` | Distinct categorical separation from renting and outright ownership |
| Outright ownership | Teal `#158374` | The third stable tenure hue; not a success/failure judgement |
| Rental pressure | Plum `#6f3473` | Keeps the household-level pressure chapter distinct from dollar-price maps |
| Other / unknown | Medium / light grey | Preserves categories without implying an ordered financial meaning |
| Dwelling structure | Muted structural tones | Prevents dwelling categories from inheriting tenure meanings |

Sequential lightness, rather than rainbow hue, encodes rent and stress quantities. There is no red/green “good/bad” scale. Labels on dark heatmap cells switch to white only after a contrast-tested threshold; lighter cells use black. Line styles, shapes, labels and tables reduce dependence on colour perception.

## Classification honesty

There are **14 assessed figures**, including three map idioms. Under the unit’s published idiom list, **11** are advanced: waffle, treemap, alluvial and heatmap are named as advanced; all map idioms count as advanced for DV II; mosaic, histogram, box plot and parallel coordinates are not on the basic list. Scatterplot, multi-line CPI and paired dots are counted as basic. The list names connected dot plots as advanced, but Figure 14 is conservatively not counted.

The parallel-coordinates effectiveness concern is addressed with all 335 regions. The heatmap now uses 48 real cells; the trivial waterfall is absent. Rather than inflate the count with repetitive or weak additions, the implementation provides exact artefacts for an explicit classification decision. [REVIEW.md](REVIEW.md) makes that decision a submission gate and records what has not yet been approved.
