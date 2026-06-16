# Pass 4 — Perforation Engine v1

Pass 4 targets the `/src/perforation` module. The goal is to move perforation from simple preset percentages into a more extensible design system that can compare body-mapped premium perforation against DIY punched holes, micro-grid holes, slit vents, mesh panels and large cut-outs.

## What changed

- Added `holeGeometry.js` for hole shape, edge finish and theoretical open-area calculations.
- Added `patternGenerator.js` for cell-level pattern masks and placement logic.
- Added `perforationAnalysis.js` for placement efficiency, fragility, clog-risk and DIY-replicability metrics.
- Expanded `perforationPresets.js` with geometry metadata for each pattern.
- Updated the surface-cell engine so each cell receives pattern-specific open area instead of a generic distribution.
- Updated the readout to show estimated hole count, placement efficiency, fragility and clog risk.

## Supported pattern families

- `bodyMapped` — heat/sweat zone-biased pattern similar to premium body-mapped ventilation concepts.
- `diy` — irregular punched holes with higher fray and lower precision.
- `microGrid` — many small perforations with lower structural penalty but weaker local flow.
- `spine` — concentrated back/spine venting.
- `largeCutout` — high open-area cut-outs with larger structural and chill-risk penalties.
- `mesh` — mapped mesh panels with high permeability and low edge-fray risk.

## New metrics

| Metric | Meaning |
|---|---|
| Estimated holes | Approximate hole count across the surface-cell representation. |
| Placement efficiency | Whether open area is concentrated in cells that actually improve cooling/evaporation. |
| Fragility | Structural weakness/fray penalty from open area, edge length and finish type. |
| Clog risk | Risk that small/irregular openings become less useful when fabric is wet or sweat-heavy. |
| DIY replicability | Whether a similar effect could plausibly be reproduced with low-cost modification. |

## Important limitation

The app still does not cut actual holes into the 3D mesh. Openings are simulated as surface-cell properties and visual dots. True mesh boolean cut-outs are a later `/scene` + `/garment` pass.
