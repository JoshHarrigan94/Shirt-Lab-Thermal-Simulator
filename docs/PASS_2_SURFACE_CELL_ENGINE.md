# Pass 2 — Surface Cell Engine v1

This pass upgrades ShirtLab from zone-only heuristics into a 3D surface-cell simulation scaffold.

## What changed

Each shirt is now split into 864 deterministic surface cells across front, back, left side and right side panels. Every cell stores:

- 3D position
- garment side
- body zone
- local open area percentage
- air gap
- wind exposure
- airflow
- fabric wetness
- evaporative cooling
- convective cooling
- thermal index
- comfort score
- chill risk
- cling risk

## Why this matters

Perforation patterns are no longer just a global modifier. A MothTech-style body-mapped pattern, a spine vent, DIY punched holes and large cut-outs now distribute open area differently across the 3D shirt surface.

This means placement affects the result:

- spine vents bias the back centreline
- MothTech-style holes bias heat-prone zones
- DIY holes create uneven local distribution
- micro-grids spread open area more evenly
- large cut-outs create higher local open area and structural penalty

## Current limitations

This is still CFD-lite, not validated engineering CFD. Airflow is approximated using side exposure, running-generated apparent wind, fit, air gap and local perforation. The next major upgrade is a dynamic airflow field and a visual perforation painter.
