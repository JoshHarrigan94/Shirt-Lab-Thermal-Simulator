# ShirtLab Thermal Simulator

A static GitHub Pages prototype for comparing athletic shirt performance across fabric, fit, perforation, airflow, moisture and environment.

## Run locally

No install required. Open `index.html` in a browser, or use a local static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Unzip this folder.
2. Upload all contents to the root of your GitHub repository.
3. Do **not** add `node_modules`.
4. In GitHub: Settings → Pages → Deploy from branch → `main` → `/root`.

## Current features

- 3D athlete + translucent garment shell
- Thermal, airflow, moisture and perforation views
- Material presets: cotton, perforated cotton, polyester, mesh polyester, merino
- Fit presets: compression, athletic, regular, loose, oversized
- Perforation presets: none, MothTech-style, DIY punch, micro grid, spine vent, large cut-outs
- Weather controls: temperature, humidity, wind and sun
- Activity controls: walking, running, hiking and cycling
- Shirt A vs Shirt B comparison engine
- Zonal scoring across chest, abdomen, back, underarm, shoulders and neck

## Important limitation

This is not engineering-certified CFD. It is a product scaffold and heuristic simulator designed for iteration, validation and experimentation.



## Pass 2 upgrade

This build includes Surface Cell Engine v1. Each shirt is split into 864 3D surface cells, making perforation placement, air gap, airflow, moisture and thermal values spatial rather than only zone averaged. See `docs/PASS_2_SURFACE_CELL_ENGINE.md`.

## Pass 3 upgrade

This build includes the repository refactor pass. The simulator is now organised into module folders so future upgrades can target one folder at a time instead of regenerating the whole app. See `docs/PASS_3_REPO_REFACTOR.md` and `docs/ARCHITECTURE.md`.

## Pass 4 update

Pass 4 adds the Perforation Engine v1: hole geometry, edge finish, pattern families, cell-level open-area generation, placement efficiency, fragility, clog-risk and DIY-replicability metrics. See `docs/PASS_4_PERFORATION_ENGINE.md`.

## Pass 5 update

Pass 5 adds Simulation Engine v1. The heuristic model is now split into separate airflow, moisture, thermal flux and comfort modules. It reports convection, evaporation, conduction, microclimate temperature, drying half-life and stagnant pocket risk. See `docs/PASS_5_SIMULATION_ENGINE.md`.

## Pass 6 — Scene Engine

This version upgrades the `/src/scene` layer with modular scene primitives, centralised colour maps, camera presets, animated airflow particles, deterministic cell-based perforation markers, a comfort visual mode and a small Shirt B comparison ghost.

The app remains a static GitHub Pages build: no `node_modules`, no bundler and no build step.


## Pass 8 update

Pass 8 adds the comparison engine:

- Shirt A vs Shirt B vs Shirt C
- Scenario presets
- Overall decision ranking
- Cooling / sweat / safety / value score breakdown
- Trade-off cards
- MothTech-style claim check
- Context-aware interpretation text

The app remains a static GitHub Pages project with no `node_modules` and no build step.


## Pass 8 validation engine

This build adds practical field-test logging and calibration hooks. Use the Validation Test panel to record real run tests, wet shirt weight, drying time and subjective comfort. The app stores up to 50 local records in browser storage and can export them as JSON for future analysis.

New module:

```text
src/validation/
```

Main document: `docs/PASS_8_VALIDATION_ENGINE.md`.
