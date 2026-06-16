import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSimStore } from '../simulation/store';
import { calculateZones } from '../simulation/thermalModel';

export function ShirtScene() {
  return <div className="sceneWrap">
    <Canvas camera={{ position: [0, 1.15, 4.4], fov: 42 }}>
      <ambientLight intensity={0.7}/>
      <directionalLight position={[4, 5, 4]} intensity={1.2}/>
      <Environment preset="city" />
      <Athlete />
      <Shirt />
      <Airflow />
      <OrbitControls enablePan={false}/>
    </Canvas>
  </div>
}

function Athlete() {
  return <group>
    <mesh position={[0, 0.65, 0]} scale={[0.88, 1.18, 0.42]}>
      <capsuleGeometry args={[0.72, 1.35, 16, 32]}/>
      <meshStandardMaterial color="#8f6a55" roughness={0.75}/>
    </mesh>
    <mesh position={[0, 1.92, 0]} scale={[0.44, 0.5, 0.44]}>
      <sphereGeometry args={[0.5, 32, 32]}/>
      <meshStandardMaterial color="#8f6a55" roughness={0.75}/>
    </mesh>
    <Arm x={-0.92}/><Arm x={0.92}/>
  </group>
}
function Arm({x}:{x:number}) { return <mesh position={[x, 0.75, 0]} rotation={[0,0,x > 0 ? -0.17 : 0.17]} scale={[0.17, 0.9, 0.17]}><capsuleGeometry args={[0.32, 1.1, 12, 16]}/><meshStandardMaterial color="#8f6a55" roughness={0.78}/></mesh> }

function Shirt() {
  const state = useSimStore();
  const zones = calculateZones(state);
  const avgHeat = zones.reduce((a,z)=>a+z.heat,0)/zones.length;
  const avgMoisture = zones.reduce((a,z)=>a+z.moisture,0)/zones.length;
  const color = new THREE.Color().setHSL(0.61 - avgHeat * 0.45, 0.78, 0.55 - avgMoisture * 0.16);
  return <group>
    <mesh position={[0, 0.65, 0]} scale={[0.98, 1.12, 0.49]}>
      <capsuleGeometry args={[0.76, 1.32, 32, 48]}/>
      <meshPhysicalMaterial color={color} transparent opacity={0.74} roughness={0.45} transmission={0.05}/>
    </mesh>
    <Perforations />
    <ZoneLabels />
  </group>
}

function Perforations() {
  const { pattern, perforationScale } = useSimStore();
  const points = useMemo(() => generateHolePoints(pattern, perforationScale), [pattern, perforationScale]);
  return <group>{points.map((p, i) => <mesh key={i} position={p.pos} rotation={p.rot} scale={p.scale}>
    <circleGeometry args={[0.028, 18]}/><meshBasicMaterial color="#101318" transparent opacity={0.88}/>
  </mesh>)}</group>
}

function generateHolePoints(pattern: string, scale: number) {
  const count = Math.round((pattern === 'none' ? 0 : pattern === 'mothtech_style' ? 95 : pattern === 'full_scatter' ? 130 : 70) * scale);
  const pts: {pos:[number,number,number]; rot:[number,number,number]; scale:[number,number,number]}[] = [];
  for (let i=0;i<count;i++) {
    let x = (Math.random() - 0.5) * 1.2, y = 0.15 + Math.random() * 1.05, z = 0.505;
    if (pattern === 'spine_vent') { x = (Math.random() - 0.5) * 0.22; z = -0.505; }
    if (pattern === 'underarm_focus') { x = (Math.random() > 0.5 ? 0.72 : -0.72) + (Math.random()-0.5)*0.12; y = 0.8 + Math.random()*0.45; }
    if (pattern === 'mothtech_style') { z = Math.random() > 0.45 ? 0.505 : -0.505; y = 0.45 + Math.random()*0.82; x = (Math.random()-0.5)*1.0; }
    pts.push({ pos:[x,y,z], rot:[0,0,0], scale:[1 + Math.random()*0.8, 1 + Math.random()*0.8, 1] });
  }
  return pts;
}

function Airflow() {
  const ref = useRef<THREE.Group>(null);
  const { windKph, paceKph } = useSimStore();
  useFrame(({clock}) => { if(ref.current) ref.current.position.z = ((clock.elapsedTime * (0.2 + (windKph+paceKph)/30)) % 1.5) - 0.75; });
  const intensity = Math.min(1, (windKph + paceKph) / 30);
  return <group ref={ref}>{Array.from({length: 16}).map((_,i)=> <mesh key={i} position={[(i%4-1.5)*0.75, 0.25 + Math.floor(i/4)*0.38, 1.8 - (i%4)*0.08]} rotation={[Math.PI/2,0,0]}>
    <cylinderGeometry args={[0.006 + intensity*0.008, 0.006 + intensity*0.008, 0.55, 8]}/><meshBasicMaterial color="#a9ddff" transparent opacity={0.18 + intensity*0.36}/>
  </mesh>)}</group>
}

function ZoneLabels() {
  return <group><Text position={[0,1.42,0.9]} fontSize={0.08} color="#fff">thermal garment mesh</Text></group>
}
