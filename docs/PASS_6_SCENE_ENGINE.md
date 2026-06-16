# Pass 6 — Scene Engine Upgrade

Pass 6 targets `/src/scene` only. The aim is to improve the 3D product experience without changing the simulation, material, perforation, comparison or validation contracts.

## Added scene modules

- `colorMaps.js` — centralised thermal, airflow, moisture, perforation and comfort colour functions.
- `scenePrimitives.js` — reusable body, shirt shell, sleeves, collar, hem and floor-grid primitives.
- `airflowParticles.js` — lightweight animated airflow particle layer for airflow view.
- `cameraPresets.js` — front, back, side, top and 3/4 camera positions.

## Visual improvements

- More detailed athlete body shell.
- More readable shirt garment shell with collar, hem and sleeve primitives.
- Improved lighting, tone mapping and floor grid.
- Cell-based surface heatmap remains the primary visual layer.
- Perforation markers are now generated from actual high-open-area surface cells rather than random zone dots.
- Added animated airflow particles in airflow view.
- Added comfort view as a fifth visual mode.
- Added camera preset buttons.
- Added small Shirt B comparison ghost in the scene so the viewer retains A/B comparison context.

## Product rationale

The original vision depends on seeing how airflow, heat and moisture wrap around a 3D body and garment. Pass 6 improves the credibility of the visible simulator while keeping the app static and GitHub Pages-ready.

## Still heuristic

This is not yet real CFD or actual cloth simulation. The visual engine renders values produced by the Pass 5 simulation models. Future scene upgrades should add real garment meshes, panel cut geometry and optional WebGPU field effects.
