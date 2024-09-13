// FourWinsGame.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Player, Move } from './4Win-algorithm/types';
import { getValidColumns, getNextOpenRow, checkWinner } from './4Win-algorithm/utils';
import { minimax } from './4Win-algorithm/minimax';
import { minimaxNoPruning } from './4Win-algorithm/minimaxNoPruning';

const ROWS = 6;
const COLS = 7;

interface CellProps {
  value: Player;
  animate: boolean;
}

const Cell: React.FC<CellProps> = ({ value, animate }) => (
  <div className="w-16 h-16 flex items-center justify-center">
    <div className="relative w-14 h-14">
      <div className="absolute inset-0">
        <div className="w-full h-full bg-blue-700 rounded-full"></div>
      </div>
      {value && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ y: animate ? -200 : 0 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div
            className={`w-12 h-12 rounded-full ${
              value === 'Red' ? 'bg-red-500' : 'bg-yellow-400'
            }`}
          />
        </motion.div>
      )}
    </div>
  </div>
);

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const FourWinsGame: React.FC = () => {
  const [board, setBoard] = useState<Player[][]>(
    Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('Red');
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);
  const [aiThinking, setAIThinking] = useState<string>('');
  const [showAIThinking, setShowAIThinking] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');

  useEffect(() => {
    if (currentPlayer === 'Yellow' && !winner) {
      setIsProcessing(true);
      setTimeout(() => {
        aiMove();
        setIsProcessing(false);
      }, 500);
    }
  }, [currentPlayer, winner]);

  const handleClick = (col: number) => {
    if (winner || board[0][col] || isProcessing || currentPlayer !== 'Red') return;

    const row = getNextOpenRow(board, col);
    if (row !== -1) {
      const newBoard = board.map((row) => row.slice());
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);
      setLastMove({ row, col });

      const gameResult = checkWinner(newBoard);
      if (gameResult) {
        setWinner(gameResult);
      } else {
        setCurrentPlayer('Yellow');
      }
    }
  };

  const aiMove = () => {
    const aiPlayer = 'Yellow' as Player;
    const humanPlayer = 'Red' as Player;

    let bestColumn = -1;
    let thinkingProcess = '';

    if (difficulty === 'Easy') {
      // Random AI
      const validColumns = getValidColumns(board);
      bestColumn = validColumns[Math.floor(Math.random() * validColumns.length)];
      thinkingProcess = 'AI selected a random valid move.';
    } else if (difficulty === 'Medium') {
      // Minimax without Alpha-Beta Pruning
      const { column, thinkingProcess: tp } = minimaxNoPruning(
        board,
        3,
        true,
        aiPlayer,
        humanPlayer
      );
      bestColumn = column;
      thinkingProcess = formatThinkingProcess(tp);
    } else {
      // Hard (Minimax with Alpha-Beta Pruning)
      const { column, thinkingProcess: tp } = minimax(
        board,
        5,
        -Infinity,
        Infinity,
        true,
        aiPlayer,
        humanPlayer
      );
      bestColumn = column;
      thinkingProcess = formatThinkingProcess(tp);
    }

    setAIThinking(thinkingProcess);

    if (bestColumn !== -1) {
      const row = getNextOpenRow(board, bestColumn);
      const newBoard = board.map((row) => row.slice());
      newBoard[row][bestColumn] = aiPlayer;
      setBoard(newBoard);
      setLastMove({ row, col: bestColumn });

      const gameResult = checkWinner(newBoard);
      if (gameResult) {
        setWinner(gameResult);
      } else {
        setCurrentPlayer('Red');
      }
    }
  };

  const formatThinkingProcess = (thinkingProcess: Move[]): string => {
    let output = '';
    thinkingProcess.forEach((move) => {
      output += `At depth ${move.depth}, considering column ${move.column + 1}, score: ${move.score}\n`;
    });
    return output;
  };

  const resetGame = () => {
    setBoard(
      Array(ROWS)
        .fill(null)
        .map(() => Array(COLS).fill(null))
    );
    setCurrentPlayer('Red');
    setWinner(null);
    setLastMove(null);
    setAIThinking('');
  };

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold text-center mb-4">Connect Four</h2>
      <div className="flex flex-col items-center mb-4">
        {winner ? (
          <p className="text-lg mb-2">
            {winner === 'Draw' ? (
              <span className="font-semibold">It's a Draw!</span>
            ) : (
              <span className="font-semibold">{winner} Wins!</span>
            )}
          </p>
        ) : (
          <p className="text-lg mb-2">
            Current Player:{' '}
            <span
              className={`font-semibold ${
                currentPlayer === 'Red' ? 'text-red-500' : 'text-yellow-400'
              }`}
            >
              {currentPlayer}
            </span>
          </p>
        )}
        <div className="flex space-x-2 mb-2">
          <button
            onClick={resetGame}
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Reset Game
          </button>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            disabled={currentPlayer !== 'Red' || winner !== null}
          >
            <option value="Easy">Easy (Random)</option>
            <option value="Medium">Medium (Minimax)</option>
            <option value="Hard">Hard (Minimax with Alpha-Beta Pruning)</option>
          </select>
          <button
            onClick={() => setShowAIThinking(!showAIThinking)}
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            {showAIThinking ? 'Hide AI Thinking' : 'Show AI Thinking'}
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <div>
          <div className="grid grid-cols-7 gap-1 bg-blue-800 p-2 rounded-lg">
            {Array(COLS)
              .fill(null)
              .map((_, colIndex) => (
                <div key={colIndex} className="flex flex-col-reverse">
                  {board.map((_, rowIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleClick(colIndex)}
                      className={`cursor-pointer ${
                        isProcessing || currentPlayer !== 'Red' ? 'pointer-events-none' : ''
                      }`}
                    >
                      <Cell
                        value={board[rowIndex][colIndex]}
                        animate={
                          lastMove &&
                          lastMove.row === rowIndex &&
                          lastMove.col === colIndex
                        }
                      />
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
      {showAIThinking && aiThinking && (
        <div className="mt-4 p-4 bg-gray-800 rounded overflow-auto max-h-64">
          <h3 className="text-xl font-bold mb-2">AI Thinking Process:</h3>
          <pre className="text-sm whitespace-pre-wrap">{aiThinking}</pre>
        </div>
      )}
    </div>
  );
};

export default FourWinsGame;
