import { materials } from '../materials/materialPresets.js';
import { fits } from '../garment/fitPresets.js';
import { perforations } from '../perforation/perforationPresets.js';
import { activities } from '../environment/activityPresets.js';
import { generateSurfaceCells, aggregateCells } from './surfaceCells.js';
import { analysePerforationPerformance } from '../perforation/perforationAnalysis.js';
import { computeAirflow } from './airflowModel.js';
import { computeMoisture } from './moistureModel.js';
import { computeThermalFlux } from './thermalModel.js';
import { computeComfort } from './comfortModel.js';
import { clamp, round } from '../shared/math.js';

export function simulateShirt(state, slot) {
  const material = materials[state[`material${slot}`]];
  const fit = fits[state[`fit${slot}`]];
  const pattern = perforations[state[`pattern${slot}`]];
  const activity = activities[state.activity];

  const cells = generateSurfaceCells(pattern, fit).map(cell => {
    const airflow = computeAirflow({ state, activity, material, fit, pattern, cell });
    const moisture = computeMoisture({ state, activity, material, fit, pattern, cell, airflow });
    const thermal = computeThermalFlux({ state, activity, material, fit, cell, airflow, wetness: moisture });
    const comfort = computeComfort({ state, material, pattern, cell, airflow, moisture, thermal });

    return {
      ...cell,
      airFlow: airflow.exchange,
      airflowVelocity: airflow.velocity,
      turbulence: airflow.turbulence,
      pocketRisk: airflow.pocketRisk,
      fabricWetness: moisture.retainedWater,
      saturation: moisture.saturation,
      dryingHalfLife: moisture.dryingHalfLife,
      evaporativeCooling: thermal.evaporationFlux,
      convectiveCooling: thermal.convectiveFlux,
      conductiveFlux: thermal.conductiveFlux,
      microclimateTemp: thermal.microclimateTemp,
      thermalIndex: thermal.thermalIndex,
      comfortScore: comfort.comfortScore,
      chillRisk: comfort.chillRisk,
      overheatingRisk: comfort.overheatingRisk,
      clingRisk: moisture.clingRisk
    };
  });

  const zoneResults = aggregateCells(cells).map(zone => ({
    ...zone,
    airFlow: round(zone.airFlow, 2),
    fabricWetness: round(zone.fabricWetness, 1),
    evaporativeCooling: round(zone.evaporativeCooling, 1),
    convectiveCooling: round(zone.convectiveCooling, 1),
    conductiveFlux: round(zone.conductiveFlux, 1),
    microclimateTemp: round(zone.microclimateTemp, 1),
    thermalIndex: round(zone.thermalIndex, 1),
    comfortScore: round(zone.comfortScore, 1),
    chillRisk: round(zone.chillRisk, 1),
    overheatingRisk: round(zone.overheatingRisk, 1),
    clingRisk: round(zone.clingRisk, 1),
    pocketRisk: round(zone.pocketRisk, 1),
    dryingHalfLife: round(zone.dryingHalfLife, 1),
    openArea: round(zone.openArea, 1),
    holeEstimate: zone.holeEstimate
  }));

  const avg = key => zoneResults.reduce((sum, z) => sum + z[key], 0) / zoneResults.length;
  const avgCell = key => cells.reduce((sum, c) => sum + c[key], 0) / cells.length;
  const maxCell = key => Math.max(...cells.map(c => c[key]));
  const minCell = key => Math.min(...cells.map(c => c[key]));

  const apparentWind = state.wind + activity.speedKmh * 0.72;
  const heatLoad = activity.metabolic * (0.55 + state.effort / 10) * 100;
  const coolingScore = avg('convectiveCooling') * 3.2 + avg('evaporativeCooling') * 3.8 - avg('thermalIndex') * 0.24;
  const moistureScore = 100 - avg('fabricWetness') * 5.2 - avg('clingRisk') * 0.24 - avg('dryingHalfLife') * 0.08;
  const airflowScore = avg('airFlow') * 42 - avg('pocketRisk') * 0.16;
  const thermalComfort = avg('comfortScore') - avg('chillRisk') * 0.55 - avg('overheatingRisk') * 0.08;
  const valueScore = thermalComfort * (1.15 - material.priceIndex * 0.45) - pattern.structurePenalty * 5;
  const credibilityScore = clamp(55 + cells.length / 80 + (pattern.geometry ? 8 : 0), 0, 80);

  const draftResultForAnalysis = {
    pattern,
    coolingScore: round(coolingScore, 1),
    cells: cells.map(cell => ({ ...cell, openArea: cell.openArea * 100 })),
    surface: { averageOpenArea: round(avgCell('openArea') * 100, 1) }
  };
  const perforationAnalysis = analysePerforationPerformance(draftResultForAnalysis);

  return {
    slot,
    name: `${material.label} / ${fit.label} / ${pattern.label}`,
    material,
    fit,
    pattern,
    apparentWind: round(apparentWind, 1),
    heatLoad: round(heatLoad, 1),
    coolingScore: round(coolingScore, 1),
    moistureScore: round(moistureScore, 1),
    airflowScore: round(airflowScore, 1),
    thermalComfort: round(thermalComfort, 1),
    valueScore: round(valueScore, 1),
    credibilityScore: round(credibilityScore, 1),
    cells: cells.map(cell => ({
      ...cell,
      airFlow: round(cell.airFlow, 2),
      airflowVelocity: round(cell.airflowVelocity, 2),
      turbulence: round(cell.turbulence, 2),
      pocketRisk: round(cell.pocketRisk, 1),
      fabricWetness: round(cell.fabricWetness, 1),
      saturation: round(cell.saturation, 2),
      dryingHalfLife: round(cell.dryingHalfLife, 1),
      evaporativeCooling: round(cell.evaporativeCooling, 1),
      convectiveCooling: round(cell.convectiveCooling, 1),
      conductiveFlux: round(cell.conductiveFlux, 1),
      microclimateTemp: round(cell.microclimateTemp, 1),
      thermalIndex: round(cell.thermalIndex, 1),
      comfortScore: round(cell.comfortScore, 1),
      chillRisk: round(cell.chillRisk, 1),
      overheatingRisk: round(cell.overheatingRisk, 1),
      clingRisk: round(cell.clingRisk, 1),
      openArea: round(cell.openArea * 100, 1)
    })),
    zones: zoneResults,
    perforationAnalysis,
    surface: {
      cellCount: cells.length,
      averageOpenArea: round(avgCell('openArea') * 100, 1),
      maxOpenArea: round(maxCell('openArea') * 100, 1),
      hottestCell: round(maxCell('thermalIndex'), 1),
      coolestCell: round(minCell('thermalIndex'), 1),
      wettestCell: round(maxCell('fabricWetness'), 1),
      highestAirflowCell: round(maxCell('airFlow'), 2),
      worstPocketRisk: round(maxCell('pocketRisk'), 1),
      avgMicroclimateTemp: round(avgCell('microclimateTemp'), 1),
      avgDryingHalfLife: round(avgCell('dryingHalfLife'), 1),
      estimatedHoleCount: cells.reduce((sum, cell) => sum + cell.holeEstimate, 0)
    },
    physics: {
      avgConvectiveFlux: round(avgCell('convectiveCooling'), 1),
      avgEvaporationFlux: round(avgCell('evaporativeCooling'), 1),
      avgConductiveFlux: round(avgCell('conductiveFlux'), 1),
      avgPocketRisk: round(avgCell('pocketRisk'), 1),
      avgMicroclimateTemp: round(avgCell('microclimateTemp'), 1),
      avgDryingHalfLife: round(avgCell('dryingHalfLife'), 1)
    }
  };
}

export function compare(state) {
  const a = simulateShirt(state, 'A');
  const b = simulateShirt(state, 'B');
  const winner = a.thermalComfort >= b.thermalComfort ? 'A' : 'B';
  const gap = Math.abs(a.thermalComfort - b.thermalComfort);
  const mothClaim = state.patternA === 'mothTechStyle' || state.patternB === 'mothTechStyle';
  const claimCheck = mothClaim
    ? gap < 4 ? 'Marginal' : `${winner} by ${round(gap, 1)} pts`
    : 'No claim selected';
  const valueWinner = a.valueScore >= b.valueScore ? 'A' : 'B';

  return {
    a,
    b,
    winner,
    gap: round(gap, 1),
    claimCheck,
    valueWinner,
    interpretation: buildInterpretation(state, a, b, winner, gap)
  };
}

function buildInterpretation(state, a, b, winner, gap) {
  const humid = state.humidity >= 70;
  const hot = state.temp >= 26;
  const cool = state.temp <= 12;
  const windy = state.wind >= 18;
  const winning = winner === 'A' ? a : b;
  const losing = winner === 'A' ? b : a;

  let text = `Shirt ${winner} is currently predicted to perform better, mainly through ${winning.physics.avgEvaporationFlux > losing.physics.avgEvaporationFlux ? 'stronger evaporation cooling' : winning.physics.avgConvectiveFlux > losing.physics.avgConvectiveFlux ? 'stronger convective heat removal' : 'lower retained heat and pocket risk'}. `;
  if (gap < 4) text += 'The difference is small enough that real-world fit, comfort and durability could dominate. ';
  if (hot && humid) text += 'Hot humid conditions suppress evaporation, so holes only help when they increase exchange through wet zones rather than merely increasing open area. ';
  if (hot && !humid) text += 'Hot dry conditions reward perforation, mesh and movement-driven airflow because evaporation can actually remove heat. ';
  if (cool && windy) text += 'Cool windy conditions raise chill risk once fabric is wet, especially for high-open-area patterns. ';
  if (windy) text += 'External wind amplifies open structures and loose cuts but can also increase chill-after-stop risk. ';
  text += `Pass 5 separates airflow, moisture, thermal flux and comfort into module-level models, so the output now distinguishes convection, evaporation, conduction, microclimate temperature, drying half-life and stagnant air pockets.`;
  return text.trim();
}
