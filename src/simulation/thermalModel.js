import { clamp } from '../shared/math.js';

export function computeThermalFlux({ state, activity, material, fit, cell, airflow, wetness }) {
  const skinTemp = 34.2 + activity.metabolic * 0.38 + state.effort * 0.18 + cell.zoneHeat * 0.11;
  const ambientTemp = state.temp + state.sun * 0.9;
  const deltaSkinAir = Math.max(0, skinTemp - ambientTemp);

  const fabricResistance = 0.38 + (1 - material.conductivity) * 1.15 + fit.airGap * 0.46;
  const wetConductivityBridge = 1 + wetness.saturation * material.cling * 0.38;
  const holeInsulationLoss = 1 - cell.openArea * 0.72;

  const conductiveFlux = clamp(
    (deltaSkinAir / fabricResistance) * material.conductivity * wetConductivityBridge,
    0,
    18
  );

  const convectiveCoefficient = 2.2 + airflow.velocity * 4.8 + cell.edgeExposure * 0.55;
  const convectiveFlux = clamp(
    convectiveCoefficient * deltaSkinAir * 0.085 * (1 + cell.openArea * 0.55) * (1 - fit.contact * 0.11),
    0,
    22
  );

  const evaporationFlux = clamp(
    wetness.evaporationRate * 9.8 * (1 + airflow.exchange * 0.45),
    0,
    24
  );

  const radiationGain = clamp((state.sun * 1.7 + Math.max(0, state.temp - 28) * 0.22) * (1 - cell.openArea * 0.18), 0, 11);
  const retainedHeat = clamp(
    (activity.metabolic * 8.5 + cell.zoneHeat * 2.1 + radiationGain) * holeInsulationLoss + wetness.saturation * material.cling * 2.9 - convectiveFlux - evaporationFlux - conductiveFlux * 0.38,
    0,
    100
  );

  const microclimateTemp = clamp(ambientTemp + retainedHeat * 0.11 + fit.airGap * 1.6 - airflow.exchange * 1.8, ambientTemp - 6, skinTemp + 7);
  const thermalIndex = clamp(retainedHeat + Math.max(0, microclimateTemp - 29) * 2.2, 0, 100);

  return {
    skinTemp,
    microclimateTemp,
    conductiveFlux,
    convectiveFlux,
    evaporationFlux,
    radiationGain,
    retainedHeat,
    thermalIndex
  };
}
