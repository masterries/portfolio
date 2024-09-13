// src/types.ts
export interface Node {
  x: number;
  y: number;
  z: number;
  isObstacle: boolean;
  isPath?: boolean;
}

export interface AStarProps {
  grid: Node[][][];
  start: Node;
  end: Node;
  onPath: (path: Node[]) => void;
}
