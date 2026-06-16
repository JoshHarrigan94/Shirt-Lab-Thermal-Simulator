# ShirtLab Architecture

ShirtLab is a static, browser-based 3D thermal clothing simulator. It is designed to be deployed on GitHub Pages without a build step.

## Runtime model

`index.html` imports `src/app/main.js` as an ES module. Three.js is loaded by import map from a CDN.

```text
index.html
  └── src/app/main.js
        ├── scene/ShirtScene.js
        └── ui/UIController.js
              └── comparison/compareShirts.js
                    └── simulation/simulateShirt.js
                          └── simulation/surfaceCells.js
```

## Main modules

### `/app`
Owns the app entry point and default state.

### `/scene`
Owns Three.js rendering, camera, body mesh, shirt shell, surface-cell dots and airflow arrows.

### `/ui`
Owns DOM controls, labels, result rendering and CSS.

### `/simulation`
Owns the current heuristic thermal, moisture, airflow and surface-cell calculations.

### `/comparison`
Owns A/B comparison, claim checks and result interpretation.

### `/materials`
Owns fabric presets.

### `/garment`
Owns fit presets now; later this becomes the home of shirt cuts, sleeves, necklines, hems and air-gap rules.

### `/perforation`
Owns pattern presets now; later this becomes the home of hole generators, pattern painters and structural penalties.

### `/environment`
Owns activity presets and later weather/scenario presets.

### `/config`
Owns body zone definitions and shared product constants.

## Current limitation

The current engine is still heuristic rather than validated CFD. Pass 3 improves sustainability, not physical fidelity.

## Pass 4 module boundary: `/src/perforation`

The perforation folder now owns all hole and pattern behaviour:

- `holeGeometry.js` — hole shape, edge finish and open-area calculations.
- `patternGenerator.js` — maps pattern intent onto surface cells.
- `perforationAnalysis.js` — evaluates placement efficiency, fragility and DIY replicability.
- `perforationPresets.js` — pattern catalogue.

Future perforation upgrades should happen here first, then expose only stable metrics to `/simulation` and `/ui`.

## Pass 7 comparison layer

The comparison layer now sits above the simulation engine. It does not replace the physics modules. It consumes simulated shirt outputs and produces decision scores for product appraisal.

Flow:

```text
UI state
  -> simulateShirt(A/B/C)
  -> scoreDecision()
  -> rankShirts()
  -> compare()
  -> UI ranking / score breakdown / interpretation
```

This keeps claim testing separate from physical estimation. Future improvements can target the physics layer without rewriting the comparison UI.
