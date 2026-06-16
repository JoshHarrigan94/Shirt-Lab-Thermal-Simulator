import { MATERIALS, FIT_AIR_GAP } from '../data/materials';
import type { SimState, ZoneScore } from '../types/simulation';

const zones = [
  { zone: 'Chest', heatBias: 0.9, sweatBias: 0.85, airflowBias: 1.0 },
  { zone: 'Upper back', heatBias: 1.0, sweatBias: 1.0, airflowBias: 0.78 },
  { zone: 'Spine', heatBias: 1.05, sweatBias: 1.08, airflowBias: 0.72 },
  { zone: 'Underarms', heatBias: 0.85, sweatBias: 1.25, airflowBias: 0.45 },
  { zone: 'Shoulders', heatBias: 0.72, sweatBias: 0.55, airflowBias: 0.95 },
  { zone: 'Lower torso', heatBias: 0.82, sweatBias: 0.72, airflowBias: 0.58 }
];

function patternBoost(pattern: string, zone: string, scale: number) {
  const s = scale;
  if (pattern === 'none') return 0;
  if (pattern === 'mothtech_style') {
    if (zone === 'Chest' || zone === 'Upper back') return 0.26 * s;
    if (zone === 'Spine' || zone === 'Underarms') return 0.18 * s;
    if (zone === 'Shoulders') return 0.1 * s;
  }
  if (pattern === 'spine_vent' && (zone === 'Spine' || zone === 'Upper back')) return 0.36 * s;
  if (pattern === 'underarm_focus' && zone === 'Underarms') return 0.42 * s;
  if (pattern === 'full_scatter') return 0.18 * s;
  return 0.04 * s;
}

export function calculateZones(state: SimState): ZoneScore[] {
  const m = MATERIALS[state.material];
  const airGap = FIT_AIR_GAP[state.fit];
  const apparentWind = Math.max(0, state.windKph + state.paceKph * 0.85);
  const humidityPenalty = state.humidityPct / 100;
  const hotLoad = Math.max(0, (state.temperatureC - 10) / 28);

  return zones.map(z => {
    const perf = patternBoost(state.pattern, z.zone, state.perforationScale);
    const airflow = clamp((m.airPermeability + airGap * 0.42 + perf) * z.airflowBias * (0.35 + apparentWind / 26), 0, 1.5);
    const evapPotential = clamp((airflow * 0.65 + m.dryingRate * 0.35) * (1 - humidityPenalty * 0.82), 0, 1);
    const moisture = clamp((state.sweatRate * z.sweatBias * m.moistureAbsorption * (1 - evapPotential * 0.75)), 0, 1.4);
    const insulation = clamp((1 - m.thermalConductivity * 0.45) * (1 - airflow * 0.38) + moisture * m.clingFactor * 0.25, 0, 1.2);
    const heat = clamp((state.metabolicHeat / 100) * z.heatBias * hotLoad * insulation - evapPotential * 0.22, 0, 1.4);
    const comfort = clamp(1 - heat * 0.58 - moisture * 0.32 + airflow * 0.12, 0, 1);
    return { zone: z.zone, heat, airflow: clamp(airflow, 0, 1), moisture: clamp(moisture, 0, 1), comfort };
  });
}

export function aggregateScore(zones: ZoneScore[]) {
  const avg = (key: keyof ZoneScore) => zones.reduce((a, z) => a + Number(z[key]), 0) / zones.length;
  return {
    heat: avg('heat'),
    airflow: avg('airflow'),
    moisture: avg('moisture'),
    comfort: avg('comfort')
  };
}

function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)); }
