import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ROWS = 6;
const COLS = 7;

const FourWinsGame: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);

  const checkWin = (row: number, col: number, player: number) => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      for (let i = 1; i < 4; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) break;
        if (board[newRow][newCol] !== player) break;
        count++;
      }
      for (let i = 1; i < 4; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) break;
        if (board[newRow][newCol] !== player) break;
        count++;
      }
      if (count >= 4) return true;
    }
    return false;
  };

  const findEmptyRow = (col: number) => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === 0) return row;
    }
    return -1;
  };

  const handleMove = (col: number, player: number) => {
    if (winner) return;

    const row = findEmptyRow(col);
    if (row !== -1) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = player;
      setBoard(newBoard);
      setLastMove({ row, col });

      if (checkWin(row, col, player)) {
        setWinner(player);
      } else {
        setCurrentPlayer(player === 1 ? 2 : 1);
      }
    }
  };

  const handlePlayerMove = (col: number) => {
    handleMove(col, 1);
  };

  const aiMove = () => {
    // Simple AI: choose a random valid column
    const validMoves = Array.from({ length: COLS }, (_, i) => i).filter(col => findEmptyRow(col) !== -1);
    const randomCol = validMoves[Math.floor(Math.random() * validMoves.length)];
    handleMove(randomCol, 2);
  };

  useEffect(() => {
    if (currentPlayer === 2 && !winner) {
      const timer = setTimeout(() => {
        aiMove();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner]);

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    setCurrentPlayer(1);
    setWinner(null);
    setLastMove(null);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-blue-800 p-4 rounded-lg">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <motion.div
                key={colIndex}
                className="w-12 h-12 bg-blue-600 m-1 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => handlePlayerMove(colIndex)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {cell !== 0 && (
                  <motion.div
                    className={`w-10 h-10 rounded-full ${cell === 1 ? 'bg-red-500' : 'bg-yellow-500'}`}
                    initial={{ 
                      scale: 0,
                      y: lastMove && lastMove.col === colIndex ? -rowIndex * 52 - 52 : 0 
                    }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 500, 
                      damping: 30,
                      y: { type: 'spring', stiffness: 100, damping: 15 } 
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      {winner && (
        <motion.div
          className="mt-4 text-2xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {winner === 1 ? 'You win!' : 'AI wins!'}
        </motion.div>
      )}
      <motion.button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        onClick={resetGame}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Reset Game
      </motion.button>
    </div>
  );
};

export default FourWinsGame;