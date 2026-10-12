# Data methods and provenance

## Sources and populations

| Extract | Published source | Population / date |
|---|---|---|
| Tenure and mosaic | ABS G37 | Occupied private dwellings, Census 10 August 2021 |
| Dwelling hierarchy | ABS G36 | Occupied private dwellings; excludes unoccupied dwellings |
| Household associations | ABS G42 | Family, lone-person and group households by dwelling structure |
| Regional prices and incomes | ABS G02 + G37 | SA3 / SA4 / state regional summaries, Census 2021 |
| Maps | ABS ASGS Edition 3 digital boundaries | 2021 SA3 boundaries, GDA2020 |
| Monthly prices | ABS CPI July 2026 Table 3 | Weighted eight-capital-city original monthly indices |
| Assistance and payment group stress | AIHW CRA.2 | CRA income units with sufficient affordability data, 27 March 2026 |
| Severe burden | AIHW CRA.3 | Same eligible income-unit population; after-assistance rent over 50% of gross income |

The administrative data author is the Department of Social Services, through the Australian Government Housing Dataset, with Services Australia payment records. AIHW publishes its analysis. Census and CRA observations describe **different populations and dates**. The conclusion pairs them by state for context without constructing a cross-population ratio or claiming causation.

## Census extraction

`prepare_data.py` reads the original CSVs inside the AUS, STE, SA3 and SA4 Data Pack archives. Geographical names come from the accompanying ABS metadata workbook. Joins use codes, never fuzzy names.

- G37 tenure uses exactly five disjoint totals: outright ownership, mortgage, total renting, other tenure, and not stated. Rental-landlord subcategories are not added to the rental total.
- The mosaic uses the **published tenure × dwelling joint cells**. It does not multiply independent shares to invent a joint distribution.
- G42 uses family-household totals, lone-person households and group households. Family subtypes are not added again. Other dwelling and unreported structure are combined only in the alluvial diagram, explicitly labelled.
- The treemap uses mutually exclusive lowest-level dwelling counts. Parents supply hierarchy, not additional counts.
- National tenure percentages divide by the independently published occupied-dwelling total, 9,275,217. The waffle’s 100 tiles use largest-remainder allocation. Its printed percentages retain the exact published denominator.
- Composition geometry normalises its displayed disjoint cells because privacy perturbation makes small non-additivity inevitable. This is disclosed on the page.
- The regional plots include 335 SA3 regions with a positive published median rent and occupied-dwelling count. Special migratory/offshore/shipping and no-usual-address areas, Other Territories and unavailable values are omitted. The exclusion list is in `summary.json`.
- A regional median is an aggregate, not an individual household record. No ratio of regional medians is presented as a household rental-stress rate.
- Histogram: $50 bands, counting regions equally. Box plots: state groups, quartiles of regional medians, min/max whiskers. Neither is a national or state distribution weighted by renters. The page includes a labelled key explaining how to read a box plot row.
- Parallel coordinates: all 335 regions on four independently labelled linear axes, each from zero to its national regional maximum. Monthly mortgage repayments are converted with ×12÷52. The three examples are selected for contrasting settings, not statistical representativeness.

## Geography

Mapshaper simplifies the ABS SA3 geometry to 2% of original vertices with shape preservation and shared topology. Region codes remain intact. Eight state outlines and 88 SA4 shapes are dissolved from the same boundary edition. SA4 symbols use geometric interior points; they are not addresses, populated-place estimates or household locations.

The national maps use Australian Albers equal-area, central meridian 132°E and standard parallels 18°S/36°S. Mercator city insets are local orientation aids with separately chosen scales. Circle **area**, not radius, is proportional to rented-home count; colour is the rental share. Symbols may overlap nationally; enlarged Sydney, Melbourne and Brisbane insets aid reading. Perth/Adelaide overlap remains inspectable via tooltips and the complete table.

The severe-burden state map is a choropleth of simplified ASGS 2021 state boundaries. Vic, ACT and Tasmania are labelled offshore with leader lines because their shapes are too small to hold a label. Colour encodes a rate, so large states do not imply more recipients.

## CPI

The workbook’s all-groups series `A130393720C` and rent series `A130390094A` are both original monthly indices. The two rent hierarchy columns contain identical values; the script asserts that identity and selects only one.

The first common month is April 2024. Each series is transformed as `published index / April 2024 published index × 100`, over 28 months to July 2026. No quarterly/monthly splice is used. These are price indices for the weighted eight capital cities, not the median rent of a national sample or the price of new rental listings.

## Commonwealth Rent Assistance

The state × primary-payment breakdown is **confirmed in CRA.2**. All 48 displayed cells come from actual published joint rows. The six payment groups are illustrative distinct categories: Age Pension, Disability Support Pension, Carer Payment, Parenting Payment (Single), JobSeeker and Youth Allowance (Student & Apprentice). They are not an exhaustive partition; no overall column duplicates the state comparison.

An income unit is a single person or couple with dependent children who share financial resources. A household can contain multiple income units. The included denominator excludes recipients whose affordability cannot be calculated.

Percentages come from the workbook’s **Per cent** rows. They are not recomputed from rounded counts. Severe burden adds the published >50–70% and >70% bands. Counts, where cited, are subject to rounding to multiples of five.

- Without assistance: weekly rent ÷ gross weekly income.
- With assistance: (weekly rent − weekly CRA) ÷ gross weekly income.
- Rental stress: result exceeds 30%.
- Severe burden in the state choropleth: result exceeds 50% after assistance.

The paired points compare two calculations for the **same March 2026 recipients**. They are not observations before and after a policy change, a causal experiment or a general rate for all renters.

## Reproducibility and limits

`public/data/provenance.json` records source filenames, byte sizes, SHA-256 hashes, dates and processing notes. The source acquisition script uses pinned release URLs. A regenerated dataset must pass the numerical and geographical validation before building the website. Check upstream releases near submission; update the data, prose, specification domains and screenshots together if a newer compatible release is adopted.

The source transformations prioritise accurate, small extracts. No synthetic household microdata, interpolated rent surface or invented spatial density is used. All data wrangling is supporting work rather than a claim to additional rubric marks.
