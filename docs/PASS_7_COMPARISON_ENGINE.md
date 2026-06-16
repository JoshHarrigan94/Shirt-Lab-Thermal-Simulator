# Pass 7 — Comparison Engine

Pass 7 upgrades ShirtLab from a two-shirt visual simulator into a decision engine.

## Scope

Target folder: `/src/comparison`

This pass intentionally avoids changing the low-level simulation and scene engines except where the UI needs to display comparison outputs.

## Added modules

- `scenarios.js` — reusable environmental/activity scenario presets.
- `decisionScores.js` — converts simulation metrics into product decision dimensions.
- `rankShirts.js` — ranks Shirt A, B and C by overall context-specific performance.
- `compareShirts.js` — orchestrates the comparison workflow.

## Decision dimensions

Each shirt is scored across:

- Cooling during effort
- Sweat management
- Thermal safety
- Stability / stagnant air pocket risk
- Value-for-money
- Overall decision score

## Product value

This pass moves the product closer to the original vision: not just showing heat maps, but challenging claims such as “body-mapped perforation improves cooling” under different weather and effort contexts.

The app can now distinguish:

- a shirt that cools well but has poor value
- a shirt that wins in dry heat but loses in humid still air
- a shirt that has large open area but becomes risky in cold wind
- a shirt that has decent physics but weak placement efficiency

## Important limitation

The comparison engine is still only as credible as the simulation model underneath it. The rankings should be treated as directional until validated against field tests.
