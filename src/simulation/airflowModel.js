import { clamp } from '../shared/math.js';

export function computeAirflow({ state, activity, material, fit, pattern, cell }) {
  const apparentWind = state.wind + activity.speedKmh * 0.72;
  const windPressure = Math.sqrt(Math.max(apparentWind, 0)) / 3.8;
  const directionAccess = cell.normalWindAccess * (0.72 + cell.edgeExposure * 0.28);
  const basePermeability = material.airPermeability * (0.62 + directionAccess * 0.38);

  const holeFlow = cell.openArea * (pattern.airflowCoefficient ?? 1) * (2.1 + windPressure * 1.35);
  const movementPump = fit.movementPump * (0.45 + activity.speedKmh / 22) * (0.62 + cell.airGap * 0.88);
  const stackVent = clamp((cell.v - 0.35) * 0.35 + cell.openArea * 0.3, 0, 0.42);

  const stagnantPocket = clamp((fit.airGap - 0.58) * (state.wind < 8 ? 0.5 : 0.16) * (1 - cell.openArea * 1.8), 0, 0.42);
  const crossflow = clamp((directionAccess * windPressure + movementPump + holeFlow) * (1 - stagnantPocket), 0, 3.6);
  const exchange = clamp(basePermeability + crossflow + stackVent - stagnantPocket, 0, 3.8);
  const turbulence = clamp(holeFlow * 0.38 + movementPump * 0.25 + cell.edgeExposure * 0.18, 0, 1.6);
  const pocketRisk = clamp(stagnantPocket * 100 + fit.airGap * 14 - cell.openArea * 30 - apparentWind * 0.35, 0, 100);

  return {
    apparentWind,
    velocity: exchange,
    exchange,
    turbulence,
    pocketRisk,
    stagnantPocket
  };
}
