import * as THREE from 'three';
import { airflowColor } from './colorMaps.js';

export class AirflowParticles {
  constructor() {
    this.group = new THREE.Group();
    this.particles = [];
  }

  clear() {
    this.group.clear();
    this.particles = [];
  }

  build(zoneResults, zones) {
    this.clear();
    zoneResults.forEach((zone, idx) => {
      const zoneBase = zones.find(z => z.id === zone.id);
      if (!zoneBase) return;
      const isBack = zone.id.includes('Back');
      const z = isBack ? -0.62 : 0.62;
      const y = zoneBase.y + ((idx % 3) - 1) * 0.035;
      const flow = Math.max(0.1, zone.airFlow);
      const count = Math.min(10, Math.max(2, Math.round(flow * 3)));
      for (let i = 0; i < count; i++) {
        const geo = new THREE.SphereGeometry(0.012 + flow * 0.003, 8, 6);
        const mat = new THREE.MeshBasicMaterial({ color: airflowColor(flow), transparent: true, opacity: 0.45 });
        const p = new THREE.Mesh(geo, mat);
        p.position.set(-1.65 - i * 0.14, y + Math.sin(i) * 0.025, z + (Math.random() - 0.5) * 0.08);
        p.userData = { speed: 0.006 + flow * 0.003, resetX: -1.7 - Math.random() * 0.6, maxX: 1.15 + flow * 0.2 };
        this.group.add(p);
        this.particles.push(p);
      }
    });
  }

  tick() {
    this.particles.forEach(p => {
      p.position.x += p.userData.speed;
      p.material.opacity = 0.25 + Math.sin(Date.now() * 0.004 + p.position.x) * 0.18 + 0.25;
      if (p.position.x > p.userData.maxX) p.position.x = p.userData.resetX;
    });
  }
}
