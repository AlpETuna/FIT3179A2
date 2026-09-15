# Design system

## Direction
Daylight reading at a kitchen table: white surface, charcoal ink, sturdy serif headlines and quiet chart furniture. Six/six and full-width grid spans, with a single consistent middle sight line.

## Colour
CSS source tokens use OKLCH. Chart specifications use equivalent sRGB values for Vega colour-parser compatibility.

| Role | OKLCH | sRGB equivalent |
|---|---|---|
| Background | oklch(1 0 0) | #ffffff |
| Ink | oklch(0.23 0 0) | #1d1d1d |
| Supporting text | oklch(0.46 0 0) | #585858 |
| Renting / primary accent | oklch(0.48 0.115 50) | #8f4715 |
| Mortgage | oklch(0.49 0.105 250) | #2b6399 |
| Owned outright | oklch(0.55 0.095 180) | #158374 |
| Rental pressure | oklch(0.43 0.12 325) | #6f3473 |

Sequential lightness encodes quantity. Tenure hues never switch meaning. Unknown categories stay separate. Selected regions use dark outlines or direct labels, not a competing categorical palette.

## Typography
Local Bitter headings evoke sturdy built forms; local Public Sans provides a clear public-information voice. Body 18px/1.6, captions at least 13px, chart labels at least 13px. Display ceiling 64px. Prose measure 65ch. Left-aligned, sentence case, tabular numerals.

## Layout and behaviour
Maximum width 1120px. Equal columns with 32px gutter, stacking when individual figures would be below a readable width. Full-width maps and genuinely dense figures. Generous chapter spacing, shared figure rules, no repetitive cards. Default content is visible. Three example regions are optional guided highlights, not a dataset explorer.

## Illustrations
Original clean vector dwelling elevations; qualitative illustrations only. House/apartment glyphs identify dwelling types, never rental versus ownership status.
