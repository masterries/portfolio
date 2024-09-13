// Ground.tsx
import React from 'react';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

const Ground: React.FC = () => {
  return (
    <Plane
      rotation={[-Math.PI / 2, 0, 0]} // Drehe die Plane, damit sie horizontal liegt
      position={[0, -0.01, 0]} // Leicht unter der Y-Achse platzieren, um Z-Fighting zu vermeiden
      receiveShadow // Ermöglicht das Empfangen von Schatten
      args={[500, 500]} // Größe der Plane
    >
      <meshStandardMaterial
        color="#228B22" // ForestGreen-Farbe
        side={THREE.DoubleSide} // Zeige die Plane von beiden Seiten
      />
    </Plane>
  );
};

export default Ground;
