import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { zones } from './data.js';

const thermalColor = value => new THREE.Color().setHSL(0.62 - (value / 100) * 0.62, 0.85, 0.54);
const moistureColor = value => new THREE.Color().setHSL(0.58, 0.75, 0.35 + Math.min(value / 12, 1) * 0.35);
const airflowColor = value => new THREE.Color().setHSL(0.55 - Math.min(value / 2.2, 1) * 0.18, 0.9, 0.55);
const perforationColor = value => new THREE.Color().setHSL(0.12, 0.9, 0.32 + Math.min(value / 25, 1) * 0.38);

export class ShirtScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1726);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 1.25, 5.4);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 0.35, 0);

    this.zoneMeshes = new Map();
    this.surfaceMeshes = [];
    this.perforationMeshes = [];
    this.airflowGroup = new THREE.Group();
    this.scene.add(this.airflowGroup);

    this.initLights();
    this.initBody();
    this.initGarment();
    this.initZones();
    this.initSurfaceLayer();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  initLights() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 1.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 5, 4);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x99ccff, 1.2);
    rim.position.set(-3, 2, -4);
    this.scene.add(rim);
  }

  initBody() {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xb98565, roughness: 0.7, metalness: 0.02 });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 1.55, 16, 32), skinMat);
    torso.scale.set(0.82, 1.0, 0.48);
    torso.position.y = 0.05;
    this.scene.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 16), skinMat);
    head.position.y = 1.25;
    this.scene.add(head);

    const armGeo = new THREE.CapsuleGeometry(0.12, 1.3, 12, 18);
    const leftArm = new THREE.Mesh(armGeo, skinMat);
    leftArm.rotation.z = -0.12;
    leftArm.position.set(-0.78, 0.18, 0);
    const rightArm = leftArm.clone();
    rightArm.position.x = 0.78;
    rightArm.rotation.z = 0.12;
    this.scene.add(leftArm, rightArm);
  }

  initGarment() {
    const shirtMat = new THREE.MeshPhysicalMaterial({
      color: 0x2f80ed,
      transparent: true,
      opacity: 0.32,
      roughness: 0.55,
      metalness: 0,
      transmission: 0.05,
      side: THREE.DoubleSide
    });
    this.shirt = new THREE.Mesh(new THREE.CapsuleGeometry(0.78, 1.62, 24, 48), shirtMat);
    this.shirt.scale.set(0.86, 1.0, 0.52);
    this.shirt.position.y = 0.03;
    this.scene.add(this.shirt);

    const hemMat = new THREE.MeshStandardMaterial({ color: 0x82b7ff, transparent: true, opacity: 0.42 });
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.018, 8, 64), hemMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.92, 0.02);
    collar.scale.z = 0.55;
    this.scene.add(collar);
  }

  initZones() {
    const markerGeo = new THREE.SphereGeometry(0.115, 24, 16);
    zones.forEach(zone => {
      const mat = new THREE.MeshStandardMaterial({ color: 0xffc857, emissive: 0x000000, roughness: 0.4 });
      const marker = new THREE.Mesh(markerGeo, mat);
      const isBack = zone.id.includes('Back');
      const x = zone.id === 'underarm' ? -0.78 : zone.x;
      const z = isBack ? -0.48 : 0.48;
      marker.position.set(x, zone.y, z);
      marker.userData.zone = zone.id;
      this.scene.add(marker);
      this.zoneMeshes.set(zone.id, marker);
    });
  }



  initSurfaceLayer() {
    const geo = new THREE.CircleGeometry(0.024, 12);
    for (let i = 0; i < 864; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x65d6ff, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false });
      const dot = new THREE.Mesh(geo, mat);
      dot.visible = false;
      this.scene.add(dot);
      this.surfaceMeshes.push(dot);
    }
  }

  update(result, view = 'thermal') {
    result.a.zones.forEach(zone => {
      const mesh = this.zoneMeshes.get(zone.id);
      if (!mesh) return;
      let color;
      if (view === 'thermal') color = thermalColor(zone.thermalIndex);
      else if (view === 'moisture') color = moistureColor(zone.fabricWetness);
      else if (view === 'airflow') color = airflowColor(zone.airFlow);
      else color = perforationColor(zone.openArea);
      mesh.material.color.copy(color);
      mesh.material.emissive.copy(color).multiplyScalar(0.18);
      const scale = 0.42 + (view === 'perforation' ? zone.openArea / 55 : zone.thermalIndex / 260);
      mesh.scale.setScalar(scale);
    });
    this.updateSurfaceCells(result.a.cells, view);
    this.updatePerforations(result.a.zones);
    this.updateAirflow(result.a.zones, view);
  }



  updateSurfaceCells(cells, view) {
    this.surfaceMeshes.forEach((mesh, index) => {
      const cell = cells[index];
      if (!cell) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;
      const { x, y, z } = cell.position;
      const outward = new THREE.Vector3(x, 0, z).normalize();
      mesh.position.set(x + outward.x * 0.035, y, z + outward.z * 0.035);
      mesh.lookAt(mesh.position.clone().add(outward));

      let color;
      let intensity;
      if (view === 'thermal') {
        color = thermalColor(cell.thermalIndex);
        intensity = 0.35 + cell.thermalIndex / 130;
      } else if (view === 'moisture') {
        color = moistureColor(cell.fabricWetness);
        intensity = 0.28 + cell.fabricWetness / 16;
      } else if (view === 'airflow') {
        color = airflowColor(cell.airFlow);
        intensity = 0.26 + cell.airFlow / 3.2;
      } else {
        color = perforationColor(cell.openArea);
        intensity = cell.openArea > 1 ? 0.82 : 0.15;
      }
      mesh.material.color.copy(color);
      mesh.material.opacity = Math.min(0.9, intensity);
      const scale = view === 'perforation' ? 0.55 + cell.openArea / 18 : 0.55 + intensity * 0.38;
      mesh.scale.setScalar(scale);
    });
  }

  updatePerforations(zoneResults) {
    this.perforationMeshes.forEach(m => this.scene.remove(m));
    this.perforationMeshes = [];
    zoneResults.forEach(zone => {
      const count = Math.min(18, Math.round(zone.openArea / 1.4));
      if (!count) return;
      const zoneBase = zones.find(z => z.id === zone.id);
      const isBack = zone.id.includes('Back');
      for (let i = 0; i < count; i++) {
        const dot = new THREE.Mesh(
          new THREE.CircleGeometry(0.018 + zone.openArea / 1500, 16),
          new THREE.MeshBasicMaterial({ color: 0x0b1020, side: THREE.DoubleSide })
        );
        dot.position.set(
          (zone.id === 'underarm' ? -0.78 : zoneBase.x) + (Math.random() - 0.5) * 0.34,
          zoneBase.y + (Math.random() - 0.5) * 0.26,
          isBack ? -0.535 : 0.535
        );
        dot.rotation.y = isBack ? Math.PI : 0;
        this.scene.add(dot);
        this.perforationMeshes.push(dot);
      }
    });
  }

  updateAirflow(zoneResults, view) {
    this.airflowGroup.clear();
    if (view !== 'airflow') return;
    zoneResults.forEach((zone, idx) => {
      const zoneBase = zones.find(z => z.id === zone.id);
      const isBack = zone.id.includes('Back');
      const length = 0.25 + zone.airFlow * 0.32;
      const start = new THREE.Vector3(-1.75, zoneBase.y, isBack ? -0.55 : 0.55);
      const end = new THREE.Vector3(start.x + length, zoneBase.y, start.z);
      const dir = end.clone().sub(start);
      const arrow = new THREE.ArrowHelper(dir.clone().normalize(), start, dir.length(), 0x66e3ff, 0.08, 0.05);
      arrow.position.y += (idx % 2) * 0.03;
      this.airflowGroup.add(arrow);
    });
  }

  resize() {
    const { clientWidth, clientHeight } = this.container;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
