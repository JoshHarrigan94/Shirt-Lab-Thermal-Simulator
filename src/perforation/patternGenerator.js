import { clamp } from '../shared/math.js';
import { analyseHoleSet } from './holeGeometry.js';

const zoneHeatPriority = {
  chest: 0.86,
  abdomen: 0.55,
  upperBack: 1.0,
  lowerBack: 0.82,
  underarm: 1.12,
  shoulders: 0.58,
  neck: 0.72
};

export function enrichPerforationPreset(key, preset) {
  const geometry = analyseHoleSet(preset.geometry);
  return {
    key,
    ...preset,
    geometryAnalysis: geometry,
    effectiveOpenArea: geometry.effectiveOpenArea,
    structurePenalty: preset.structurePenalty ?? geometry.structuralPenalty,
    clogRisk: geometry.clogRisk,
    airflowCoefficient: geometry.airflowCoefficient,
    manufacturability: geometry.manufacturability
  };
}

export function cellOpenArea(pattern, cell) {
  const base = pattern.distribution?.[cell.zoneId] ?? pattern.openArea ?? 0;
  if (!base) return 0;
  const heatWeight = 0.72 + (zoneHeatPriority[cell.zoneId] ?? 0.7) * 0.28;
  const mask = patternMask(pattern, cell);
  const noise = pattern.noise ? deterministicNoise(cell.u, cell.v, cell.side, pattern.seed ?? 1) : 0.5;
  const irregularity = 1 + (noise - 0.5) * (pattern.irregularity ?? 0.12);
  return clamp(base * heatWeight * mask * irregularity * (pattern.geometryAnalysis?.airflowCoefficient ?? 1), 0, 0.5);
}

export function cellHoleEstimate(pattern, cell) {
  const diameter = pattern.geometry?.diameterMm ?? 4;
  const density = pattern.geometry?.densityPer100cm2 ?? 18;
  const mask = patternMask(pattern, cell);
  const areaShare = Math.max(0.1, mask);
  return Math.max(0, Math.round(density * areaShare * 0.42 * (cell.openArea > 0 ? 1 : 0)));
}

function patternMask(pattern, cell) {
  const { u, v, side, zoneId } = cell;
  const lateralCentre = Math.exp(-Math.pow((u - 0.5) / 0.28, 2));
  const spineBand = side === 'back' ? Math.exp(-Math.pow((u - 0.5) / 0.18, 2)) : 0.18;
  const underarmBand = zoneId === 'underarm' ? 1.25 : 0.82;
  const upperBody = 0.72 + v * 0.42;

  switch (pattern.family) {
    case 'bodyMapped':
      return clamp((0.7 + lateralCentre * 0.48) * upperBody * underarmBand * (side === 'back' ? 1.16 : 1), 0.15, 1.65);
    case 'spine':
      return clamp((side === 'back' ? 0.45 + spineBand * 1.35 : 0.12) * (0.82 + v * 0.32), 0.02, 1.8);
    case 'microGrid':
      return 0.86 + ((cell.row + cell.col) % 2) * 0.16;
    case 'largeCutout':
      return clamp(0.78 + Math.sin(u * Math.PI * 4) * 0.22 + Math.cos(v * Math.PI * 3) * 0.18, 0.35, 1.35);
    case 'diy':
      return clamp(0.58 + deterministicNoise(u, v, side, pattern.seed ?? 3) * 0.88, 0.2, 1.65);
    case 'mesh':
      return 0.92;
    default:
      return 1;
  }
}

function deterministicNoise(u, v, side, seed) {
  const sideValue = side.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const value = Math.sin((u * 312.31 + v * 191.17 + sideValue + seed * 17.11) * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}
