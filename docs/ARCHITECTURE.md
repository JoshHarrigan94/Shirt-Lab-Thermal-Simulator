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
