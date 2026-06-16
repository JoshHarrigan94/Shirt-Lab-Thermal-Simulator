import { enrichPerforationPreset } from './patternGenerator.js';

const rawPerforations = {
  none: {
    label: 'No perforation',
    family: 'none',
    openArea: 0,
    distribution: {},
    geometry: { diameterMm: 0, shape: 'round', edgeFinish: 'stitched', densityPer100cm2: 0, openAreaTarget: 0 },
    structurePenalty: 0
  },
  mothTechStyle: {
    label: 'MothTech-style body mapped',
    family: 'bodyMapped',
    openArea: 0.12,
    seed: 11,
    irregularity: 0.2,
    noise: true,
    distribution: { chest: 0.12, upperBack: 0.16, lowerBack: 0.1, underarm: 0.18, shoulders: 0.07, abdomen: 0.06, neck: 0.04 },
    geometry: { diameterMm: 4.2, shape: 'irregular', edgeFinish: 'laser', densityPer100cm2: 26, openAreaTarget: 0.12 }
  },
  diyPunch: {
    label: 'DIY punched holes',
    family: 'diy',
    openArea: 0.1,
    seed: 29,
    irregularity: 0.48,
    noise: true,
    distribution: { chest: 0.14, upperBack: 0.14, lowerBack: 0.08, underarm: 0.08, shoulders: 0.04, abdomen: 0.07, neck: 0.03 },
    geometry: { diameterMm: 5.5, shape: 'round', edgeFinish: 'punched', densityPer100cm2: 18, openAreaTarget: 0.1 }
  },
  microGrid: {
    label: 'Micro grid perforation',
    family: 'microGrid',
    openArea: 0.08,
    irregularity: 0.04,
    noise: false,
    distribution: { chest: 0.08, upperBack: 0.08, lowerBack: 0.08, underarm: 0.08, shoulders: 0.08, abdomen: 0.08, neck: 0.04 },
    geometry: { diameterMm: 1.6, shape: 'round', edgeFinish: 'laser', densityPer100cm2: 60, openAreaTarget: 0.08 }
  },
  spineVent: {
    label: 'Spine vent strip',
    family: 'spine',
    openArea: 0.07,
    irregularity: 0.08,
    noise: false,
    distribution: { upperBack: 0.18, lowerBack: 0.16, neck: 0.06, chest: 0.02, abdomen: 0.02, underarm: 0.04, shoulders: 0.03 },
    geometry: { diameterMm: 3.5, shape: 'oval', edgeFinish: 'laser', densityPer100cm2: 22, openAreaTarget: 0.07 }
  },
  largeCutouts: {
    label: 'Large cut-outs',
    family: 'largeCutout',
    openArea: 0.22,
    seed: 41,
    irregularity: 0.18,
    noise: true,
    distribution: { chest: 0.22, upperBack: 0.25, lowerBack: 0.2, underarm: 0.22, shoulders: 0.16, abdomen: 0.18, neck: 0.08 },
    geometry: { diameterMm: 14, shape: 'oval', edgeFinish: 'stitched', densityPer100cm2: 9, openAreaTarget: 0.22 }
  },
  slitVent: {
    label: 'Vertical slit vents',
    family: 'bodyMapped',
    openArea: 0.105,
    seed: 53,
    irregularity: 0.1,
    noise: false,
    distribution: { chest: 0.08, upperBack: 0.14, lowerBack: 0.12, underarm: 0.16, shoulders: 0.04, abdomen: 0.06, neck: 0.03 },
    geometry: { diameterMm: 3, shape: 'slit', edgeFinish: 'laser', densityPer100cm2: 24, openAreaTarget: 0.105 }
  },
  meshPanel: {
    label: 'Mapped mesh panel',
    family: 'mesh',
    openArea: 0.18,
    seed: 71,
    irregularity: 0.03,
    noise: false,
    distribution: { chest: 0.08, upperBack: 0.28, lowerBack: 0.18, underarm: 0.3, shoulders: 0.06, abdomen: 0.04, neck: 0.03 },
    geometry: { diameterMm: 1.1, shape: 'mesh', edgeFinish: 'knit', densityPer100cm2: 180, openAreaTarget: 0.18 }
  }
};

export const perforations = Object.fromEntries(
  Object.entries(rawPerforations).map(([key, preset]) => [key, enrichPerforationPreset(key, preset)])
);
