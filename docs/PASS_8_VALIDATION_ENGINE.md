# Pass 8 — Validation Engine

## Purpose
Pass 8 adds a practical validation layer so ShirtLab can compare simulated shirt performance against real-world field tests.

The simulator remains a static GitHub Pages app: no backend, no `node_modules`, no build step. Validation records are stored in browser `localStorage` and can be exported as JSON.

## Added folder

```text
src/validation/
├── calibrationModel.js
├── experimentStore.js
├── index.js
└── validationProtocols.js
```

## What it now supports

- Field-test logging for Shirt A, B or C
- Protocol selection: run test, drying rack, stop-start chill, DIY perforation test
- Dry shirt weight and post-run wet weight
- Drying time
- Comfort during effort
- Comfort during rest
- Cling/chafe feel
- Perceived heat
- Wetness feel
- Notes
- Observed score calculation
- Predicted-vs-observed error
- Calibration confidence
- Calibration hints
- Exportable JSON validation dataset

## Why this matters
The original vision was not just to make a visual simulator. It was to cut through sportswear claims.

The validation engine turns the project into a feedback loop:

```text
Prediction → real run → observed score → prediction error → calibration hint
```

This is the first step toward making the model more credible and less speculative.

## Current limits

- Validation data is local to the browser unless exported.
- Observed score is still heuristic.
- No automatic weather API integration yet.
- No wearable import yet.
- No statistical calibration across repeated matched tests yet.

## Recommended next pass
Pass 9 should target `/garment` and improve garment geometry: real shirt cuts, neckline, sleeve length, side splits, hem length, fit-air-gap behaviour and panel zones.
