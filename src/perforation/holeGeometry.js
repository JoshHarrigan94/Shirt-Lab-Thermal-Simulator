import { clamp, round } from '../shared/math.js';

export const holeShapes = {
  round: { label: 'Round punch / laser dot', flowCoefficient: 1.0, edgeStress: 1.0, clogRisk: 0.55 },
  oval: { label: 'Oval athletic vent', flowCoefficient: 1.08, edgeStress: 1.15, clogRisk: 0.48 },
  slit: { label: 'Vertical slit', flowCoefficient: 0.94, edgeStress: 1.35, clogRisk: 0.36 },
  irregular: { label: 'Irregular moth-eaten hole', flowCoefficient: 1.12, edgeStress: 1.55, clogRisk: 0.62 },
  mesh: { label: 'Mesh pore field', flowCoefficient: 0.86, edgeStress: 0.72, clogRisk: 0.28 }
};

export const edgeFinishes = {
  laser: { label: 'Laser cut', fray: 0.12, precision: 0.95, comfort: 0.86 },
  punched: { label: 'Punched', fray: 0.38, precision: 0.72, comfort: 0.72 },
  stitched: { label: 'Stitched / reinforced', fray: 0.08, precision: 0.82, comfort: 0.76 },
  raw: { label: 'Raw cut', fray: 0.72, precision: 0.48, comfort: 0.5 },
  knit: { label: 'Knitted mesh opening', fray: 0.05, precision: 0.9, comfort: 0.82 }
};

export function calculateHoleAreaMm2(diameterMm, shape = 'round', aspectRatio = 1) {
  const radius = Math.max(0, diameterMm) / 2;
  if (shape === 'slit') return Math.max(1, diameterMm) * Math.max(1, diameterMm * aspectRatio) * 0.64;
  if (shape === 'oval') return Math.PI * radius * Math.max(radius * aspectRatio, 0.1);
  if (shape === 'irregular') return Math.PI * radius * radius * 1.08;
  if (shape === 'mesh') return Math.PI * radius * radius * 0.72;
  return Math.PI * radius * radius;
}

export function analyseHoleSet({ diameterMm, shape, edgeFinish, densityPer100cm2, openAreaTarget }) {
  const hole = holeShapes[shape] ?? holeShapes.round;
  const edge = edgeFinishes[edgeFinish] ?? edgeFinishes.laser;
  const holeArea = calculateHoleAreaMm2(diameterMm, shape, shape === 'slit' ? 3.2 : 1.55);
  const fabricAreaMm2 = 100 * 100;
  const theoreticalOpenArea = densityPer100cm2 ? (holeArea * densityPer100cm2) / fabricAreaMm2 : openAreaTarget;
  const effectiveOpenArea = clamp(theoreticalOpenArea * hole.flowCoefficient * (0.82 + edge.precision * 0.18), 0, 0.5);
  const edgeLengthFactor = clamp((densityPer100cm2 * diameterMm) / 750, 0, 1.8);
  const structuralPenalty = clamp((effectiveOpenArea * 1.2 + edgeLengthFactor * hole.edgeStress * 0.16 + edge.fray * 0.22), 0, 0.85);
  const clogRisk = clamp(hole.clogRisk * (1 - diameterMm / 12) * 0.65 + openAreaTarget * 0.35, 0, 1);
  return {
    holeAreaMm2: round(holeArea, 1),
    effectiveOpenArea,
    structuralPenalty,
    clogRisk,
    airflowCoefficient: round(hole.flowCoefficient * (0.78 + effectiveOpenArea * 1.35), 2),
    manufacturability: round(clamp((edge.precision + edge.comfort) * 50 - structuralPenalty * 35, 0, 100), 0)
  };
}
