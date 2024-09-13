// algorithm/utils.ts

import { Player, Board } from './types';

export function getValidColumns(board: Board): number[] {
  const validColumns: number[] = [];
  for (let col = 0; col < board[0].length; col++) {
    if (board[0][col] === null) validColumns.push(col);
  }
  return validColumns;
}

export function getNextOpenRow(board: Board, col: number): number {
  for (let row = board.length - 1; row >= 0; row--) {
    if (!board[row][col]) {
      return row;
    }
  }
  return -1;
}

export function checkWinner(board: Board): Player | 'Draw' | null {
  const ROWS = board.length;
  const COLS = board[0].length;

  // Check horizontal locations
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const cell = board[row][col];
      if (
        cell &&
        cell === board[row][col + 1] &&
        cell === board[row][col + 2] &&
        cell === board[row][col + 3]
      ) {
        return cell;
      }
    }
  }

  // Check vertical locations
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS - 3; row++) {
      const cell = board[row][col];
      if (
        cell &&
        cell === board[row + 1][col] &&
        cell === board[row + 2][col] &&
        cell === board[row + 3][col]
      ) {
        return cell;
      }
    }
  }

  // Check positively sloped diagonals (bottom-left to top-right)
  for (let row = ROWS - 1; row >= 3; row--) {
    for (let col = 0; col < COLS - 3; col++) {
      const cell = board[row][col];
      if (
        cell &&
        cell === board[row - 1][col + 1] &&
        cell === board[row - 2][col + 2] &&
        cell === board[row - 3][col + 3]
      ) {
        return cell;
      }
    }
  }

  // Check negatively sloped diagonals (top-left to bottom-right)
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const cell = board[row][col];
      if (
        cell &&
        cell === board[row + 1][col + 1] &&
        cell === board[row + 2][col + 2] &&
        cell === board[row + 3][col + 3]
      ) {
        return cell;
      }
    }
  }

  // Check for draw
  if (board[0].every((cell) => cell !== null)) {
    return 'Draw';
  }

  return null;
}

export function scorePosition(board: Board, player: Player): number {
  const opponent = player === 'Red' ? 'Yellow' : 'Red';
  let score = 0;

  // Center column preference
  const centerColumn = Math.floor(board[0].length / 2);
  const centerArray = board.map((row) => row[centerColumn]);
  const centerCount = centerArray.filter((cell) => cell === player).length;
  score += centerCount * 3;

  // Score Horizontal
  for (let row = 0; row < board.length; row++) {
    const rowArray = board[row];
    for (let col = 0; col < board[0].length - 3; col++) {
      const window = rowArray.slice(col, col + 4);
      score += evaluateWindow(window, player);
    }
  }

  // Score Vertical
  for (let col = 0; col < board[0].length; col++) {
    for (let row = 0; row < board.length - 3; row++) {
      const window = [
        board[row][col],
        board[row + 1][col],
        board[row + 2][col],
        board[row + 3][col],
      ];
      score += evaluateWindow(window, player);
    }
  }

  // Score Positive Diagonal
  for (let row = 0; row < board.length - 3; row++) {
    for (let col = 0; col < board[0].length - 3; col++) {
      const window = [
        board[row][col],
        board[row + 1][col + 1],
        board[row + 2][col + 2],
        board[row + 3][col + 3],
      ];
      score += evaluateWindow(window, player);
    }
  }

  // Score Negative Diagonal
  for (let row = 3; row < board.length; row++) {
    for (let col = 0; col < board[0].length - 3; col++) {
      const window = [
        board[row][col],
        board[row - 1][col + 1],
        board[row - 2][col + 2],
        board[row - 3][col + 3],
      ];
      score += evaluateWindow(window, player);
    }
  }

  return score;
}

function evaluateWindow(window: Player[], player: Player): number {
  const opponent = player === 'Red' ? 'Yellow' : 'Red';
  let score = 0;

  const playerCount = window.filter((cell) => cell === player).length;
  const emptyCount = window.filter((cell) => cell === null).length;
  const opponentCount = window.filter((cell) => cell === opponent).length;

  if (playerCount === 4) {
    score += 100;
  } else if (playerCount === 3 && emptyCount === 1) {
    score += 5;
  } else if (playerCount === 2 && emptyCount === 2) {
    score += 2;
  }

  if (opponentCount === 3 && emptyCount === 1) {
    score -= 4;
  }

  return score;
}
