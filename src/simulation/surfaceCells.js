import { zones } from '../config/zones.js';
import { clamp } from '../shared/math.js';
import { cellOpenArea, cellHoleEstimate } from '../perforation/patternGenerator.js';

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
        
        const normalWindAccess = config.side === 'front' ? 1 : config.side === 'back' ? 0.55 : 0.78;

        const cell = {
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
          openArea: 0,
          holeEstimate: 0,
          airGap: fit.airGap * (0.75 + edgeExposure * 0.35)
        };
        cell.openArea = clamp(cellOpenArea(pattern, cell), 0, 0.5);
        cell.holeEstimate = cellHoleEstimate(pattern, cell);
        cells.push(cell);
      }
    }
  });

  return cells;
}

export function aggregateCells(cells) {
  const groups = new Map();
  cells.forEach(cell => {
    if (!groups.has(cell.zoneId)) groups.set(cell.zoneId, []);
    groups.get(cell.zoneId).push(cell);
  });

  return Array.from(groups.entries()).map(([zoneId, group]) => {
    const avg = key => group.reduce((sum, cell) => sum + cell[key], 0) / group.length;
    const sum = key => group.reduce((total, cell) => total + cell[key], 0);
    const zone = zoneById[zoneId];
    return {
      id: zoneId,
      label: zone.label,
      cellCount: group.length,
      holeEstimate: sum('holeEstimate'),
      openArea: avg('openArea') * 100,
      airFlow: avg('airFlow'),
      fabricWetness: avg('fabricWetness'),
      evaporativeCooling: avg('evaporativeCooling'),
      convectiveCooling: avg('convectiveCooling'),
      thermalIndex: avg('thermalIndex'),
      comfortScore: avg('comfortScore'),
      chillRisk: avg('chillRisk'),
      clingRisk: avg('clingRisk'),
      pocketRisk: avg('pocketRisk'),
      dryingHalfLife: avg('dryingHalfLife'),
      conductiveFlux: avg('conductiveFlux'),
      microclimateTemp: avg('microclimateTemp'),
      overheatingRisk: avg('overheatingRisk')
    };
  }).sort((a, b) => zones.findIndex(z => z.id === a.id) - zones.findIndex(z => z.id === b.id));
}
