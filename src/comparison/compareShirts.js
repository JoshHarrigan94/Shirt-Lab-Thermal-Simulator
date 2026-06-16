import { simulateShirt } from '../simulation/simulateShirt.js';
import { rankShirts, buildTradeOffCards } from './rankShirts.js';
import { scenarios } from './scenarios.js';
import { round } from '../shared/math.js';

export function compare(state) {
  const shirts = ['A', 'B', 'C'].map(slot => simulateShirt(state, slot));
  const ranked = rankShirts(shirts, state);
  const cards = buildTradeOffCards(ranked);
  const winner = ranked[0].slot;
  const runnerUp = ranked[1];
  const gap = round(ranked[0].decision.overall - runnerUp.decision.overall, 1);
  const valueWinner = [...ranked].sort((a, b) => b.decision.value - a.decision.value)[0].slot;
  const claimCheck = buildClaimCheck(state, ranked);

  return {
    a: ranked.find(s => s.slot === 'A'),
    b: ranked.find(s => s.slot === 'B'),
    c: ranked.find(s => s.slot === 'C'),
    shirts: ranked,
    cards,
    winner,
    gap,
    claimCheck,
    valueWinner,
    scenario: scenarios[state.scenario],
    interpretation: buildInterpretation(state, ranked, gap)
  };
}

function buildClaimCheck(state, ranked) {
  const moth = ranked.find(s => s.pattern?.label?.toLowerCase().includes('moth') || s.pattern?.label?.toLowerCase().includes('body'));
  if (!moth) return 'No Moth-style shirt selected';
  const leader = ranked[0];
  const gapToLeader = round(leader.decision.overall - moth.decision.overall, 1);
  if (leader.slot === moth.slot) {
    const valueRank = [...ranked].sort((a, b) => b.decision.value - a.decision.value).findIndex(s => s.slot === moth.slot) + 1;
    return valueRank === 1 ? 'Works and wins on value' : 'Works, but value challenged';
  }
  if (gapToLeader < 3) return 'Marginal; not proven unique';
  return `Beaten by Shirt ${leader.slot} by ${gapToLeader} pts`;
}

function buildInterpretation(state, ranked, gap) {
  const leader = ranked[0];
  const hot = state.temp >= 26;
  const humid = state.humidity >= 70;
  const cool = state.temp <= 12;
  const windy = state.wind >= 18;
  const scenario = scenarios[state.scenario];

  let text = `${scenario?.label || 'Custom scenario'}: Shirt ${leader.slot} ranks first with an overall decision score of ${leader.decision.overall}. Its main edge is ${leader.strengths}. `;
  if (gap < 3) text += 'The top two are close enough that comfort preference, sizing, durability and price could decide the real-world winner. ';
  if (hot && humid) text += 'Humidity is penalising evaporation, so perforation only helps where it clears wet zones rather than simply adding holes. ';
  if (hot && !humid) text += 'Dry heat rewards high exchange designs because evaporative cooling can actually work. ';
  if (cool && windy) text += 'Cool wind shifts the goal from maximum ventilation to avoiding wet chill and excessive open area. ';
  if (windy) text += 'Wind increases the value of vents and loose cuts but also exposes bad moisture management. ';
  text += 'Pass 7 adds a decision layer over the physics modules: cooling, sweat management, thermal safety, stability and value are now ranked separately so marketing claims can be challenged as trade-offs rather than accepted as absolute performance claims.';
  return text;
}
