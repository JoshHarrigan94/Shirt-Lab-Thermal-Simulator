import { zones } from './data.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const zoneById = Object.fromEntries(zones.map(zone => [zone.id, zone]));

const sideConfigs = [
  { side: 'front', theta: 0, zoneMap: y => y > 0.82 ? 'neck' : y > 0.62 ? 'shoulders' : y > 0.22 ? 'chest' : 'abdomen' },
  { side: 'back', theta: Math.PI, zoneMap: y => y > 0.82 ? 'neck' : y > 0.62 ? 'shoulders' : y > 0.22 ? 'upperBack' : 'lowerBack' },
  { side: 'left', theta: -Math.PI / 2, zoneMap: y => y > 0.2 && y < 0.78 ? 'underarm' : y > 0.66 ? 'shoulders' : y > 0.2 ? 'chest' : 'abdomen' },
  { side: 'right', theta: Math.PI / 2, zoneMap: y => y > 0.2 && y < 0.78 ? 'underarm' : y > 0.66 ? 'shoulders' : y > 0.2 ? 'upperBack' : 'lowerBack' }
];

export function generateSurfaceCells(pattern, fit, detail = { rows: 18, cols: 12 }) {
  const cells = [];
  const radiusX = 0.73 + fit.airGap * 0.07;
  const radiusZ = 0.46 + fit.airGap * 0.05;
  const yMin = -0.55;
  const yMax = 0.95;

  sideConfigs.forEach(config => {
    for (let row = 0; row < detail.rows; row++) {
      const v = row / (detail.rows - 1);
      const y = yMin + v * (yMax - yMin);
      for (let col = 0; col < detail.cols; col++) {
        const u = (col + 0.5) / detail.cols;
        const angularSpan = Math.PI / 2.3;
        const theta = config.theta + (u - 0.5) * angularSpan;
        const zoneId = config.zoneMap(y);
        const zone = zoneById[zoneId];
        const x = Math.sin(theta) * radiusX;
        const z = Math.cos(theta) * radiusZ;
        const edgeExposure = Math.abs(u - 0.5) * 2;
        const baseOpen = pattern.distribution[zoneId] ?? pattern.openArea ?? 0;
        const localOpen = distributeOpenArea(baseOpen, pattern.label, config.side, zoneId, u, v);
        const normalWindAccess = config.side === 'front' ? 1 : config.side === 'back' ? 0.55 : 0.78;

        cells.push({
          id: `${config.side}-${row}-${col}`,
          side: config.side,
          row,
          col,
          u,
          v,
          theta,
          position: { x, y, z },
          zoneId,
          zoneLabel: zone.label,
          zoneHeat: zone.heat,
          zoneSweat: zone.sweat,
          zoneAirflow: zone.airflow,
          edgeExposure,
          normalWindAccess,
          openArea: clamp(localOpen, 0, 0.42),
          airGap: fit.airGap * (0.75 + edgeExposure * 0.35)
        });
      }
    }
  });

  return cells;
}

function distributeOpenArea(baseOpen, label, side, zoneId, u, v) {
  if (!baseOpen) return 0;
  const spineBias = side === 'back' ? 1.15 + (1 - Math.abs(u - 0.5) * 2) * 0.45 : 0.7;
  const underarmBias = zoneId === 'underarm' ? 1.35 : 1;
  const shoulderPenalty = zoneId === 'shoulders' ? 0.75 : 1;
  const centreCluster = 0.75 + Math.exp(-Math.pow((u - 0.5) / 0.28, 2)) * 0.55;
  const verticalGradient = 0.78 + v * 0.35;

  if (label.includes('MothTech')) {
    return baseOpen * centreCluster * verticalGradient * underarmBias * shoulderPenalty * (side === 'back' ? spineBias : 1);
  }
  if (label.includes('Spine')) return baseOpen * spineBias * centreCluster * (side === 'back' ? 1.55 : 0.35);
  if (label.includes('Large')) return baseOpen * (0.9 + Math.sin(u * Math.PI * 3) * 0.18 + Math.cos(v * Math.PI * 4) * 0.12);
  if (label.includes('Micro')) return baseOpen * (0.92 + ((Math.floor(u * 12) + Math.floor(v * 18)) % 2) * 0.14);
  if (label.includes('DIY')) return baseOpen * (0.75 + pseudoRandom(u, v, side.length) * 0.75);
  return baseOpen;
}

function pseudoRandom(u, v, seed) {
  const value = Math.sin((u * 312.31 + v * 191.17 + seed * 17.11) * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function aggregateCells(cells) {
  const groups = new Map();
  cells.forEach(cell => {
    if (!groups.has(cell.zoneId)) groups.set(cell.zoneId, []);
    groups.get(cell.zoneId).push(cell);
  });

  return Array.from(groups.entries()).map(([zoneId, group]) => {
    const avg = key => group.reduce((sum, cell) => sum + cell[key], 0) / group.length;
    const zone = zoneById[zoneId];
    return {
      id: zoneId,
      label: zone.label,
      cellCount: group.length,
      openArea: avg('openArea') * 100,
      airFlow: avg('airFlow'),
      fabricWetness: avg('fabricWetness'),
      evaporativeCooling: avg('evaporativeCooling'),
      convectiveCooling: avg('convectiveCooling'),
      thermalIndex: avg('thermalIndex'),
      comfortScore: avg('comfortScore'),
      chillRisk: avg('chillRisk'),
      clingRisk: avg('clingRisk')
    };
  }).sort((a, b) => zones.findIndex(z => z.id === a.id) - zones.findIndex(z => z.id === b.id));
}
