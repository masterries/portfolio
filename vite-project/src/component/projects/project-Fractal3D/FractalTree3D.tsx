// FractalTree3D.tsx
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Stars, Plane } from '@react-three/drei';
import * as THREE from 'three';

interface BranchProps {
  start: THREE.Vector3;
  direction: THREE.Vector3;
  length: number;
  depth: number;
  angleDiff: number;
  lengthFactor: number;
  randomness: number;
  branchWidth: number;
  growBothDirections: boolean;
  colorMode: string;
  createPlanes: boolean;
}

const Branch: React.FC<BranchProps> = ({
  start,
  direction,
  length,
  depth,
  angleDiff,
  lengthFactor,
  randomness,
  branchWidth,
  growBothDirections,
  colorMode,
  createPlanes,
}) => {
  if (depth === 0) return null;

  const end = start.clone().add(direction.clone().multiplyScalar(length));

  let color: THREE.Color;
  if (colorMode === 'random') {
    color = new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`);
  } else if (colorMode === 'monochrome') {
    color = new THREE.Color(`hsl(120, 100%, ${50 + depth * 2}%)`);
  } else { // gradient
    const hue = (depth / 10) * 240;
    color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
  }

  const branches = [];
  const numBranches = 2;
  const childEnds: THREE.Vector3[] = []; // To store ends of child branches for plane creation

  for (let i = 0; i < numBranches; i++) {
    const randomAngle = angleDiff + (Math.random() - 0.5) * randomness;
    const randomAxis = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();

    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      randomAxis,
      THREE.MathUtils.degToRad(randomAngle)
    );

    const newDirection = direction.clone().applyQuaternion(quaternion).normalize();

    const childLength = length * lengthFactor * (0.9 + Math.random() * 0.2);

    const childEnd = end.clone().add(newDirection.clone().multiplyScalar(childLength));
    childEnds.push(childEnd);

    branches.push(
      <Branch
        key={`${depth}-${i}`}
        start={end}
        direction={newDirection}
        length={childLength}
        depth={depth - 1}
        angleDiff={angleDiff}
        lengthFactor={lengthFactor}
        randomness={randomness}
        branchWidth={branchWidth * 1.2}
        growBothDirections={growBothDirections}
        colorMode={colorMode}
        createPlanes={createPlanes}
      />
    );
  }

  if (growBothDirections) {
    const reverseDirection = direction.clone().multiplyScalar(-1);
    const reverseLength = length * lengthFactor * (0.9 + Math.random() * 0.2);
    const reverseEnd = start.clone().add(reverseDirection.clone().multiplyScalar(reverseLength));

    branches.push(
      <Branch
        key={`reverse-${depth}`}
        start={start}
        direction={reverseDirection}
        length={reverseLength}
        depth={depth - 1}
        angleDiff={angleDiff}
        lengthFactor={lengthFactor}
        randomness={randomness}
        branchWidth={branchWidth * 1.2}
        growBothDirections={growBothDirections}
        colorMode={colorMode}
        createPlanes={createPlanes}
      />
    );
  }

  // Create planes between sibling branches if enabled and if there are multiple children
  const planes = [];
  if (createPlanes && childEnds.length > 1) {
    for (let i = 0; i < childEnds.length - 1; i++) {
      for (let j = i + 1; j < childEnds.length; j++) {
        const pointA = childEnds[i];
        const pointB = childEnds[j];
        const midPoint = new THREE.Vector3().addVectors(pointA, pointB).multiplyScalar(0.5);
        const distance = pointA.distanceTo(pointB);
        const normal = new THREE.Vector3().subVectors(pointB, pointA).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);

        // Determine plane color
        let planeColor: THREE.Color;
        if (colorMode === 'random') {
          planeColor = new THREE.Color(`hsl(${Math.random() * 360}, 80%, 60%)`);
        } else if (colorMode === 'monochrome') {
          planeColor = new THREE.Color(`hsl(240, 100%, ${50 + depth * 2}%)`);
        } else { // gradient
          const hue = (depth / 10) * 120;
          planeColor = new THREE.Color(`hsl(${hue}, 100%, 60%)`);
        }

        planes.push(
          <mesh
            key={`plane-${depth}-${i}-${j}`}
            position={midPoint}
            rotation={new THREE.Euler().setFromQuaternion(quaternion)}
            // Optional: You can rotate the plane to better fit the abstract style
          >
            <planeGeometry args={[distance, distance]} />
            <meshStandardMaterial
              color={planeColor}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        );
      }
    }
  }

  return (
    <>
      <Line
        points={[start, end]}
        color={color}
        lineWidth={branchWidth}
        transparent
        opacity={0.8}
      />
      {planes}
      {branches}
    </>
  );
};

const FractalTree3D: React.FC = () => {
  const [angleDiff, setAngleDiff] = useState<number>(20);
  const [depth, setDepth] = useState<number>(8);
  const [lengthFactor, setLengthFactor] = useState<number>(0.7);
  const [randomness, setRandomness] = useState<number>(10);
  const [branchWidth, setBranchWidth] = useState<number>(0.2);
  const [growBothDirections, setGrowBothDirections] = useState<boolean>(true);
  const [colorMode, setColorMode] = useState<string>('random');
  const [background, setBackground] = useState<string>('solid');
  const [createPlanes, setCreatePlanes] = useState<boolean>(false); // New state for plane creation

  return (
    <div style={{ height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        {background === 'stars' && <Stars />}
        {background === 'solid' && <color attach="background" args={['#000011']} />}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Branch
          start={new THREE.Vector3(0, 0, 0)}
          direction={new THREE.Vector3(0, 1, 0)}
          length={5}
          depth={depth}
          angleDiff={angleDiff}
          lengthFactor={lengthFactor}
          randomness={randomness}
          branchWidth={branchWidth}
          growBothDirections={growBothDirections}
          colorMode={colorMode}
          createPlanes={createPlanes} // Pass the new prop
        />
        <OrbitControls enableZoom={true} />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '10px 20px',
          borderRadius: '10px',
        }}
      >
        <div>
          <label>Winkel Unterschied: {angleDiff}°</label>
          <input
            type="range"
            min="0"
            max="90"
            value={angleDiff}
            onChange={(e) => setAngleDiff(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Tiefe: {depth}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Längenfaktor: {lengthFactor.toFixed(2)}</label>
          <input
            type="range"
            min="0.5"
            max="0.9"
            step="0.01"
            value={lengthFactor}
            onChange={(e) => setLengthFactor(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Zufälligkeit: {randomness}</label>
          <input
            type="range"
            min="0"
            max="50"
            value={randomness}
            onChange={(e) => setRandomness(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Linienbreite: {branchWidth.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={branchWidth}
            onChange={(e) => setBranchWidth(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Farbmodus:</label>
          <select value={colorMode} onChange={(e) => setColorMode(e.target.value)}>
            <option value="random">Zufällig</option>
            <option value="monochrome">Monochrom</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>
        <div>
          <label>Hintergrund:</label>
          <select value={background} onChange={(e) => setBackground(e.target.value)}>
            <option value="solid">Einfarbig</option>
            <option value="stars">Sterne</option>
          </select>
        </div>
        <div>
          <label>Planen erstellen:</label>
          <input
            type="checkbox"
            checked={createPlanes}
            onChange={(e) => setCreatePlanes(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default FractalTree3D;
