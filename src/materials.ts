import type { MaterialProfile } from '../types/simulation';

export const MATERIALS: Record<string, MaterialProfile> = {
  cotton: {
    id: 'cotton', name: 'Cotton', thermalConductivity: 0.42, airPermeability: 0.34,
    moistureAbsorption: 0.9, dryingRate: 0.22, clingFactor: 0.78, weightGsm: 160
  },
  polyester: {
    id: 'polyester', name: 'Polyester', thermalConductivity: 0.32, airPermeability: 0.56,
    moistureAbsorption: 0.28, dryingRate: 0.76, clingFactor: 0.42, weightGsm: 120
  },
  mesh_polyester: {
    id: 'mesh_polyester', name: 'Mesh polyester', thermalConductivity: 0.26, airPermeability: 0.88,
    moistureAbsorption: 0.18, dryingRate: 0.86, clingFactor: 0.32, weightGsm: 95
  },
  merino: {
    id: 'merino', name: 'Merino', thermalConductivity: 0.36, airPermeability: 0.42,
    moistureAbsorption: 0.72, dryingRate: 0.42, clingFactor: 0.46, weightGsm: 150
  },
  nylon: {
    id: 'nylon', name: 'Nylon', thermalConductivity: 0.3, airPermeability: 0.5,
    moistureAbsorption: 0.24, dryingRate: 0.7, clingFactor: 0.38, weightGsm: 110
  }
};

export const FIT_AIR_GAP: Record<string, number> = {
  compression: 0.05,
  athletic: 0.16,
  regular: 0.3,
  loose: 0.48,
  baggy: 0.68
};
