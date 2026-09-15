# Review, rubric and submission gate

This is a concrete review checklist for the implemented site. It does not record approvals that have not happened. User approval is required before **push or deployment**, as explicitly requested.

## Current state

- [x] Assigned topic read from `A2Brief/TOPIC.md`: **Housing and Renting in Australia**.
- [x] Fourteen original Vega / Vega-Lite figures implemented.
- [x] Three proposed map idioms: choropleth, proportional-symbol map, tile cartogram.
- [x] AIHW state × payment cross-tab confirmed before implementation.
- [x] National context added to parallel coordinates: 335 regions.
- [x] Severe-burden cartogram and payment heatmap use distinct measures / breakdowns.
- [x] ABS and AIHW combined in one state comparison table with different dates/populations labelled.
- [x] Opening hook, original housing illustration, dwelling glyphs and concluding synthesis.
- [x] Equal 6/6 and 12 column structure; responsive rendering and data-table alternatives.
- [x] Authorship credit: Alp Tuna. AI assistance acknowledged.
- [ ] Alp Tuna has reviewed and approved the final visual design and text.
- [ ] Tutor has confirmed the map and advanced-idiom classifications below.
- [ ] Hand-drawn sketch created, discussed, scanned and hosted on Alp Tuna’s GitHub account.
- [ ] Student ID and studio details added to the official submission document.
- [ ] Destination GitHub repository URL supplied.
- [ ] Explicit permission to push the reviewed commits and publish received.
- [ ] Public signed-out verification completed after deployment.

## Explicit tutor decisions — do not treat discussion as approval

Show the actual local site and the JSON listed here. Record the tutor’s name/date, exact decision and any requested change. **Resolve these before final submission.**

| Question | Concrete artefact / rationale | Decision |
|---|---|---|
| Is this the assigned topic? | `TOPIC.md` wording and page opening match Housing and Renting in Australia. | Not recorded |
| Does the tile cartogram count as a third distinct map idiom? | `public/charts/severe.json`: eight geographic tiles in schematic positions, not a generic categorical matrix. | Not recorded |
| Is the proportional-symbol map a map idiom distinct from choropleth? Does it count as advanced under this rubric? | `renter-map.json`: projected SA4 positions; area encodes counts and colour encodes shares. | Not recorded |
| Does the histogram count as advanced? | `rent-distribution.json`: genuine quantitative binning and frequency aggregation. Histogram is discussed separately from categorical bars in the supplied table-idiom teaching material. | Not recorded |
| Does the waffle count as advanced? | `tenure.json`: explicit unit allocation with accurate printed values. Do not assume a separate idiom merely because it uses squares. | Not recorded |
| Are parallel coordinates meaningful with the implemented national context? | `profiles.json`: 335 lines × four independently scaled attributes, three highlighted examples. | Not recorded |
| Are ABS + AIHW sufficiently combined? | Conclusion’s side-by-side state table and synthesis explicitly connect both while distinguishing populations and dates. | Not recorded |

### Counting and revision rule

There are 11 proposed advanced idioms; scatterplot, multi-line CPI and paired dots are counted as basic. Excluding waffle, proportional symbols and tile cartogram leaves eight, **provided the histogram is accepted**. Discounting that too leaves seven. That risk is documented rather than concealed by counting basic marks differently.

If the tutor rejects the map count or leaves fewer than eight accepted advanced idioms, revise the inventory and sketch before submission. A dot-density map is a possible replacement only if a suitable small-area source supports defensible dot placement. Do **not** scatter dots uniformly through uninhabited SA3 polygons to gain an extra map, claim a choropleth of squares is automatically a spatial bin map, or invent a household joint distribution. Bring the tutor the option of a sourced dot-density replacement and obtain an explicit ruling before spending time on it. Adding weak or repeated charts is not a substitute for this decision.

## Rubric evidence and conditions

| Criterion | Weight | Evidence / final check |
|---|---:|---|
| Hand-drawn sketch | 2% | Four named chapters, opening/conclusion, full chart inventory and consistent grid. Must be hand drawn on A4, photographed/scanned clearly, hosted on the user’s GitHub account and consistent with the final site. Pending. |
| Idioms and complexity | 8% | 14 figures and three proposed maps; full What/Why/How table in IMPLEMENTATION.md. Classification gate above remains open. Effectiveness matters as well as count. |
| Layout | 3% | Repeated equal columns, shared sight lines, intentional full-width dense figures, no page horizontal scroll. Check screenshots and actual phone view. |
| Typography | 2% | Bitter explicitly matches built forms/housing; Public Sans for readable public information. Consistent hierarchy, sentence case, local font files and checked contrast. |
| Storytelling | 5% | Hook → four chapters → synthesis, definitions at first use, annotations, original illustration, purposeful glyphs and distinct chart questions. |
| Description | 2% | Domain, audience, dataset/attribute types, action–target Why and encoding rationale prepared in SUBMISSION.md / IMPLEMENTATION.md. Complete the actual official template. |
| Interview | 3% | Prepare project decisions **and all unit materials from Weeks 1–11** before the Week 12 studio. |

### Penalties and caps from the brief

- A page or embedded element that is not publicly accessible can result in **0**. Signed-out verification must check chart assets, JSON, fonts and sketch, not just the HTML page.
- Fewer than three distinct maps caps the idioms criterion at **4%**.
- A sketch on the wrong assigned topic incurs **3%** penalty.
- Only **Vega / Vega-Lite** charts are marked unless an exception is explicitly granted.
- The digital illustration and software screenshot do not satisfy the compulsory **hand-drawn sketch** requirement; a digitally created sketch receives no sketch mark.
- Late work is penalised **5% per day**, subject to the brief’s seven-day cutoff.
- The sketch PDF must be hosted on the student’s GitHub account.

## Hand-drawn sketch guide

Use an actual A4 sheet. This is a drawing guide, not a substitute submission asset:

1. Draw two equal columns, one gutter and consistent left/right edges.
2. Opening: title + short hook in the left column; house/townhouse/apartment illustration in the right. Add the four chapter links below.
3. Chapter 1: waffle | treemap, then mosaic | alluvial.
4. Chapter 2: full-width choropleth and insets, then full-width symbol map and insets; histogram | explanatory text.
5. Chapter 3: guided community buttons; scatter | box plot; full-width national parallel coordinates.
6. Chapter 4: CPI | severe-burden cartogram; full-width payment heatmap; paired dots | concise finding.
7. End with a two-column synthesis, two-source comparison and source/authorship notes.
8. Label the intended units, encodings, colours, legends, annotations and interactions. Show the stacked phone layout in a small margin note if space allows.

After feedback, keep the sketch and implementation aligned. Scan legibly to PDF and supply its eventual public URL in the official template.

## Schedule

| Date | Required outcome |
|---|---|
| 16–18 September | Review the working implementation, correct any author wording, confirm repository destination |
| Next available sketch discussion | Obtain the exact tutor decisions above; amend inventory and hand-drawn sketch together |
| By 9 October | Final data-release check, source/definition audit and content freeze |
| By 16 October | Complete all unit revision, project explanations and a timed mock interview |
| By 18 October | Interview preparation complete; public site and submission links checked |
| 19–23 October, Week 12 studio | Attend the assigned interview; it may happen early in the week |
| Before 25 October, 23:55 | Submit the completed official template, public page and hosted hand-drawn sketch |

The actual studio time must come from the student’s timetable. Do not schedule interview preparation after the interview may already have occurred.
