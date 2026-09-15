# Prepared submission text and interview revision

Transfer the final reviewed text into `DV2 - Assignment Template v3.0.docx`. That supplied template, including its screenshots and URLs, remains the required submission artefact. Do not submit this Markdown as a substitute unless the tutor explicitly allows it.

## Identification

- **Name:** Alp Tuna
- **Student ID:** TO COMPLETE
- **Studio / tutor / time:** TO COMPLETE
- **Visualisation URL:** TO COMPLETE AFTER APPROVED DEPLOYMENT
- **GitHub repository:** TO COMPLETE
- **Hand-drawn sketch PDF URL on own GitHub account:** TO COMPLETE
- **Full-page final screenshot:** INSERT AFTER FINAL APPROVAL

## Domain description

The visualisation examines housing and renting across Australian communities. It compares tenure, dwelling structure and household composition, then relates regional median housing costs to income and dwelling profiles. A final chapter brings in monthly price change and rental-stress measures among Commonwealth Rent Assistance recipients. The assigned topic is “Housing and Renting in Australia”.

## Why and who

The intended audience is the general Australian public, with no assumed knowledge of Census regions or statistical graphics. The purpose is to present an evidence-led story: summarise the national housing mix, locate regional differences, compare income/cost profiles, and explain how assistance changes a clearly defined measure of rental burden. It is a presentation with a small set of guided community highlights rather than an unrestricted analysis tool.

The principal action–target pairs are summarise part-to-whole, compare distributions, locate spatial variation, identify associations, compare multivariate profiles and compare paired magnitudes. Each individual chart’s action–target pair appears in IMPLEMENTATION.md.

## What

The source datasets are ABS Census 2021 General Community Profiles (G02, G36, G37, G42), ABS ASGS 2021 spatial boundaries, original monthly ABS CPI indices through July 2026 and AIHW Commonwealth Rent Assistance tables for March 2026. CRA administrative records are provided by the Department of Social Services in the Australian Government Housing Dataset and draw on Services Australia payment data; AIHW is the analytical publisher.

The table datasets contain categorical attributes (region/state, tenure, dwelling form, composition and payment category), ordered temporal attributes (month), and quantitative attributes (counts, proportions, medians and price indices). The dwelling hierarchy is a tree derived from the published classification. Geographic boundaries provide geometry joined by official codes. Census households and CRA income units differ in population and date, so they are not treated as interchangeable observations.

## How

The fourteen assessed figures use original Vega and Vega-Lite specifications. Composition is shown with a waffle, treemap, mosaic and alluvial diagram. A choropleth maps regional median rents; a proportional-symbol map separates rented-home counts and shares; a histogram shows the frequency of regional rent ranges. Scatter, box plots and parallel coordinates place three featured communities within national context. The final chapter uses a monthly line chart, schematic state cartogram, payment-group heatmap and paired-dot assistance comparison.

The layout uses two equal columns and deliberately chosen full-width figures, preserving shared alignment. It becomes one column on smaller screens. Bitter’s structural serif forms explicitly match the housing topic; Public Sans makes explanatory text and chart labels easy to read. Tenure colours keep consistent meanings. Sequential lightness encodes quantities; shapes, line styles, printed values and accessible data tables supplement colour.

The reader can highlight Melbourne City, Casey–South or Bendigo. This updates the scatterplot and parallel-coordinates view using the Vega View API while retaining all national context. Explanatory text, source dates, plain-language definitions, original dwelling illustrations and a conclusion guide the reader through the story. Every figure includes a source link, readable JSON and data-table alternative.

## Authorship and AI acknowledgement

Design, development and writing: Alp Tuna, with OpenAI Codex assistance for implementation, data processing, draft prose and validation. Alp Tuna reviews and is responsible for the submitted work and its source interpretation. The site uses original chart specifications and architectural illustrations; it does not claim AI-generated work as solely human-authored. Check the unit’s current AI declaration wording and include any required additional disclosure.

## Interview: project questions to practise

Explain these without reading the source code:

1. Why does the choropleth use a median while the symbol map uses counts? Why would colouring land by rented-home counts be misleading?
2. What does each axis or channel in the mosaic encode? Where do its joint cells come from?
3. Why is the alluvial diagram an association rather than movement? How did you avoid adding overlapping totals?
4. What is the denominator of each Census share? Why might its components not add exactly?
5. What is a regional median? Why is the centre of a state box plot not the state household median?
6. What does each grey profile line represent? How do the independent axis scales work?
7. Why choose three Victorian examples? Why are they not a national representative sample?
8. Why is the histogram retained, and how does its task differ from the box plot and map? State the tutor’s classification rather than inventing one.
9. What does CPI = 110 mean on this page? Why start at April 2024? Why not join quarterly and monthly series?
10. What is a CRA income unit, and how does it differ from a Census household?
11. What is actually changed between the two paired-dot calculations? Why is it not a causal before-and-after study?
12. How was the state × payment heatmap verified? Which categories are omitted, and why is there no overall column?
13. What does the cartogram sacrifice and gain? What exactly did the tutor accept as a map idiom?
14. Why use Albers nationally and Mercator in local insets? Why are circle centres not household locations?
15. How do keyboard users and readers with colour-vision differences access the same evidence?
16. How do separate Vega views share the case-study selection? What happens if a chart fails to load?
17. Explain any chart from the readable JSON: data → transformation → mark → encoding → interaction.
18. What work did AI assist with, what did you verify, and what limitations remain?

## Interview: the whole unit, Weeks 1–11

The interview is not limited to this project. Use the actual Week 1–11 LMS sequence; the locally supplied PDFs do not establish a complete week-by-week syllabus. Revisit any missing weekly material from the LMS before 18 October.

The supplied teaching files support these revision blocks:

| Block | Be able to explain and apply |
|---|---|
| Data and task abstraction | Tables, trees, geometry; categorical, ordered and quantitative attributes; domain questions versus abstract action/target tasks |
| Marks and channels | Point, line and area marks; position, length, area, colour, shape; effectiveness and expressiveness; why mark shape alone does not define an idiom |
| Table idioms | Composition, association, distribution, ranking, hierarchy and multivariate comparison; choosing an idiom for a task rather than novelty |
| Data-ink and chartjunk | When ink helps understanding; avoid misleading decoration while retaining useful context, annotation and legends |
| Storytelling | Presentation versus exploration, ordered narrative, opening hook, explanation, annotations and conclusion |
| Colour | Categorical/sequential/diverging schemes, lightness ordering, accessibility and consistent semantics |
| Layout | Grid alignment, grouping, white space, balance, sight lines and responsive composition |
| Typography | Hierarchy, typeface/topic fit, readability, line length, size and restrained emphasis |
| Map projections | Preservation and distortion of area, shape, distance and direction; choosing projections for the question |
| Map idioms | Choropleths, proportional symbols, dots and bins; extensive versus intensive measures; placement and aggregation assumptions |
| Vega / Vega-Lite and web delivery | Data transforms, encodings, selections/signals, valid specifications, local/remote data, public hosting and accessible embedded elements |

Practise with examples that are **not** on this website, then defend a design trade-off in this project. Complete one timed mock interview by 16 October; finish revision by 18 October, before the Week 12 studio window of 19–23 October.
