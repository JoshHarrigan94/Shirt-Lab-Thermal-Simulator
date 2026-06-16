import { round, clamp } from '../shared/math.js';

export function scoreDecision(shirt, state) {
  const hot = state.temp >= 26;
  const humid = state.humidity >= 70;
  const coolWind = state.temp <= 12 && state.wind >= 15;
  const effortBias = clamp(state.effort / 10, 0, 1);

  const coolingDuringEffort = shirt.coolingScore * 0.48 + shirt.airflowScore * 0.22 + shirt.physics.avgEvaporationFlux * 1.8;
  const sweatManagement = shirt.moistureScore * 0.62 + (100 - shirt.surface.avgDryingHalfLife) * 0.15 - shirt.perforationAnalysis.clogRisk * 0.16;
  const stability = 100 - shirt.surface.worstPocketRisk * 0.52 - shirt.physics.avgPocketRisk * 0.26;
  const thermalSafety = shirt.thermalComfort - shirt.zones.reduce((sum, z) => sum + z.chillRisk + z.overheatingRisk * 0.35, 0) / shirt.zones.length;
  const value = shirt.valueScore;

  let overall = coolingDuringEffort * 0.28 + sweatManagement * 0.24 + stability * 0.13 + thermalSafety * 0.25 + value * 0.10;
  if (hot && !humid) overall += shirt.surface.averageOpenArea * 0.18;
  if (hot && humid) overall -= shirt.perforationAnalysis.clogRisk * 0.12;
  if (coolWind) overall -= shirt.surface.averageOpenArea * 0.34 + shirt.zones.reduce((s, z) => s + z.chillRisk, 0) / shirt.zones.length * 0.22;
  overall += effortBias * shirt.physics.avgEvaporationFlux * 0.16;

  return {
    overall: round(clamp(overall, 0, 100), 1),
    coolingDuringEffort: round(clamp(coolingDuringEffort, 0, 100), 1),
    sweatManagement: round(clamp(sweatManagement, 0, 100), 1),
    thermalSafety: round(clamp(thermalSafety, 0, 100), 1),
    stability: round(clamp(stability, 0, 100), 1),
    value: round(clamp(value, 0, 100), 1)
  };
}

export function explainStrengths(shirt) {
  const strengths = [];
  if (shirt.decision.coolingDuringEffort >= 65) strengths.push('strong effort cooling');
  if (shirt.decision.sweatManagement >= 65) strengths.push('good sweat handling');
  if (shirt.surface.averageOpenArea >= 8) strengths.push('meaningful open-area ventilation');
  if (shirt.physics.avgPocketRisk <= 25) strengths.push('low stagnant-pocket risk');
  if (shirt.decision.value >= 60) strengths.push('good value-for-money');
  return strengths.length ? strengths.slice(0, 3).join(', ') : 'balanced but not dominant';
}

export function explainRisks(shirt) {
  const risks = [];
  if (shirt.surface.worstPocketRisk >= 55) risks.push('air pocket stagnation');
  if (shirt.perforationAnalysis.clogRisk >= 45) risks.push('sweat-clogged holes');
  if (shirt.perforationAnalysis.fragility >= 45) risks.push('fragility from cut-outs');
  if (shirt.zones.some(z => z.chillRisk >= 40)) risks.push('chill-after-stop risk');
  if (shirt.zones.some(z => z.clingRisk >= 55)) risks.push('wet cling');
  return risks.length ? risks.slice(0, 3).join(', ') : 'no major risk flagged';
}
