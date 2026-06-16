import { materials } from '../materials/materialPresets.js';
import { fits } from '../garment/fitPresets.js';
import { perforations } from '../perforation/perforationPresets.js';
import { activities } from '../environment/activityPresets.js';
import { generateSurfaceCells, aggregateCells } from './surfaceCells.js';

import { clamp, round } from '../shared/math.js';

export function simulateShirt(state, slot) {
  const material = materials[state[`material${slot}`]];
  const fit = fits[state[`fit${slot}`]];
  const pattern = perforations[state[`pattern${slot}`]];
  const activity = activities[state.activity];

  const apparentWind = state.wind + activity.speedKmh * 0.72;
  const heatLoad = activity.metabolic * (0.55 + state.effort / 10) * 100;
  const humidityPenalty = state.humidity / 100;
  const sunLoad = state.sun * 2.2;
  const ambientStress = Math.max(0, state.temp - 18) * 1.7 + sunLoad;

  const cells = generateSurfaceCells(pattern, fit).map(cell => {
    const perforationBoost = cell.openArea * 2.35;
    const sideWind = cell.normalWindAccess * (0.38 + apparentWind / 42);
    const edgeVent = 0.18 + cell.edgeExposure * 0.24;
    const movementPump = fit.movementPump * (0.32 + activity.speedKmh / 24) * (0.65 + cell.airGap);
    const airPocketPenalty = clamp((fit.airGap - 0.52) * 0.35 * (state.wind < 6 ? 1 : 0.35), 0, 0.32);

    const airFlow = clamp(
      (material.airPermeability + perforationBoost + movementPump + edgeVent - airPocketPenalty) * cell.zoneAirflow * sideWind,
      0,
      2.8
    );

    const sweatInput = cell.zoneSweat * state.sweat * activity.metabolic * (0.88 + cell.v * 0.2);
    const localSaturation = clamp(
      sweatInput * material.moistureAbsorption * (1 - material.dryingRate * (0.36 + airFlow * 0.16)) * (0.62 + humidityPenalty) * (1 + fit.contact * 0.18),
      0,
      14
    );

    const evaporativeCooling = clamp(
      sweatInput * (material.wicking + material.dryingRate + airFlow * 0.45) * (1 - humidityPenalty * 0.74) * (1 + cell.openArea * 0.85),
      0,
      16
    );

    const convectiveCooling = clamp(
      airFlow * (Math.max(0, 34 - state.temp) / 16 + 0.25) * (1 - fit.contact * 0.14) * (1 + cell.openArea * 0.55),
      0,
      12
    );

    const conductionBridge = material.conductivity * fit.contact * (0.65 + localSaturation / 18);
    const insulationRetention = clamp(
      (1 - material.conductivity) * (1 - cell.openArea) * (0.48 + cell.airGap * 0.72) + localSaturation * material.cling * 0.052 - conductionBridge * 0.18,
      0,
      2.7
    );

    const zoneHeat = heatLoad * cell.zoneHeat / 10 + ambientStress;
    const thermalIndex = clamp(zoneHeat + insulationRetention * 8.4 - convectiveCooling * 2.55 - evaporativeCooling * 2.15, 0, 100);
    const comfortScore = clamp(100 - thermalIndex - localSaturation * 2.25 - pattern.structurePenalty * 8, 0, 100);
    const chillRisk = clamp((airFlow + cell.openArea * 3.2) * Math.max(0, 16 - state.temp) * (localSaturation / 10), 0, 36);
    const clingRisk = clamp(localSaturation * material.cling * fit.contact * 9, 0, 100);

    return {
      ...cell,
      airFlow,
      fabricWetness: localSaturation,
      evaporativeCooling,
      convectiveCooling,
      thermalIndex,
      comfortScore,
      chillRisk,
      clingRisk
    };
  });

  const zoneResults = aggregateCells(cells).map(zone => ({
    ...zone,
    airFlow: round(zone.airFlow, 2),
    fabricWetness: round(zone.fabricWetness, 1),
    evaporativeCooling: round(zone.evaporativeCooling, 1),
    convectiveCooling: round(zone.convectiveCooling, 1),
    thermalIndex: round(zone.thermalIndex, 1),
    comfortScore: round(zone.comfortScore, 1),
    chillRisk: round(zone.chillRisk, 1),
    clingRisk: round(zone.clingRisk, 1),
    openArea: round(zone.openArea, 1)
  }));

  const avg = key => zoneResults.reduce((sum, z) => sum + z[key], 0) / zoneResults.length;
  const avgCell = key => cells.reduce((sum, c) => sum + c[key], 0) / cells.length;
  const maxCell = key => Math.max(...cells.map(c => c[key]));
  const coolingScore = avg('convectiveCooling') * 4 + avg('evaporativeCooling') * 4 - avg('thermalIndex') * 0.3;
  const moistureScore = 100 - avg('fabricWetness') * 6 - avg('clingRisk') * 0.25;
  const airflowScore = avg('airFlow') * 45;
  const thermalComfort = avg('comfortScore') - avg('chillRisk') * 0.6;
  const valueScore = thermalComfort * (1.15 - material.priceIndex * 0.45) - pattern.structurePenalty * 5;

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
    cells: cells.map(cell => ({
      ...cell,
      airFlow: round(cell.airFlow, 2),
      fabricWetness: round(cell.fabricWetness, 1),
      evaporativeCooling: round(cell.evaporativeCooling, 1),
      convectiveCooling: round(cell.convectiveCooling, 1),
      thermalIndex: round(cell.thermalIndex, 1),
      comfortScore: round(cell.comfortScore, 1),
      chillRisk: round(cell.chillRisk, 1),
      clingRisk: round(cell.clingRisk, 1),
      openArea: round(cell.openArea * 100, 1)
    })),
    zones: zoneResults,
    surface: {
      cellCount: cells.length,
      averageOpenArea: round(avgCell('openArea') * 100, 1),
      maxOpenArea: round(maxCell('openArea') * 100, 1),
      hottestCell: round(maxCell('thermalIndex'), 1),
      wettestCell: round(maxCell('fabricWetness'), 1),
      highestAirflowCell: round(maxCell('airFlow'), 2)
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

  let text = `Shirt ${winner} is currently predicted to perform better, mainly through ${winning.airflowScore > losing.airflowScore ? 'higher distributed airflow across surface cells' : 'better moisture/thermal balance across the garment surface'}. `;
  if (gap < 4) text += 'The difference is small enough that real-world fit, comfort and durability could dominate. ';
  if (hot && humid) text += 'Because conditions are hot and humid, extra holes help less unless they meaningfully increase local evaporation rather than just open area. ';
  if (hot && !humid) text += 'In hot dry conditions, perforation and movement-driven airflow are more likely to translate into real cooling. ';
  if (cool && windy) text += 'In cool windy conditions, heavy perforation may become a chill risk once the garment is wet. ';
  if (windy) text += 'External wind amplifies the value of open structures and loose cuts. ';
  text += `Pass 2 now uses ${a.surface.cellCount} shirt surface cells per shirt, so pattern placement affects local heat, airflow and wetness rather than only zone averages.`;
  return text.trim();
}
