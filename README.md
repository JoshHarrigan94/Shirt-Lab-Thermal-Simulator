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

