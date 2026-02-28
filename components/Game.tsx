'use client';

import { useEffect, useRef, useState } from 'react';
import { ParticleSystem } from '@/utils/particles';
import { ObstacleSpawner, Obstacle } from '@/utils/obstacles';
import { playBackgroundBeat, playHackSound, playJumpSound, playDeathSound, initAudio } from '@/utils/audio';
import HUD from './HUD';
import StartScreen from './StartScreen';
import DeathScreen from './DeathScreen';
import GestureControl from './GestureControl';

interface GameState {
  charX: number;
  charY: number;
  lane: number;
  jumping: boolean;
  jumpPower: number;
  score: number;
  corruption: number;
  speed: number;
  isGameOver: boolean;
  gameStarted: boolean;
  combo: number;
  dodgeCount: number;
  unlockedKumari: boolean;
  isGhost: boolean;
  ghostTime: number;
  screenShake: number;
  slowMoTime: number;
}

const LANE_WIDTH = 120;
const LANE_COUNT = 3;
const GRAVITY = 0.6;
const JUMP_POWER = 15;

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    charX: 80,
    charY: 300,
    lane: 1,
    jumping: false,
    jumpPower: 0,
    score: 0,
    corruption: 0,
    speed: 1,
    isGameOver: false,
    gameStarted: false,
    combo: 0,
    dodgeCount: 0,
    unlockedKumari: false,
    isGhost: false,
    ghostTime: 0,
    screenShake: 0,
    slowMoTime: 0,
  });

  const particlesRef = useRef(new ParticleSystem());
  const obstaclesRef = useRef(new ObstacleSpawner());
  const gestureStateRef = useRef({ handPosition: null, isFist: false, detected: false, videoReady: false });
  const [hudState, setHudState] = useState(gameStateRef.current);
  const [handDetected, setHandDetected] = useState(false);
  const beatCounterRef = useRef(0);
  const lastHackTimeRef = useRef(0);

  const getLaneX = (lane: number) => 100 + lane * LANE_WIDTH + LANE_WIDTH / 2;

  const changeX = (newLane: number) => {
    const state = gameStateRef.current;
    if (newLane !== state.lane && newLane >= 0 && newLane < LANE_COUNT) {
      state.lane = newLane;
    }
  };

  const handleGesture = (gesture: any) => {
    gestureStateRef.current = gesture;
    setHandDetected(gesture.detected);

    if (!gameStateRef.current.gameStarted || gameStateRef.current.isGameOver) {
      return;
    }

    if (gesture.handPosition) {
      const normalizedX = gesture.handPosition.x;

      if (normalizedX < 0.33) {
        changeX(0);
      } else if (normalizedX > 0.66) {
        changeX(2);
      } else {
        changeX(1);
      }

      if (gesture.handPosition.y < 0.35) {
        const state = gameStateRef.current;
        if (!state.jumping) {
          state.jumping = true;
          state.jumpPower = JUMP_POWER;
          playJumpSound();
        }
      }

      const now = Date.now();
      if (gesture.isFist && now - lastHackTimeRef.current > 300) {
        hackNearestObstacle();
        lastHackTimeRef.current = now;
      }
    }
  };

  const hackNearestObstacle = () => {
    const state = gameStateRef.current;
    const obstacles = obstaclesRef.current.obstacles;

    if (obstacles.length === 0) return;

    let nearest: Obstacle | null = null;
    let nearestDist = Infinity;

    for (const obs of obstacles) {
      const dist = Math.hypot(obs.x - state.charX, obs.y - (state.charY + 20) - 100);
      if (dist < nearestDist && dist < 150) {
        nearestDist = dist;
        nearest = obs;
      }
    }

    if (nearest) {
      const idx = obstacles.indexOf(nearest);
      if (idx >= 0) {
        obstacles.splice(idx, 1);
        playHackSound();
        particlesRef.current.addExplosion(nearest.x, nearest.y - 100, 50, nearest.color);

        state.corruption = Math.min(state.corruption + 0.2, 1);
        state.score += 100;
        state.slowMoTime = 30;

        // Screen flash
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
      }
    }
  };

  const startGame = async () => {
    await initAudio();
    const state = gameStateRef.current;
    state.gameStarted = true;
    state.isGameOver = false;
    state.score = 0;
    state.corruption = 0;
    state.speed = 1;
    state.combo = 0;
    state.dodgeCount = 0;
    state.unlockedKumari = false;
    state.isGhost = false;
    state.ghostTime = 0;
    state.charX = 80;
    state.charY = 300;
    state.lane = 1;
    state.jumping = false;
    state.jumpPower = 0;
    particlesRef.current.clear();
    obstaclesRef.current.clear();
  };

  const restartGame = () => {
    startGame();
  };

  useEffect(() => {
    const initGame = async () => {
      await initAudio();
    };
    initGame();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let frameCount = 0;

    const gameLoop = () => {
      const state = gameStateRef.current;

      if (state.gameStarted && !state.isGameOver) {
        // Update game logic
        frameCount++;

        // Handle slow motion
        let timeScale = 1;
        if (state.slowMoTime > 0) {
          timeScale = 0.3;
          state.slowMoTime--;
        }

        // Update obstacles
        obstaclesRef.current.update(canvas.width, canvas.height);
        const baseSpeed = 6 + (frameCount * 0.0005) * timeScale;
        state.speed = baseSpeed / 6;

        // Update particles
        particlesRef.current.update(frameCount);

        // Update character jumping
        if (state.jumping) {
          state.jumpPower -= GRAVITY;
          state.charY -= state.jumpPower;

          if (state.charY >= 300) {
            state.charY = 300;
            state.jumping = false;
          }
        }

        // Lerp character X to target lane
        const targetX = getLaneX(state.lane);
        state.charX += (targetX - state.charX) * 0.15;

        // Check collisions
        const charRadius = 15;
        for (let i = obstaclesRef.current.obstacles.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current.obstacles[i];
          const dist = Math.hypot(obs.x + obs.width / 2 - state.charX, obs.y - 100 - (state.charY - 20));

          if (dist < charRadius + 30) {
            if (!state.isGhost) {
              state.isGameOver = true;
              playDeathSound();
            } else {
              // Remove obstacle without penalty in ghost mode
              obstaclesRef.current.obstacles.splice(i, 1);
            }
          }
        }

        // Dodge tracking
        if (frameCount % 10 === 0) {
          state.dodgeCount++;
          if (state.dodgeCount >= 30) {
            state.dodgeCount = 0;
            state.combo++;

            if (state.combo === 3 && !state.isGhost) {
              state.isGhost = true;
              state.ghostTime = 180; // 3 seconds at 60fps
            }
          }
        }

        // Update ghost mode
        if (state.isGhost && state.ghostTime > 0) {
          state.ghostTime--;
          if (state.ghostTime === 0) {
            state.isGhost = false;
            state.combo = 0;
          }
        }

        // Corruption decay
        state.corruption = Math.max(state.corruption - 0.0005, 0);

        // Update screen shake
        if (state.screenShake > 0) {
          state.screenShake--;
        }

        // Beat generation
        beatCounterRef.current++;
        if (beatCounterRef.current > (120 / state.speed) * 0.5) {
          playBackgroundBeat();
          beatCounterRef.current = 0;
        }

        // Kumari unlock check
        if (!state.unlockedKumari && frameCount > 3600) {
          state.unlockedKumari = true;
        }

        // Check game over (corruption at 100%)
        if (state.corruption >= 1) {
          state.isGameOver = true;
          playDeathSound();
        }

        // Increase score over time
        state.score += Math.floor(state.speed);
      }

      // Draw game
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (state.gameStarted && !state.isGameOver) {
        // Apply screen shake
        if (state.screenShake > 0) {
          ctx.save();
          ctx.translate(
            (Math.random() - 0.5) * state.screenShake * 0.5,
            (Math.random() - 0.5) * state.screenShake * 0.5
          );
        }

        // Draw lanes
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 1; i < LANE_COUNT; i++) {
          const x = getLaneX(i) + LANE_WIDTH / 2;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Draw character
        ctx.save();
        if (state.isGhost) {
          ctx.globalAlpha = 0.4;
        }

        ctx.fillStyle = '#00FFFF';
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 15;

        // Wireframe humanoid
        const charSize = 20;
        ctx.beginPath();
        ctx.arc(state.charX, state.charY - charSize, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(state.charX, state.charY - charSize + 8);
        ctx.lineTo(state.charX, state.charY + 5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(state.charX - 12, state.charY - 5);
        ctx.lineTo(state.charX + 12, state.charY - 5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(state.charX, state.charY + 5);
        ctx.lineTo(state.charX - 8, state.charY + 15);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(state.charX, state.charY + 5);
        ctx.lineTo(state.charX + 8, state.charY + 15);
        ctx.stroke();

        // Trail particles
        if (frameCount % 3 === 0) {
          particlesRef.current.addTrail(state.charX, state.charY, 2, '#00FFFF');
        }

        ctx.restore();

        // Draw obstacles
        obstaclesRef.current.draw(ctx);

        // Draw particles
        particlesRef.current.draw(ctx);

        // Draw corruption cracks at 75%+
        if (state.corruption > 0.75) {
          ctx.strokeStyle = `rgba(255, 0, 0, ${(state.corruption - 0.75) * 4})`;
          ctx.lineWidth = 2;
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(
              canvas.width / 2 + Math.sin(frameCount * 0.1 + i) * 50,
              canvas.height / 2
            );
            ctx.stroke();
          }
        }

        if (state.screenShake > 0) {
          ctx.restore();
        }
      }

      setHudState({ ...state });
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationId);
  }, []);

  const state = gameStateRef.current;

  return (
    <div className="game-wrapper">
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {state.gameStarted && !state.isGameOver && (
        <HUD
          score={hudState.score}
          corruption={hudState.corruption}
          speed={hudState.speed}
          combo={hudState.combo}
          unlockedKumari={hudState.unlockedKumari}
        />
      )}

      {!state.gameStarted && !state.isGameOver && (
        <StartScreen onStart={startGame} handDetected={handDetected} />
      )}

      {state.isGameOver && (
        <DeathScreen score={hudState.score} onRestart={restartGame} />
      )}

      {/* GestureControl always mounted to allow early camera access */}
      <GestureControl onGesture={handleGesture} />
    </div>
  );
}
