export type MaterialId = 'cotton' | 'polyester' | 'mesh_polyester' | 'merino' | 'nylon';
export type FitId = 'compression' | 'athletic' | 'regular' | 'loose' | 'baggy';
export type PatternId = 'none' | 'mothtech_style' | 'spine_vent' | 'underarm_focus' | 'full_scatter';

export type MaterialProfile = {
  id: MaterialId;
  name: string;
  thermalConductivity: number;
  airPermeability: number;
  moistureAbsorption: number;
  dryingRate: number;
  clingFactor: number;
  weightGsm: number;
};

export type SimState = {
  material: MaterialId;
  fit: FitId;
  pattern: PatternId;
  temperatureC: number;
  humidityPct: number;
  windKph: number;
  paceKph: number;
  sweatRate: number;
  metabolicHeat: number;
  perforationScale: number;
};

export type ZoneScore = {
  zone: string;
  heat: number;
  airflow: number;
  moisture: number;
  comfort: number;
};
