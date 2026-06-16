import { scoreDecision, explainStrengths, explainRisks } from './decisionScores.js';

export function rankShirts(shirts, state) {
  const enriched = shirts.map(shirt => {
    const decision = scoreDecision(shirt, state);
    return {
      ...shirt,
      decision,
      strengths: explainStrengths({ ...shirt, decision }),
      risks: explainRisks({ ...shirt, decision })
    };
  });
  return enriched.sort((a, b) => b.decision.overall - a.decision.overall);
}

export function buildTradeOffCards(ranked) {
  return ranked.map((shirt, index) => ({
    rank: index + 1,
    slot: shirt.slot,
    name: shirt.name,
    overall: shirt.decision.overall,
    cooling: shirt.decision.coolingDuringEffort,
    sweat: shirt.decision.sweatManagement,
    safety: shirt.decision.thermalSafety,
    value: shirt.decision.value,
    strengths: shirt.strengths,
    risks: shirt.risks
  }));
}
