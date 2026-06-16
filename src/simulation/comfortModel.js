import { clamp } from '../shared/math.js';

export function computeComfort({ state, material, pattern, cell, airflow, moisture, thermal }) {
  const heatPenalty = thermal.thermalIndex * 0.9;
  const wetPenalty = moisture.retainedWater * 3.1 + moisture.clingRisk * 0.18;
  const pocketPenalty = airflow.pocketRisk * 0.18;
  const fragilityPenalty = (pattern.structurePenalty ?? 0) * 8;
  const comfortScore = clamp(100 - heatPenalty - wetPenalty - pocketPenalty - fragilityPenalty, 0, 100);

  const chillRisk = clamp(
    (airflow.exchange + cell.openArea * 2.4) * Math.max(0, 15 - state.temp) * (moisture.saturation + 0.05) * (0.65 + material.conductivity),
    0,
    48
  );

  const overheatingRisk = clamp(thermal.thermalIndex + airflow.pocketRisk * 0.15 - thermal.evaporationFlux * 0.7, 0, 100);

  return { comfortScore, chillRisk, overheatingRisk };
}
