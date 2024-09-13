// FractalTree.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { a, useSpring } from '@react-spring/three';
import { Noise } from 'noisejs';
import Ground from './Ground'; // Importiere die Ground-Komponente

// Initialisiere Perlin Noise für sanfteres Schütteln
const noise = new Noise(Math.random());

type BranchProps = {
  start: THREE.Vector3;
  length: number;
  direction: THREE.Vector3;
  depth: number;
  branchWidth: number;
  angleDiff: number;
  lengthFactor: number;
  randomness: number;
  leafSize: number;
  isShaking: boolean;
  fallingLeaves: React.MutableRefObject<THREE.Vector3[]>;
};

// Branch.tsx (Innerhalb von FractalTree.tsx)

const Branch: React.FC<BranchProps> = React.memo(
    ({
      start,
      length,
      direction,
      depth,
      branchWidth,
      angleDiff,
      lengthFactor,
      randomness,
      leafSize,
      isShaking,
      fallingLeaves,
    }) => {
      // Berechne den Endpunkt
      const end = useMemo(
        () => start.clone().add(direction.clone().multiplyScalar(length)),
        [start, direction, length]
      );
  
      // Branch-Geometrie
      const branchLength = length;
      const branchPosition = useMemo(
        () => start.clone().add(end).divideScalar(2),
        [start, end]
      );
  
      // Erstelle eine Quaternion für die Rotation
      const quaternion = useMemo(() => {
        const branchDirection = end.clone().sub(start).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        return new THREE.Quaternion().setFromUnitVectors(up, branchDirection);
      }, [start, end]);
  
      // Branch-Farbe (braun)
      const branchColor = 0x8b4513; // SaddleBrown-Farbe
  
      // Generiere zufällige Winkel für das Verzweigen
      const angleVariation = useMemo(
        () =>
          THREE.MathUtils.degToRad(angleDiff + (Math.random() - 0.5) * randomness),
        [angleDiff, randomness]
      );
      const axisVariation = useMemo(
        () =>
          new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).normalize(),
        []
      );
  
      // Linke und rechte Richtungen
      const leftDirection = useMemo(
        () => direction.clone().applyAxisAngle(axisVariation, angleVariation),
        [direction, axisVariation, angleVariation]
      );
      const rightDirection = useMemo(
        () => direction.clone().applyAxisAngle(axisVariation, -angleVariation),
        [direction, axisVariation, angleVariation]
      );
  
      return (
        <>
          {/* Zeichne den aktuellen Zweig als vereinfachte Zylinder */}
          <mesh
            position={branchPosition}
            quaternion={quaternion}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[branchWidth, branchWidth, branchLength, 8]} />
            <meshStandardMaterial color={branchColor} flatShading />
          </mesh>
  
          {depth > 1 && (
            <>
              <Branch
                start={end}
                length={length * lengthFactor}
                direction={leftDirection}
                depth={depth - 1}
                branchWidth={branchWidth * 0.7}
                angleDiff={angleDiff}
                lengthFactor={lengthFactor}
                randomness={randomness}
                leafSize={leafSize}
                isShaking={isShaking}
                fallingLeaves={fallingLeaves}
              />
  
              <Branch
                start={end}
                length={length * lengthFactor}
                direction={rightDirection}
                depth={depth - 1}
                branchWidth={branchWidth * 0.7}
                angleDiff={angleDiff}
                lengthFactor={lengthFactor}
                randomness={randomness}
                leafSize={leafSize}
                isShaking={isShaking}
                fallingLeaves={fallingLeaves}
              />
            </>
          )}
  
          {depth === 1 && isShaking && (
            // Füge die Position der Blätter hinzu, wenn der Baum geschüttelt wird
            <FallingLeafSpawner position={end} fallingLeaves={fallingLeaves} leafSize={leafSize} />
          )}
        </>
      );
    }
  );
  

// Tree.tsx (Innerhalb von FractalTree.tsx)

type TreeProps = {
    position: THREE.Vector3;
    angleDiff: number;
    depth: number;
    lengthFactor: number;
    randomness: number;
    branchWidth: number;
    leafSize: number;
    onCollect: () => void; // Callback für das Sammeln von Blättern
  };
  
  const Tree: React.FC<TreeProps> = ({
    position,
    angleDiff,
    depth,
    lengthFactor,
    randomness,
    branchWidth,
    leafSize,
    onCollect,
  }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const [isShaking, setIsShaking] = useState(false);
    const fallingLeaves = useRef<THREE.Vector3[]>([]);
  
    // Erweitertes Schütteln mit Perlin Noise
    useFrame(({ clock }) => {
      if (isShaking && groupRef.current) {
        const time = clock.getElapsedTime();
        const shakeIntensity = 0.05; // Anpassen für mehr oder weniger Schütteln
        groupRef.current.rotation.x = noise.simplex2(time * 5, 0) * shakeIntensity;
        groupRef.current.rotation.y = noise.simplex2(0, time * 5) * shakeIntensity;
        groupRef.current.rotation.z = noise.simplex2(time * 5, time * 5) * shakeIntensity;
      }
    });
  
    const handleTreeClick = () => {
      setIsShaking(true);
    };
  
    // Setze den Schüttel-Zustand nach einer kurzen Dauer zurück
    useEffect(() => {
      if (isShaking) {
        const timeout = setTimeout(() => setIsShaking(false), 1000); // Schütteln für 1 Sekunde
        return () => clearTimeout(timeout);
      }
    }, [isShaking]);
  
    const handleFallComplete = (pos: THREE.Vector3) => {
      // Entferne das Blatt, wenn es den Boden erreicht hat
      fallingLeaves.current = fallingLeaves.current.filter((p) => !p.equals(pos));
    };
  
    const handleCollect = (pos: THREE.Vector3) => {
      // Entferne das Blatt aus der Liste
      fallingLeaves.current = fallingLeaves.current.filter((p) => !p.equals(pos));
      // Rufe den `onCollect`-Callback auf, um den Punktestand zu erhöhen
      onCollect();
    };
  
    return (
      <group
        ref={groupRef}
        position={position}
        onClick={handleTreeClick}
        castShadow
        receiveShadow
      >
        <Branch
          start={new THREE.Vector3(0, 0, 0)}
          length={10}
          direction={new THREE.Vector3(0, 1, 0)}
          depth={depth}
          branchWidth={branchWidth}
          angleDiff={angleDiff}
          lengthFactor={lengthFactor}
          randomness={randomness}
          leafSize={leafSize}
          isShaking={isShaking}
          fallingLeaves={fallingLeaves}
        />
  
        {/* Rendern der fallenden Blätter */}
        {fallingLeaves.current.map((leafPosition, index) => (
          <FallingLeaf
            key={index}
            initialPosition={leafPosition}
            leafSize={leafSize}
            onFallComplete={handleFallComplete}
            onCollect={handleCollect}
          />
        ))}
      </group>
    );
  };
  

type FallingLeafProps = {
  initialPosition: THREE.Vector3;
  leafSize: number;
  onFallComplete: (position: THREE.Vector3) => void;
};

const FallingLeaf: React.FC<FallingLeafProps> = ({ initialPosition, leafSize, onFallComplete }) => {
  const ref = useRef<THREE.Mesh>(null!);
  const velocity = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 0.5, // Horizontale Geschwindigkeit
    -2 - Math.random() * 2,      // Vertikale Geschwindigkeit
    (Math.random() - 0.5) * 0.5  // Horizontale Geschwindigkeit
  ));
  const rotation = useRef(new THREE.Euler(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  ));

  useFrame((state, delta) => {
    if (ref.current) {
      // Aktualisiere die Position basierend auf der Geschwindigkeit
      ref.current.position.addScaledVector(velocity.current, delta);

      // Wende Schwerkraft an
      velocity.current.y += -9.81 * delta * 0.1; // Schwerkraftstärke anpassen

      // Drehe das Blatt für einen natürlicheren Fall
      ref.current.rotation.x += delta;
      ref.current.rotation.y += delta * 0.5;
      ref.current.rotation.z += delta * 0.2;

      // Entferne das Blatt, wenn es unter den Boden fällt
      if (ref.current.position.y < -10) {
        onFallComplete(initialPosition);
      }
    }
  });

  return (
    <mesh ref={ref} position={initialPosition} castShadow receiveShadow>
      <sphereGeometry args={[leafSize, 6, 6]} />
      <meshStandardMaterial color="orange" flatShading />
    </mesh>
  );
};

const FractalTreeForest: React.FC = () => {
  const [angleDiff, setAngleDiff] = useState<number>(30);
  const [depth, setDepth] = useState<number>(6);
  const [lengthFactor, setLengthFactor] = useState<number>(0.7);
  const [randomness, setRandomness] = useState<number>(10);
  const [branchWidth, setBranchWidth] = useState<number>(0.5);
  const [leafSize, setLeafSize] = useState<number>(0.3);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [numTrees, setNumTrees] = useState<number>(5);

  // Generiere zufällige Positionen für die Bäume
  const treePositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < numTrees; i++) {
      const x = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      positions.push(new THREE.Vector3(x, 0, z)); // Y-Position auf 0 für Bodenebene
    }
    return positions;
  }, [numTrees]);

  // Memoisiere die Bäume, um erneutes Rendern zu verhindern
  const trees = useMemo(
    () =>
      treePositions.map((position, index) => (
        <Tree
          key={index}
          position={position}
          angleDiff={angleDiff}
          depth={depth}
          lengthFactor={lengthFactor}
          randomness={randomness}
          branchWidth={branchWidth}
          leafSize={leafSize}
        />
      )),
    [
      treePositions,
      angleDiff,
      depth,
      lengthFactor,
      randomness,
      branchWidth,
      leafSize,
    ]
  );

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#87CEEB' }}>
      <Canvas
        shadows
        camera={{ position: [0, 20, 60], fov: 45 }}
        style={{ background: 'skyblue' }}
      >
        {/* Himmelshintergrund */}
        <Sky sunPosition={[100, 20, 100]} />

        {/* Ambient-Licht */}
        <ambientLight intensity={0.4} />

        {/* Sonnähnliches gerichtetes Licht */}
        <directionalLight
          position={[100, 50, 100]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={200}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
        />

        {/* Bodenebene mit Gras-Textur */}
        <Ground />

        {/* Rendern der memoisierten Bäume */}
        {trees}

        {/* Steuerungen */}
        <OrbitControls autoRotate={autoRotate} autoRotateSpeed={1} />
      </Canvas>

      {/* Benutzersteuerungen */}
      <div
        className="controls"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          padding: '10px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '8px',
          color: 'white',
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <label>Number of Trees: {numTrees}</label>
          <input
            type="range"
            min="1"
            max="15"
            value={numTrees}
            onChange={(e) => setNumTrees(Number(e.target.value))}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Angle Difference: {angleDiff}°</label>
          <input
            type="range"
            min="0"
            max="90"
            value={angleDiff}
            onChange={(e) => setAngleDiff(Number(e.target.value))}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Depth: {depth}</label>
          <input
            type="range"
            min="1"
            max="7"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Length Factor: {lengthFactor.toFixed(2)}</label>
          <input
            type="range"
            min="0.5"
            max="0.9"
            step="0.01"
            value={lengthFactor}
            onChange={(e) => setLengthFactor(Number(e.target.value))}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Randomness: {randomness}</label>
          <input
            type="range"
            min="0"
            max="20"
            value={randomness}
            onChange={(e) => setRandomness(Number(e.target.value))}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Branch Width: {branchWidth.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.01"
            value={branchWidth}
            onChange={(e) => setBranchWidth(Number(e.target.value))}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Leaf Size: {leafSize.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.05"
            value={leafSize}
            onChange={(e) => setLeafSize(Number(e.target.value))}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Auto Rotate:
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              style={{ marginLeft: '5px' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default FractalTreeForest;
