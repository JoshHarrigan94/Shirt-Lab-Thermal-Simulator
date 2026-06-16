# Pass 3 — Repository Refactor

Pass 3 reorganises ShirtLab into a sustainable, folder-by-folder architecture while keeping the app static and GitHub Pages-ready.

## Goal

Stop rebuilding the whole product for every upgrade. Future passes should target one folder/module at a time, with clear ownership and minimal side effects.

## What changed

The previous flat `src/` folder has been split into product modules:

```text
src/
├── app/             # app entry point and default state
├── comparison/      # A/B comparison orchestration
├── config/          # body zones and shared constants
├── environment/     # activity/weather presets
├── garment/         # fit and garment-shape logic
├── materials/       # material database
├── perforation/     # perforation presets and future generators
├── scene/           # Three.js scene and rendering
├── shared/          # small utilities
├── simulation/      # thermal/moisture/airflow calculations
└── ui/              # controls, readouts and CSS
```

## Behaviour

This pass is intentionally low-risk:

- no npm
- no build step
- no `node_modules`
- same GitHub Pages deployment model
- same current simulator behaviour
- same UI and visual modes

## Future pass rules

Each future pass should have a clear target folder:

- `/garment` for shirt shape, cuts, sleeves and air-gap modelling
- `/perforation` for hole generators, pattern painting and open-area maths
- `/simulation` for physics improvements
- `/scene` for 3D visuals and rendering
- `/comparison` for product scoring and scenario ranking
- `/validation` for real-world testing and prediction-vs-reality logging

## Why this matters

This creates a product architecture where the simulator can mature without becoming a single tangled demo file. The product can now grow into a credible thermal clothing lab through controlled passes.
