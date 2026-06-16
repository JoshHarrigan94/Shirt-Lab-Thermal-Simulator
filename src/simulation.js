import { zones, materials, fits, perforations, activities } from './data.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value, digits = 1) => Number(value.toFixed(digits));

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

  const zoneResults = zones.map(zone => {
    const zoneOpen = pattern.distribution[zone.id] ?? pattern.openArea;
    const perforationBoost = zoneOpen * 2.2;
    const windAccess = zone.airflow * (0.35 + apparentWind / 38);
    const fitVentilation = fit.movementPump * (0.35 + activity.speedKmh / 28);
    const airFlow = clamp((material.airPermeability + perforationBoost + fitVentilation) * windAccess, 0, 2.2);

    const sweatInput = zone.sweat * state.sweat * activity.metabolic;
    const fabricWetness = clamp(
      sweatInput * material.moistureAbsorption * (1 - material.dryingRate * (0.4 + airFlow * 0.18)) * (0.65 + humidityPenalty),
      0,
      12
    );

    const evaporativeCooling = clamp(
      sweatInput * (material.wicking + material.dryingRate + airFlow * 0.42) * (1 - humidityPenalty * 0.72),
      0,
      14
    );

    const convectiveCooling = clamp(
      airFlow * (Math.max(0, 34 - state.temp) / 16 + 0.25) * (1 - fit.contact * 0.18),
      0,
      10
    );

    const insulationRetention = clamp(
      (1 - material.conductivity) * (1 - zoneOpen) * (0.55 + fit.airGap * 0.65) + fabricWetness * material.cling * 0.055,
      0,
      2.5
    );

    const zoneHeat = heatLoad * zone.heat / 10 + ambientStress;
    const thermalIndex = clamp(zoneHeat + insulationRetention * 8 - convectiveCooling * 2.5 - evaporativeCooling * 2.1, 0, 100);
    const comfortScore = clamp(100 - thermalIndex - fabricWetness * 2.2 - pattern.structurePenalty * 8, 0, 100);
    const chillRisk = clamp((airFlow + zoneOpen * 3) * Math.max(0, 16 - state.temp) * (fabricWetness / 10), 0, 30);
    const clingRisk = clamp(fabricWetness * material.cling * fit.contact * 9, 0, 100);

    return {
      id: zone.id,
      label: zone.label,
      airFlow: round(airFlow, 2),
      fabricWetness: round(fabricWetness, 1),
      evaporativeCooling: round(evaporativeCooling, 1),
      convectiveCooling: round(convectiveCooling, 1),
      thermalIndex: round(thermalIndex, 1),
      comfortScore: round(comfortScore, 1),
      chillRisk: round(chillRisk, 1),
      clingRisk: round(clingRisk, 1),
      openArea: round(zoneOpen * 100, 1)
    };
  });

  const avg = key => zoneResults.reduce((sum, z) => sum + z[key], 0) / zoneResults.length;
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
    zones: zoneResults
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

  let text = `Shirt ${winner} is currently predicted to perform better, mainly through ${winning.airflowScore > losing.airflowScore ? 'higher airflow' : 'better moisture/thermal balance'}. `;
  if (gap < 4) text += 'The difference is small enough that real-world fit, comfort and durability could dominate. ';
  if (hot && humid) text += 'Because conditions are hot and humid, extra holes help less unless they meaningfully increase evaporation. ';
  if (hot && !humid) text += 'In hot dry conditions, perforation and movement-driven airflow are more likely to translate into real cooling. ';
  if (cool && windy) text += 'In cool windy conditions, heavy perforation may become a chill risk once the garment is wet. ';
  if (windy) text += 'External wind amplifies the value of open structures and loose cuts. ';
  return text.trim();
}
