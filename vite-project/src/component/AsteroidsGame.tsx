import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 20;
const ALIEN_ROWS = 5;
const ALIEN_COLUMNS = 11;
const ALIEN_WIDTH = 30;
const ALIEN_HEIGHT = 30;
const ALIEN_SPACING = 10;
const ALIEN_SPEED = 1;
const ALIEN_DROP = 20;
const BULLET_COOLDOWN = 1000; // 1 second cooldown
const BOMB_COOLDOWN = 5000; // 5 seconds cooldown
const BOMB_SPEED = 3;
const BOMB_RADIUS = 45; // This will create a 3x3 area of effect

interface Alien {
  id: number;
  x: number;
  y: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
}

interface Bomb {
  x: number;
  y: number;
  exploded: boolean;
}

const SpaceInvadersGame: React.FC = () => {
  const [player, setPlayer] = useState({ x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2 });
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [bomb, setBomb] = useState<Bomb | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [alienDirection, setAlienDirection] = useState(1); // 1 for right, -1 for left
  const [alienDropping, setAlienDropping] = useState(false);
  const [canShoot, setCanShoot] = useState(true);
  const [canBomb, setCanBomb] = useState(true);

  const playerControls = useAnimation();
  const bombAnimation = useAnimation();

  const initializeAliens = useCallback(() => {
    const newAliens: Alien[] = [];
    for (let row = 0; row < ALIEN_ROWS; row++) {
      for (let col = 0; col < ALIEN_COLUMNS; col++) {
        newAliens.push({
          id: row * ALIEN_COLUMNS + col,
          x: col * (ALIEN_WIDTH + ALIEN_SPACING),
          y: row * (ALIEN_HEIGHT + ALIEN_SPACING) + 50,
        });
      }
    }
    setAliens(newAliens);
  }, []);

  useEffect(() => {
    initializeAliens();
  }, [initializeAliens]);

  const shoot = () => {
    if (canShoot && !gameOver) {
      setBullets(prev => [...prev, { id: Date.now(), x: player.x + PLAYER_WIDTH / 2, y: GAME_HEIGHT - PLAYER_HEIGHT }]);
      setCanShoot(false);
      setTimeout(() => setCanShoot(true), BULLET_COOLDOWN);
    }
  };

  const deployBomb = () => {
    if (canBomb && !gameOver) {
      setBomb({ x: player.x + PLAYER_WIDTH / 2, y: GAME_HEIGHT - PLAYER_HEIGHT, exploded: false });
      setCanBomb(false);
      setTimeout(() => setCanBomb(true), BOMB_COOLDOWN);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          setPlayer(prev => ({ x: Math.max(0, prev.x - 10) }));
          break;
        case 'ArrowRight':
          setPlayer(prev => ({ x: Math.min(GAME_WIDTH - PLAYER_WIDTH, prev.x + 10) }));
          break;
        case 'd':
        case 'D':
          shoot();
          break;
        case 'f':
        case 'F':
          deployBomb();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, gameOver, canShoot, canBomb]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      // Move aliens
      setAliens(prev => {
        const leftmostAlien = prev.reduce((min, alien) => alien.x < min.x ? alien : min);
        const rightmostAlien = prev.reduce((max, alien) => alien.x > max.x ? alien : max);

        let newDirection = alienDirection;
        let shouldDrop = false;

        if (rightmostAlien.x + ALIEN_WIDTH + ALIEN_SPEED > GAME_WIDTH && alienDirection > 0) {
          newDirection = -1;
          shouldDrop = true;
        } else if (leftmostAlien.x - ALIEN_SPEED < 0 && alienDirection < 0) {
          newDirection = 1;
          shouldDrop = true;
        }

        if (newDirection !== alienDirection) {
          setAlienDirection(newDirection);
        }

        if (shouldDrop) {
          setAlienDropping(true);
        }

        return prev.map(alien => ({
          ...alien,
          x: alien.x + ALIEN_SPEED * newDirection,
          y: shouldDrop ? alien.y + ALIEN_DROP : alien.y,
        }));
      });

      setAlienDropping(false);

      // Move bullets
      setBullets(prev => prev.map(bullet => ({ ...bullet, y: bullet.y - 5 }))
        .filter(bullet => bullet.y > 0));

      // Move and handle bomb
      if (bomb && !bomb.exploded) {
        setBomb(prev => {
          if (!prev) return null;
          const newY = prev.y - BOMB_SPEED;
          if (newY <= 0) {
            // Bomb reached the top without exploding, remove it
            return null;
          }
          return { ...prev, y: newY };
        });
      }

      // Collision detection for bullets, bomb, and aliens
      setBullets(prev => {
        const remainingBullets = [...prev];
        setAliens(prevAliens => {
          let bombExploded = false;
          const remainingAliens = prevAliens.filter(alien => {
            const hitByBullet = remainingBullets.findIndex(bullet =>
              bullet.x >= alien.x &&
              bullet.x <= alien.x + ALIEN_WIDTH &&
              bullet.y >= alien.y &&
              bullet.y <= alien.y + ALIEN_HEIGHT
            );

            const hitByBomb = bomb && !bomb.exploded &&
              bomb.x >= alien.x && bomb.x <= alien.x + ALIEN_WIDTH &&
              bomb.y >= alien.y && bomb.y <= alien.y + ALIEN_HEIGHT;

            const inBombRadius = bomb && bomb.exploded &&
              Math.abs(bomb.x - (alien.x + ALIEN_WIDTH / 2)) <= BOMB_RADIUS + (Math.random() * 20 - 10) &&
              Math.abs(bomb.y - (alien.y + ALIEN_HEIGHT / 2)) <= BOMB_RADIUS + (Math.random() * 20 - 10);

            if (hitByBullet !== -1) {
              remainingBullets.splice(hitByBullet, 1);
              setScore(s => s + 10);
              return false;
            }

            if (hitByBomb) {
              bombExploded = true;
              setScore(s => s + 20);
              return false;
            }

            if (inBombRadius) {
              setScore(s => s + 20);
              return false;
            }

            return true;
          });

          if (bombExploded) {
            setBomb(prev => prev ? { ...prev, exploded: true } : null);
          }

          if (remainingAliens.length === 0) {
            setGameOver(true);
          }

          return remainingAliens;
        });
        return remainingBullets;
      });

      // Check for game over
      if (aliens.some(alien => alien.y + ALIEN_HEIGHT >= GAME_HEIGHT - PLAYER_HEIGHT)) {
        setGameOver(true);
      }

      // Handle bomb explosion animation
      if (bomb && bomb.exploded) {
        bombAnimation.start({
          scale: [0, 1, 0],
          opacity: [1, 1, 0],
          transition: { duration: 0.5 }
        }).then(() => {
          setBomb(null);
        });
      }
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [aliens, bullets, alienDirection, gameOver, bomb, bombAnimation]);

  const resetGame = () => {
    setPlayer({ x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2 });
    initializeAliens();
    setBullets([]);
    setBomb(null);
    setScore(0);
    setGameOver(false);
    setAlienDirection(1);
    setCanShoot(true);
    setCanBomb(true);
  };

  return (
    <div className="relative w-[600px] h-[400px] bg-black rounded-lg overflow-hidden">
      <div className="absolute top-0 left-0 right-0 bg-gray-800 bg-opacity-75 text-white text-center py-1 text-sm">
        Controls: ← → to move, D to shoot (1s cooldown), F for bomb (5s cooldown)
      </div>
      {aliens.map(alien => (
        <motion.div
          key={alien.id}
          className="absolute bg-green-500"
          style={{
            width: ALIEN_WIDTH,
            height: ALIEN_HEIGHT,
            x: alien.x,
            y: alien.y,
          }}
        />
      ))}
      {bullets.map(bullet => (
        <motion.div
          key={bullet.id}
          className="absolute bg-white rounded-full"
          style={{
            width: 4,
            height: 10,
            x: bullet.x - 2,
            y: bullet.y,
          }}
        />
      ))}
      {bomb && (
        <motion.div
          className={`absolute rounded-full ${bomb.exploded ? 'bg-red-500' : 'bg-yellow-500'}`}
          style={{
            width: bomb.exploded ? BOMB_RADIUS * 2 : 8,
            height: bomb.exploded ? BOMB_RADIUS * 2 : 8,
            x: bomb.exploded ? bomb.x - BOMB_RADIUS : bomb.x - 4,
            y: bomb.exploded ? bomb.y - BOMB_RADIUS : bomb.y - 4,
          }}
          animate={bomb.exploded ? bombAnimation : {}}
        />
      )}
      <motion.div
        className="absolute bg-blue-500"
        style={{
          width: PLAYER_WIDTH,
          height: PLAYER_HEIGHT,
          x: player.x,
          y: GAME_HEIGHT - PLAYER_HEIGHT,
        }}
        animate={playerControls}
      />
      <div className="absolute top-8 left-2 text-white text-xl">
        Score: {score}
      </div>
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white">
          <h2 className="text-3xl mb-4">Game Over</h2>
          <p className="text-xl mb-4">Final Score: {score}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={resetGame}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SpaceInvadersGame;