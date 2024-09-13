// src/App.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Define the Node interface
interface Node {
  x: number;
  z: number;
  isObstacle: boolean;
  isStart: boolean;
  isEnd: boolean;
  isOpen?: boolean;
  isClosed?: boolean;
  isPath?: boolean;
}

// Define the possible directions (8-directional movement)
const directions: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

// Main App Component
const AStarSimulation: React.FC = () => {
  const size = 20; // Grid size (20x20)
  const obstacleProbability = 0.5; // 30% chance of being an obstacle
  const animationSpeed = 100; // Time in ms between algorithm steps

  const [grid, setGrid] = useState<Node[][]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [pathFound, setPathFound] = useState<boolean | null>(null);
  const [start, setStart] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [end, setEnd] = useState<{ x: number; z: number }>({ x: size - 1, z: size - 1 });

  const openSetRef = useRef<NodeRecord[]>([]);
  const closedSetRef = useRef<Set<string>>(new Set());
  const cameFromRef = useRef<Map<string, Node>>(new Map());
  const gScoreRef = useRef<Record<string, number>>({});
  const fScoreRef = useRef<Record<string, number>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Define a NodeRecord for the open set
  interface NodeRecord {
    node: Node;
    gScore: number;
    fScore: number;
  }

  // Generate the grid with random obstacles
  const generateGrid = useCallback((): Node[][] => {
    const newGrid: Node[][] = [];
    for (let x = 0; x < size; x++) {
      const row: Node[] = [];
      for (let z = 0; z < size; z++) {
        const isStart = x === start.x && z === start.z;
        const isEnd = x === end.x && z === end.z;
        row.push({
          x,
          z,
          isObstacle: isStart || isEnd ? false : Math.random() < obstacleProbability,
          isStart,
          isEnd,
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  }, [size, start, end, obstacleProbability]);

  // Initialize the grid on component mount
  useEffect(() => {
    resetGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset Grid Function
  const resetGrid = () => {
    if (isAnimating) return; // Prevent resetting during animation
    setIsRunning(false);
    setPathFound(null);
    const newGrid = generateGrid();
    setGrid(newGrid);
  };

  // Heuristic function (Manhattan distance)
  const heuristic = (a: Node, b: Node): number => {
    return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
  };

  // Get valid neighbors in 2D grid
  const getNeighbors = (node: Node, grid: Node[][], size: number): Node[] => {
    const neighbors: Node[] = [];
    for (const [dx, dz] of directions) {
      const nx = node.x + dx;
      const nz = node.z + dz;
      if (nx >= 0 && nx < size && nz >= 0 && nz < size) {
        neighbors.push(grid[nx][nz]);
      }
    }
    return neighbors;
  };

  // Start the A* Algorithm
  const startAStar = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsAnimating(true);
    setPathFound(null);
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((node) => ({
          ...node,
          isOpen: false,
          isClosed: false,
          isPath: false,
        }))
      )
    );

    // Initialize the open set with the start node
    const startNode = grid[start.x][start.z];
    openSetRef.current = [
      {
        node: startNode,
        gScore: 0,
        fScore: heuristic(startNode, grid[end.x][end.z]),
      },
    ];
    closedSetRef.current = new Set();
    cameFromRef.current = new Map();
    gScoreRef.current = { [`${startNode.x},${startNode.z}`]: 0 };
    fScoreRef.current = {
      [`${startNode.x},${startNode.z}`]: heuristic(startNode, grid[end.x][end.z]),
    };

    // Start the animation loop
    intervalRef.current = setInterval(() => {
      stepAStar();
    }, animationSpeed);
  };

  // Step through the A* Algorithm
  const stepAStar = () => {
    if (openSetRef.current.length === 0) {
      // No path found
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      setIsAnimating(false);
      setPathFound(false);
      setIsRunning(false);
      return;
    }

    // Sort open set by fScore and get the node with the lowest fScore
    openSetRef.current.sort((a, b) => a.fScore - b.fScore);
    const currentRecord = openSetRef.current.shift();
    if (!currentRecord) return;
    const current = currentRecord.node;

    // If the current node is the end node, reconstruct the path
    if (current.isEnd) {
      reconstructPath(current);
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      setIsAnimating(false);
      setPathFound(true);
      setIsRunning(false);
      return;
    }

    // Move current node from open to closed set
    closedSetRef.current.add(`${current.x},${current.z}`);
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((node) =>
          node.x === current.x && node.z === current.z ? { ...node, isClosed: true } : node
        )
      )
    );

    // Explore neighbors
    const neighbors = getNeighbors(current, grid, size);
    for (const neighbor of neighbors) {
      if (closedSetRef.current.has(`${neighbor.x},${neighbor.z}`) || neighbor.isObstacle) {
        continue;
      }

      const tentativeGScore = gScoreRef.current[`${current.x},${current.z}`] + 1;

      const neighborKey = `${neighbor.x},${neighbor.z}`;
      if (
        !openSetRef.current.find((record) => record.node.x === neighbor.x && record.node.z === neighbor.z)
      ) {
        // Discover a new node
        cameFromRef.current.set(neighborKey, current);
        gScoreRef.current[neighborKey] = tentativeGScore;
        fScoreRef.current[neighborKey] = tentativeGScore + heuristic(neighbor, grid[end.x][end.z]);
        openSetRef.current.push({
          node: neighbor,
          gScore: tentativeGScore,
          fScore: fScoreRef.current[neighborKey],
        });

        // Mark neighbor as open
        setGrid((prevGrid) =>
          prevGrid.map((row) =>
            row.map((node) =>
              node.x === neighbor.x && node.z === neighbor.z ? { ...node, isOpen: true } : node
            )
          )
        );
      } else if (tentativeGScore < (gScoreRef.current[neighborKey] || Infinity)) {
        // This path to neighbor is better than any previous one
        cameFromRef.current.set(neighborKey, current);
        gScoreRef.current[neighborKey] = tentativeGScore;
        fScoreRef.current[neighborKey] = tentativeGScore + heuristic(neighbor, grid[end.x][end.z]);

        // Update the open set
        const existingRecord = openSetRef.current.find(
          (record) => record.node.x === neighbor.x && record.node.z === neighbor.z
        );
        if (existingRecord) {
          existingRecord.gScore = tentativeGScore;
          existingRecord.fScore = fScoreRef.current[neighborKey];
        }
      }
    }
  };

  // Reconstruct the path from end to start
  const reconstructPath = (current: Node) => {
    const path: Node[] = [];
    let temp: Node | undefined = current;
    while (temp) {
      path.push(temp);
      const tempKey = `${temp.x},${temp.z}`;
      temp = cameFromRef.current.get(tempKey);
    }
    path.reverse();

    // Update the grid to mark the path
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((node) => {
          if (path.find((p) => p.x === node.x && p.z === node.z)) {
            return { ...node, isPath: true };
          }
          return node;
        })
      )
    );
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Controls */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}>
        <button
          onClick={resetGrid}
          style={{ padding: '10px 20px', marginRight: '10px', fontSize: '16px' }}
          disabled={isAnimating}
        >
          Reset Grid
        </button>
        <button
          onClick={startAStar}
          style={{ padding: '10px 20px', fontSize: '16px' }}
          disabled={isRunning || isAnimating}
        >
          Start A*
        </button>
      </div>

      {/* Status Messages */}
      {isRunning && (
        <div style={{ position: 'absolute', top: 60, left: 20, zIndex: 1, color: 'white' }}>
          Running...
        </div>
      )}
      {!isRunning && pathFound === true && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 20,
            zIndex: 1,
            padding: '10px 20px',
            backgroundColor: 'rgba(0, 255, 0, 0.7)',
            color: 'white',
            borderRadius: '5px',
          }}
        >
          Path Found!
        </div>
      )}
      {!isRunning && pathFound === false && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 20,
            zIndex: 1,
            padding: '10px 20px',
            backgroundColor: 'rgba(255, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '5px',
          }}
        >
          No Path Available.
        </div>
      )}

      {/* 3D Scene */}
      <Canvas camera={{ position: [size, size, size], fov: 100 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[size * 1.5, size * 2, size * 1.5]} intensity={1} />

        {/* Grid Visualization */}
        {grid.map((row, x) =>
          row.map((node, z) => {
            let color = 'white';
            if (node.isObstacle) color = 'red';
            if (node.isStart) color = 'blue';
            if (node.isEnd) color = 'yellow';
            if (node.isOpen) color = 'cyan';
            if (node.isClosed) color = 'orange';
            if (node.isPath) color = 'green';

            return (
              <mesh key={`${x}-${z}`} position={[x, 0, z]}>
                <boxGeometry args={[1, 0.1, 1]} />
                <meshStandardMaterial color={color} />
              </mesh>
            );
          })
        )}

        {/* Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[size / 2 - 0.5, -0.05, size / 2 - 0.5]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color="#444" />
        </mesh>

        {/* Orbit Controls */}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default AStarSimulation;
