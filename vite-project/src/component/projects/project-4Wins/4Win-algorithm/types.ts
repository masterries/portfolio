// algorithm/types.ts

export type Player = 'Red' | 'Yellow' | null;

export type Board = Player[][];

export interface Move {
  column: number;
  score: number;
  depth: number;
}
