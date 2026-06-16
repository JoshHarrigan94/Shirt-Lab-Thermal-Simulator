import * as THREE from 'three';

export function createBodyGroup() {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xb98565, roughness: 0.72, metalness: 0.02 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 1.55, 24, 36), skinMat);
  torso.scale.set(0.82, 1.0, 0.48);
  torso.position.y = 0.05;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 18), skinMat);
  head.position.y = 1.25;
  group.add(head);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.18, 24), skinMat);
  neck.position.y = 1.02;
  group.add(neck);

  const armGeo = new THREE.CapsuleGeometry(0.12, 1.3, 16, 22);
  const leftArm = new THREE.Mesh(armGeo, skinMat);
  leftArm.rotation.z = -0.14;
  leftArm.position.set(-0.78, 0.18, 0);
  const rightArm = leftArm.clone();
  rightArm.position.x = 0.78;
  rightArm.rotation.z = 0.14;
  group.add(leftArm, rightArm);

  return group;
}

export function createShirtGroup() {
  const group = new THREE.Group();
  const shirtMat = new THREE.MeshPhysicalMaterial({
    color: 0x2f80ed,
    transparent: true,
    opacity: 0.25,
    roughness: 0.58,
    metalness: 0,
    transmission: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const shell = new THREE.Mesh(new THREE.CapsuleGeometry(0.78, 1.62, 28, 56), shirtMat);
  shell.scale.set(0.86, 1.0, 0.52);
  shell.position.y = 0.03;
  group.add(shell);

  const seamMat = new THREE.MeshStandardMaterial({ color: 0x82b7ff, transparent: true, opacity: 0.5, roughness: 0.4 });
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.018, 8, 72), seamMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.92, 0.02);
  collar.scale.z = 0.55;
  group.add(collar);

  const hem = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.012, 8, 96), seamMat);
  hem.rotation.x = Math.PI / 2;
  hem.position.y = -0.55;
  hem.scale.z = 0.58;
  group.add(hem);

  const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.42, 28, 1, true), shirtMat.clone());
  leftSleeve.rotation.z = Math.PI / 2.65;
  leftSleeve.rotation.x = Math.PI / 2;
  leftSleeve.position.set(-0.77, 0.62, 0);
  const rightSleeve = leftSleeve.clone();
  rightSleeve.position.x = 0.77;
  rightSleeve.rotation.z = -Math.PI / 2.65;
  group.add(leftSleeve, rightSleeve);

  return { group, shell };
}

export function createFloorGrid() {
  const group = new THREE.Group();
  const grid = new THREE.GridHelper(5.5, 22, 0x21476d, 0x16304e);
  grid.position.y = -0.9;
  grid.material.transparent = true;
  grid.material.opacity = 0.38;
  group.add(grid);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 1.13, 96),
    new THREE.MeshBasicMaterial({ color: 0x65d6ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.895;
  group.add(ring);
  return group;
}
