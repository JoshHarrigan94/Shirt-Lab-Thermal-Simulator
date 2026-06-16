# Pass 5 — Simulation Engine v1

## Purpose

Pass 5 upgrades the simulator from a single blended heuristic into a modular physics-inspired model. The goal is not certified CFD, but a more credible static-browser simulation layer that can evolve toward validation.

## Folder targeted

`/src/simulation`

## New modules

- `airflowModel.js` — apparent wind, garment exchange, turbulence and stagnant pocket risk.
- `moistureModel.js` — sweat input, retained fabric water, saturation, evaporation and drying half-life.
- `thermalModel.js` — conductive, convective and evaporative flux plus microclimate temperature.
- `comfortModel.js` — thermal comfort, overheating, chill and cling penalties.

## What changed

Previous passes treated airflow, wetness and thermal stress mostly as a combined score. Pass 5 separates them so the app can explain *why* one shirt wins:

- Does it cool through convective airflow?
- Does it evaporate sweat better?
- Does it trap stagnant air pockets?
- Does it dry faster?
- Does perforation create cooling or just structural fragility?

## Added outputs

Each shirt now reports:

- Average convective flux
- Average evaporative flux
- Average conductive flux
- Average microclimate temperature
- Average drying half-life
- Worst stagnant pocket risk
- Overheating and chill risk at cell and zone level

## Product relevance

This makes the MothTech-style challenge more meaningful. A perforated shirt can now win or lose for different reasons depending on weather, sweat rate, fabric and fit.

For example:

- Hot/dry + movement: perforation and mesh can increase evaporation and convection.
- Hot/humid: open area helps less if evaporation is suppressed.
- Cool/windy/wet: open area can create chill risk.
- Loose shirts: may ventilate well, but can develop stagnant pockets in low wind.

## Remaining limitations

- Airflow is still CFD-lite, not real computational fluid dynamics.
- Shirt holes are still represented as surface-cell open area rather than true mesh cut-outs.
- No garment billowing or cloth physics yet.
- No real-world validation data is connected yet.

## Next recommended pass

Pass 6 should target `/garment` or `/scene`:

- `/garment`: richer shirt cuts, sleeve lengths, neck openings, hems, panel zones and air-gap maps.
- `/scene`: better 3D geometry, visual heat map quality, airflow particles and side-by-side camera polish.
