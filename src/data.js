export const zones = [
  { id: 'chest', label: 'Chest', heat: 0.95, sweat: 0.9, airflow: 0.75, y: 0.45, x: -0.32 },
  { id: 'abdomen', label: 'Abdomen', heat: 0.75, sweat: 0.7, airflow: 0.55, y: 0.05, x: -0.25 },
  { id: 'upperBack', label: 'Upper back', heat: 1.0, sweat: 1.0, airflow: 0.65, y: 0.5, x: 0.32 },
  { id: 'lowerBack', label: 'Lower back', heat: 0.9, sweat: 0.95, airflow: 0.5, y: 0.05, x: 0.25 },
  { id: 'underarm', label: 'Underarm', heat: 1.05, sweat: 1.2, airflow: 0.35, y: 0.45, x: 0.0 },
  { id: 'shoulders', label: 'Shoulders', heat: 0.75, sweat: 0.6, airflow: 1.0, y: 0.8, x: 0.0 },
  { id: 'neck', label: 'Neck', heat: 1.1, sweat: 0.75, airflow: 1.15, y: 1.05, x: 0.0 }
];

export const materials = {
  cotton: {
    label: 'Cotton jersey',
    conductivity: 0.42,
    airPermeability: 0.32,
    moistureAbsorption: 0.88,
    dryingRate: 0.22,
    wicking: 0.25,
    cling: 0.8,
    weight: 0.75,
    priceIndex: 0.2
  },
  perforatedCotton: {
    label: 'Premium perforated cotton',
    conductivity: 0.42,
    airPermeability: 0.43,
    moistureAbsorption: 0.86,
    dryingRate: 0.25,
    wicking: 0.28,
    cling: 0.78,
    weight: 0.72,
    priceIndex: 1.0
  },
  polyester: {
    label: 'Polyester running knit',
    conductivity: 0.36,
    airPermeability: 0.55,
    moistureAbsorption: 0.18,
    dryingRate: 0.78,
    wicking: 0.78,
    cling: 0.45,
    weight: 0.45,
    priceIndex: 0.35
  },
  meshPoly: {
    label: 'Open mesh polyester',
    conductivity: 0.34,
    airPermeability: 0.88,
    moistureAbsorption: 0.12,
    dryingRate: 0.9,
    wicking: 0.82,
    cling: 0.35,
    weight: 0.32,
    priceIndex: 0.45
  },
  merino: {
    label: 'Light merino blend',
    conductivity: 0.38,
    airPermeability: 0.45,
    moistureAbsorption: 0.68,
    dryingRate: 0.46,
    wicking: 0.52,
    cling: 0.48,
    weight: 0.58,
    priceIndex: 0.75
  }
};

export const fits = {
  compression: { label: 'Compression', airGap: 0.12, movementPump: 0.1, contact: 0.95, flapping: 0.05 },
  athletic: { label: 'Athletic fitted', airGap: 0.28, movementPump: 0.25, contact: 0.75, flapping: 0.12 },
  regular: { label: 'Regular', airGap: 0.48, movementPump: 0.48, contact: 0.55, flapping: 0.25 },
  loose: { label: 'Loose', airGap: 0.72, movementPump: 0.72, contact: 0.35, flapping: 0.45 },
  oversized: { label: 'Oversized / baggy', airGap: 0.9, movementPump: 0.85, contact: 0.2, flapping: 0.72 }
};

export const perforations = {
  none: {
    label: 'No perforation',
    openArea: 0,
    structurePenalty: 0,
    distribution: {}
  },
  mothTechStyle: {
    label: 'MothTech-style body mapped',
    openArea: 0.12,
    structurePenalty: 0.15,
    distribution: { chest: 0.12, upperBack: 0.16, lowerBack: 0.1, underarm: 0.18, shoulders: 0.07, abdomen: 0.06, neck: 0.04 }
  },
  diyPunch: {
    label: 'DIY punched holes',
    openArea: 0.1,
    structurePenalty: 0.28,
    distribution: { chest: 0.14, upperBack: 0.14, lowerBack: 0.08, underarm: 0.08, shoulders: 0.04, abdomen: 0.07, neck: 0.03 }
  },
  microGrid: {
    label: 'Micro grid perforation',
    openArea: 0.08,
    structurePenalty: 0.08,
    distribution: { chest: 0.08, upperBack: 0.08, lowerBack: 0.08, underarm: 0.08, shoulders: 0.08, abdomen: 0.08, neck: 0.04 }
  },
  spineVent: {
    label: 'Spine vent strip',
    openArea: 0.07,
    structurePenalty: 0.1,
    distribution: { upperBack: 0.18, lowerBack: 0.16, neck: 0.06, chest: 0.02, abdomen: 0.02, underarm: 0.04, shoulders: 0.03 }
  },
  largeCutouts: {
    label: 'Large cut-outs',
    openArea: 0.22,
    structurePenalty: 0.42,
    distribution: { chest: 0.22, upperBack: 0.25, lowerBack: 0.2, underarm: 0.22, shoulders: 0.16, abdomen: 0.18, neck: 0.08 }
  }
};

export const activities = {
  walk: { label: 'Fast walk', speedKmh: 5.5, metabolic: 0.45 },
  easyRun: { label: 'Easy run', speedKmh: 9, metabolic: 0.68 },
  tempoRun: { label: 'Tempo run', speedKmh: 13, metabolic: 0.86 },
  race: { label: 'Race pace', speedKmh: 17, metabolic: 1.0 },
  hike: { label: 'Steep hike', speedKmh: 4, metabolic: 0.72 },
  cycling: { label: 'Cycling', speedKmh: 25, metabolic: 0.78 }
};

export const defaultState = {
  activity: 'tempoRun',
  effort: 7,
  sweat: 7,
  temp: 24,
  humidity: 60,
  wind: 8,
  sun: 4,
  materialA: 'perforatedCotton',
  fitA: 'regular',
  patternA: 'mothTechStyle',
  materialB: 'polyester',
  fitB: 'athletic',
  patternB: 'none',
  view: 'thermal'
};
