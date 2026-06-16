import { clamp } from '../shared/math.js';

export function computeMoisture({ state, activity, material, fit, pattern, cell, airflow }) {
  const humidityFraction = state.humidity / 100;
  const vapourDeficit = clamp(1 - humidityFraction, 0.05, 1);
  const sweatProduction = cell.zoneSweat * state.sweat * activity.metabolic * (0.74 + state.effort * 0.035) * (0.92 + cell.v * 0.18);
  const absorptionLoad = sweatProduction * material.moistureAbsorption * (0.72 + fit.contact * 0.28);

  const clogPenalty = (pattern.clogRisk ?? 0) * (humidityFraction * 0.22 + state.sweat * 0.018);
  const ventilationDrying = airflow.exchange * material.dryingRate * vapourDeficit * (0.92 + cell.openArea * 1.2) * (1 - clamp(clogPenalty, 0, 0.45));
  const wickingSpread = material.wicking * (0.38 + fit.contact * 0.2 + airflow.turbulence * 0.14);
  const evaporationRate = clamp((ventilationDrying + wickingSpread) * sweatProduction * 0.12, 0, 2.6);

  const retainedWater = clamp(absorptionLoad * (1 + humidityFraction * 0.72) - evaporationRate * 3.6, 0, 18);
  const saturation = clamp(retainedWater / 14, 0, 1.4);
  const clingRisk = clamp(saturation * material.cling * fit.contact * 100, 0, 100);
  const dryingHalfLife = clamp((material.moistureAbsorption * 38) / (material.dryingRate * (1 + airflow.exchange * 0.45) * vapourDeficit + 0.08), 3, 180);

  return {
    sweatProduction,
    retainedWater,
    saturation,
    evaporationRate,
    clingRisk,
    dryingHalfLife,
    humidityPenalty: humidityFraction
  };
}
