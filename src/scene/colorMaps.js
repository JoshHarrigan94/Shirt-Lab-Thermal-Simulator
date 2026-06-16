import * as THREE from 'three';

export function thermalColor(value) {
  return new THREE.Color().setHSL(0.62 - (Math.min(value, 100) / 100) * 0.62, 0.86, 0.54);
}

export function moistureColor(value) {
  return new THREE.Color().setHSL(0.58, 0.78, 0.34 + Math.min(value / 12, 1) * 0.36);
}

export function airflowColor(value) {
  return new THREE.Color().setHSL(0.56 - Math.min(value / 2.4, 1) * 0.2, 0.9, 0.56);
}

export function perforationColor(value) {
  return new THREE.Color().setHSL(0.12, 0.92, 0.31 + Math.min(value / 25, 1) * 0.4);
}

export function comfortColor(value) {
  return new THREE.Color().setHSL(0.0 + Math.min(value / 100, 1) * 0.34, 0.82, 0.52);
}

export function colorForView(view, sample) {
  if (view === 'thermal') return thermalColor(sample.thermalIndex ?? 0);
  if (view === 'moisture') return moistureColor(sample.fabricWetness ?? 0);
  if (view === 'airflow') return airflowColor(sample.airFlow ?? 0);
  if (view === 'perforation') return perforationColor(sample.openArea ?? 0);
  if (view === 'comfort') return comfortColor(sample.comfortScore ?? 0);
  return thermalColor(sample.thermalIndex ?? 0);
}
