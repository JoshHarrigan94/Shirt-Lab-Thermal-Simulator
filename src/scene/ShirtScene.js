import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { zones } from '../config/zones.js';
import { colorForView, thermalColor, moistureColor, airflowColor, perforationColor, comfortColor } from './colorMaps.js';
import { createBodyGroup, createShirtGroup, createFloorGrid } from './scenePrimitives.js';
import { AirflowParticles } from './airflowParticles.js';
import { cameraPresets } from './cameraPresets.js';

const colorLookup = { thermal: thermalColor, moisture: moistureColor, airflow: airflowColor, perforation: perforationColor, comfort: comfortColor };

export class ShirtScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1424);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(...cameraPresets.threeQuarter.position);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(...cameraPresets.threeQuarter.target);
    this.controls.maxDistance = 8;
    this.controls.minDistance = 2.2;

    this.zoneMeshes = new Map();
    this.surfaceMeshes = [];
    this.perforationMeshes = [];
    this.labels = [];
    this.comparisonGroup = new THREE.Group();
    this.surfaceGroup = new THREE.Group();
    this.perforationGroup = new THREE.Group();
    this.airflow = new AirflowParticles();

    this.scene.add(createFloorGrid());
    this.scene.add(this.surfaceGroup, this.perforationGroup, this.airflow.group, this.comparisonGroup);

    this.initLights();
    this.initBody();
    this.initGarment();
    this.initZones();
    this.initSurfaceLayer();
    this.initComparisonGhost();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  initLights() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 1.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.25);
    key.position.set(4, 5, 4);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x89c7ff, 1.5);
    rim.position.set(-3, 2, -4);
    this.scene.add(rim);
    const low = new THREE.PointLight(0x65d6ff, 1.2, 5);
    low.position.set(0, -0.25, 1.8);
    this.scene.add(low);
  }

  initBody() {
    this.body = createBodyGroup();
    this.scene.add(this.body);
  }

  initGarment() {
    const { group, shell } = createShirtGroup();
    this.shirtGroup = group;
    this.shirt = shell;
    this.scene.add(group);
  }

  initZones() {
    const markerGeo = new THREE.SphereGeometry(0.095, 24, 16);
    zones.forEach(zone => {
      const mat = new THREE.MeshStandardMaterial({ color: 0xffc857, emissive: 0x000000, roughness: 0.36, transparent: true, opacity: 0.92 });
      const marker = new THREE.Mesh(markerGeo, mat);
      const pos = this.zonePosition(zone);
      marker.position.copy(pos);
      marker.userData.zone = zone.id;
      this.scene.add(marker);
      this.zoneMeshes.set(zone.id, marker);
    });
  }

  zonePosition(zone) {
    const isBack = zone.id.includes('Back');
    const side = zone.id === 'underarm' ? -0.78 : zone.x;
    const z = isBack ? -0.56 : 0.56;
    return new THREE.Vector3(side, zone.y, z);
  }

  initSurfaceLayer() {
    const geo = new THREE.CircleGeometry(0.022, 14);
    for (let i = 0; i < 864; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x65d6ff, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false });
      const dot = new THREE.Mesh(geo, mat);
      dot.visible = false;
      this.surfaceGroup.add(dot);
      this.surfaceMeshes.push(dot);
    }
  }

  initComparisonGhost() {
    const { group, shell } = createShirtGroup();
    group.scale.setScalar(0.46);
    group.position.set(1.65, -0.42, -0.75);
    group.rotation.y = -0.32;
    shell.material.color.set(0xff9f6e);
    shell.material.opacity = 0.17;
    this.comparisonGhost = group;
    this.comparisonGhostShell = shell;
    this.comparisonGroup.add(group);
  }

  setCameraPreset(name) {
    const preset = cameraPresets[name] || cameraPresets.threeQuarter;
    this.camera.position.set(...preset.position);
    this.controls.target.set(...preset.target);
    this.controls.update();
  }

  update(result, view = 'thermal') {
    this.lastResult = result;
    this.lastView = view;
    const primary = result.a;
    const comparator = result.b;

    this.updateZones(primary.zones, view);
    this.updateSurfaceCells(primary.cells, view);
    this.updatePerforations(primary.cells);
    this.updateAirflow(primary.zones, view);
    this.updateComparisonGhost(comparator, view);
    this.updateShirtAppearance(primary, view);
  }

  updateShirtAppearance(primary, view) {
    const score = view === 'thermal' ? primary.thermalComfort : view === 'airflow' ? primary.airflowScore : view === 'moisture' ? primary.moistureScore : primary.surface.averageOpenArea;
    const mat = this.shirt.material;
    mat.color.copy((colorLookup[view] || thermalColor)(score));
    mat.opacity = view === 'perforation' ? 0.18 : 0.24;
  }

  updateZones(zoneResults, view) {
    zoneResults.forEach(zone => {
      const mesh = this.zoneMeshes.get(zone.id);
      if (!mesh) return;
      const color = colorForView(view, zone);
      mesh.material.color.copy(color);
      mesh.material.emissive.copy(color).multiplyScalar(0.22);
      const keyValue = view === 'perforation' ? zone.openArea : view === 'airflow' ? zone.airFlow * 35 : view === 'moisture' ? zone.fabricWetness * 6 : zone.thermalIndex;
      const scale = 0.55 + Math.min(keyValue / 120, 0.55);
      mesh.scale.setScalar(scale);
    });
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
      mesh.position.set(x + outward.x * 0.042, y, z + outward.z * 0.042);
      mesh.lookAt(mesh.position.clone().add(outward));

      const color = colorForView(view, cell);
      let intensity;
      if (view === 'thermal') intensity = 0.34 + cell.thermalIndex / 125;
      else if (view === 'moisture') intensity = 0.3 + cell.fabricWetness / 15;
      else if (view === 'airflow') intensity = 0.28 + cell.airFlow / 3.0;
      else if (view === 'comfort') intensity = 0.32 + cell.comfortScore / 160;
      else intensity = cell.openArea > 1 ? 0.84 : 0.12;

      mesh.material.color.copy(color);
      mesh.material.opacity = Math.min(0.92, intensity);
      const scale = view === 'perforation' ? 0.48 + cell.openArea / 17 : 0.5 + Math.min(intensity, 1) * 0.42;
      mesh.scale.setScalar(scale);
    });
  }

  updatePerforations(cells) {
    this.perforationGroup.clear();
    this.perforationMeshes = [];
    cells.filter(cell => cell.openArea >= 2.5).slice(0, 240).forEach((cell, index) => {
      const { x, y, z } = cell.position;
      const outward = new THREE.Vector3(x, 0, z).normalize();
      const radius = 0.008 + Math.min(cell.openArea, 28) / 1400;
      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(radius, 14),
        new THREE.MeshBasicMaterial({ color: 0x030813, transparent: true, opacity: 0.82, side: THREE.DoubleSide, depthWrite: false })
      );
      dot.position.set(x + outward.x * 0.05, y + ((index % 3) - 1) * 0.006, z + outward.z * 0.05);
      dot.lookAt(dot.position.clone().add(outward));
      this.perforationGroup.add(dot);
      this.perforationMeshes.push(dot);
    });
  }

  updateAirflow(zoneResults, view) {
    this.airflow.group.visible = view === 'airflow';
    if (view !== 'airflow') return;
    this.airflow.build(zoneResults, zones);
  }

  updateComparisonGhost(comparator, view) {
    if (!comparator || !this.comparisonGhostShell) return;
    const value = view === 'thermal' ? comparator.thermalComfort : view === 'airflow' ? comparator.airflowScore : view === 'moisture' ? comparator.moistureScore : comparator.surface.averageOpenArea;
    this.comparisonGhostShell.material.color.copy((colorLookup[view] || thermalColor)(value));
    this.comparisonGhostShell.material.opacity = 0.15 + Math.min(value / 250, 0.13);
  }

  resize() {
    const { clientWidth, clientHeight } = this.container;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.airflow.tick();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
