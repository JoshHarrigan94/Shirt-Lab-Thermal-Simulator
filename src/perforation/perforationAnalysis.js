import { round, clamp } from '../shared/math.js';

export function analysePerforationPerformance(result) {
  const cells = result.cells ?? [];
  const openCells = cells.filter(cell => cell.openArea > 0.4);
  const avg = key => cells.length ? cells.reduce((sum, cell) => sum + cell[key], 0) / cells.length : 0;
  const openAvg = key => openCells.length ? openCells.reduce((sum, cell) => sum + cell[key], 0) / openCells.length : 0;
  const placementEfficiency = avg('openArea') ? clamp(openAvg('evaporativeCooling') / Math.max(avg('evaporativeCooling'), 0.1), 0, 2.5) : 0;
  const coolingPerOpenArea = result.surface.averageOpenArea > 0 ? result.coolingScore / result.surface.averageOpenArea : 0;
  const fragility = (result.pattern.structurePenalty ?? 0) * 100;
  const diyReplicability = clamp(100 - (result.pattern.manufacturability ?? 60) * 0.28 - fragility * 0.35, 0, 100);

  return {
    openCellCount: openCells.length,
    placementEfficiency: round(placementEfficiency, 2),
    coolingPerOpenArea: round(coolingPerOpenArea, 2),
    fragility: round(fragility, 0),
    clogRisk: round((result.pattern.clogRisk ?? 0) * 100, 0),
    diyReplicability: round(diyReplicability, 0),
    verdict: buildPerforationVerdict(result, placementEfficiency, coolingPerOpenArea)
  };
}

function buildPerforationVerdict(result, placementEfficiency, coolingPerOpenArea) {
  if (result.surface.averageOpenArea < 1) return 'No meaningful perforation effect selected.';
  if (placementEfficiency > 1.25 && coolingPerOpenArea > 1.1) return 'Good placement: holes are concentrated where they improve local airflow and evaporation.';
  if (placementEfficiency < 0.92) return 'Poor placement: open area is not concentrated enough around high-value heat/sweat zones.';
  return 'Moderate placement: perforation helps, but the benefit is context-dependent rather than magic fabric tech.';
}
