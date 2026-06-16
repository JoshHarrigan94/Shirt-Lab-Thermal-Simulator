# Simulation Model

## Current model type

The current model is heuristic and zone-based. It uses a 3D visual representation, but the physics is currently calculated per body/clothing zone rather than full CFD cells.

## Main systems

```text
athlete heat output
+ sweat production
+ environmental stress
- convective cooling
- evaporative cooling
+ insulation retention
+ moisture cling penalty
= thermal comfort estimate
```

## Key variables

### Athlete

- activity speed
- metabolic load
- effort
- sweat rate
- zone-specific heat and sweat coefficients

### Environment

- air temperature
- humidity
- wind speed
- apparent wind from movement
- sun exposure

### Garment

- fabric air permeability
- moisture absorption
- drying rate
- wicking rate
- cling factor
- fit/contact
- air gap
- perforation open area

## Why this is useful before full CFD

The product needs rapid comparison and iteration. A zone-based heuristic model lets us test product logic, UX and validation methods before moving to computationally expensive CFD.

## Next physics upgrade

1. Replace zone averages with garment surface cells.
2. Add cell-neighbour heat/moisture exchange.
3. Add WebGPU field approximations for airflow.
4. Add imported garment meshes.
5. Validate outputs against practical shirt tests.


## Surface Cell Engine v1

The simulator now generates a deterministic shirt surface mesh of 864 cells. Each cell is assigned to a body zone and receives local open-area, air-gap, side-exposure and material properties. Zone results are now aggregates from the underlying cell field, so spatial distribution matters.

The current model is intentionally lightweight for GitHub Pages: it approximates convection, evaporation, wetness, thermal retention and chill risk without requiring server-side CFD.
