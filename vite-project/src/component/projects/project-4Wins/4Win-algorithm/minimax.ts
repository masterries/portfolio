// algorithm/minimax.ts

import { Player, Board, Move } from './types';
import { getValidColumns, getNextOpenRow, checkWinner, scorePosition } from './utils';

export function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  player: Player,
  opponent: Player
): { column: number; score: number; thinkingProcess: Move[] } {
  const validColumns = getValidColumns(board);
  const isTerminal = checkWinner(board) !== null || validColumns.length === 0;

  if (depth === 0 || isTerminal) {
    const winner = checkWinner(board);
    let score = 0;
    if (winner === player) {
      score = 1000000;
    } else if (winner === opponent) {
      score = -1000000;
    } else {
      score = scorePosition(board, player);
    }
    return { column: -1, score, thinkingProcess: [] };
  }

  let bestMove: { column: number; score: number; thinkingProcess: Move[] } = {
    column: -1,
    score: maximizingPlayer ? -Infinity : Infinity,
    thinkingProcess: [],
  };

  for (let col of validColumns) {
    const row = getNextOpenRow(board, col);
    const newBoard = board.map((row) => row.slice());
    newBoard[row][col] = maximizingPlayer ? player : opponent;

    const childMove = minimax(
      newBoard,
      depth - 1,
      alpha,
      beta,
      !maximizingPlayer,
      player,
      opponent
    );

    const move: Move = {
      column: col,
      score: childMove.score,
      depth,
    };

    bestMove.thinkingProcess.push(move);

    if (maximizingPlayer) {
      if (childMove.score > bestMove.score) {
        bestMove.score = childMove.score;
        bestMove.column = col;
      }
      alpha = Math.max(alpha, bestMove.score);
    } else {
      if (childMove.score < bestMove.score) {
        bestMove.score = childMove.score;
        bestMove.column = col;
      }
      beta = Math.min(beta, bestMove.score);
    }

    if (alpha >= beta) {
      break;
    }
  }

  return bestMove;
}
