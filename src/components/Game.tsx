'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { GameState, Particle } from '@/utils/canvas-utils'
import { createObstacle, updateObstacles, ObstacleSpawner, Obstacle } from '@/utils/obstacles'
import { createExplosion, createTrail, updateParticles } from '@/utils/particles'
import GestureControl from './GestureControl'
import StartScreen from './StartScreen'
import DeathScreen from './DeathScreen'
import HUD from './HUD'
import { initializeAudio, stopAudio, playHitSound, playHackSound } from '@/utils/audio'

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 800

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'start' | 'playing' | 'dead'>('start')
  const [handDetected, setHandDetected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setRenderTrigger] = useState(0)

  const gameStateRef = useRef<GameState>({
    playerLane: 1,
    playerY: CANVAS_HEIGHT - 120,
    targetLane: 1,
    speed: 3,
    score: 0,
    corruption: 0,
    comboCount: 0,
    isGhostMode: false,
    ghostModeEndTime: 0,
    gameRunning: false,
    frameDrop: 0,
    shakeIntensity: 0,
    shakeTimeLeft: 0,
    slowMotionTimeLeft: 0,
    lastHackTime: 0,
    canHack: true,
    characterUnlocked: false,
  })

  const gestureStateRef = useRef({
    handDetected: false,
    handX: 0.5,
    handY: 0.5,
    isFist: false,
    lane: 1,
  })

  const obstaclesRef = useRef<any[]>([])
  const particlesRef = useRef<any[]>([])
  const spawnerRef = useRef<ObstacleSpawner>({ lastSpawnTime: 0, spawnInterval: 1000 })
  const startTimeRef = useRef<number>(0)
  const rafIdRef = useRef<number | null>(null)

  const handleGameDeath = useCallback(() => {
    setGameState('dead')
    stopAudio()
  }, [])

  const handleGestureUpdate = (gesture: any) => {
    gestureStateRef.current = gesture
    setHandDetected(gesture.handDetected)

    if (gameState === 'start' && gesture.handDetected && !gesture.isFist) {
      startGame()
    }

    if (gameState === 'dead' && gesture.isFist) {
      restartGame()
    }
  }

  const startGame = async () => {
    await initializeAudio()

    gameStateRef.current = {
      playerLane: 1,
      playerY: CANVAS_HEIGHT - 120,
      targetLane: 1,
      speed: 3,
      score: 0,
      corruption: 0,
      comboCount: 0,
      isGhostMode: false,
      ghostModeEndTime: 0,
      gameRunning: true,
      frameDrop: 0,
      shakeIntensity: 0,
      shakeTimeLeft: 0,
      slowMotionTimeLeft: 0,
      lastHackTime: 0,
      canHack: true,
      characterUnlocked: false,
    }

    obstaclesRef.current = []
    particlesRef.current = []
    spawnerRef.current = { lastSpawnTime: Date.now(), spawnInterval: 1000 }
    startTimeRef.current = Date.now()

    setGameState('playing')
  }

  const restartGame = async () => {
    await startGame()
  }

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing' || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = Date.now()
    let frameCount = 0
    let fpsTime = Date.now()

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      frameCount++
      if (now - fpsTime > 1000) {
        gameStateRef.current.frameDrop = frameCount
        frameCount = 0
        fpsTime = now
      }

      const state = gameStateRef.current

      // Update state
      state.shakeTimeLeft = Math.max(0, state.shakeTimeLeft - deltaTime)
      state.slowMotionTimeLeft = Math.max(0, state.slowMotionTimeLeft - deltaTime)

      const slowMultiplier = state.slowMotionTimeLeft > 0 ? 0.3 : 1
      const effectiveDelta = deltaTime * slowMultiplier

      state.speed = Math.min(3 + (now - startTimeRef.current) / 1000 / 15 * 2, 10)

      state.playerLane = gestureStateRef.current.lane
      state.playerY = CANVAS_HEIGHT - 120

      if (state.corruption > 0) {
        state.corruption = Math.max(0, state.corruption - effectiveDelta * 5)
      }

      if (state.isGhostMode && now > state.ghostModeEndTime) {
        state.isGhostMode = false
      }

      if (now - state.lastHackTime > 300) {
        state.canHack = true
      }

      // Hack logic
      if (gestureStateRef.current.isFist && state.canHack && state.gameRunning) {
        let nearestObs: any = null
        let minDist = Infinity

        for (const obs of obstaclesRef.current) {
          if (obs.lane === state.playerLane && obs.y > state.playerY - 150) {
            const dist = Math.abs(obs.y - state.playerY)
            if (dist < minDist) {
              minDist = dist
              nearestObs = obs
            }
          }
        }

        if (nearestObs && minDist < 120) {
          const idx = obstaclesRef.current.indexOf(nearestObs)
          if (idx > -1) obstaclesRef.current.splice(idx, 1)

          state.corruption = Math.min(100, state.corruption + 20)
          state.canHack = false
          state.lastHackTime = now
          state.shakeIntensity = 8
          state.shakeTimeLeft = 0.2
          state.slowMotionTimeLeft = 0.5
          state.comboCount = 0

          particlesRef.current.push(...createExplosion(nearestObs.x + nearestObs.width / 2, nearestObs.y, 50))
          playHackSound()
        }
      }

      // Spawn obstacles
      if (now - spawnerRef.current.lastSpawnTime > 1000 / (1 + state.speed / 5)) {
        obstaclesRef.current.push(createObstacle(CANVAS_HEIGHT, state.speed))
        spawnerRef.current.lastSpawnTime = now
      }

      // Update obstacles
      updateObstacles(obstaclesRef.current, state.speed)

      // Collision detection
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i]
        if (obs.lane === state.playerLane && obs.y > state.playerY - 60 && obs.y < state.playerY + 60) {
          if (!state.isGhostMode) {
            playHitSound()
            state.corruption = Math.min(100, state.corruption + 15)
            state.comboCount = 0
            state.shakeIntensity = 12
            state.shakeTimeLeft = 0.15
          }
          obstaclesRef.current.splice(i, 1)
        }
      }

      if (state.comboCount >= 3 && !state.isGhostMode) {
        state.isGhostMode = true
        state.ghostModeEndTime = now + 3000
      }

      if (state.corruption >= 100) {
        state.gameRunning = false
        handleGameDeath()
      }

      updateParticles(particlesRef.current, effectiveDelta)
      if (Math.random() < 0.3) {
        particlesRef.current.push(...createTrail(state.playerLane * 160 + 75, state.playerY, 0, 0, 2))
      }

      state.score += (1 + state.comboCount * 0.5) * (state.speed / 3) * deltaTime

      // RENDERING
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      if (state.shakeTimeLeft > 0) {
        const offsetX = (Math.random() - 0.5) * state.shakeIntensity
        const offsetY = (Math.random() - 0.5) * state.shakeIntensity
        ctx.translate(offsetX, offsetY)
      }

      ctx.strokeStyle = 'rgba(0, 255, 255, 0.02)'
      ctx.lineWidth = 1
      for (let y = 0; y < CANVAS_HEIGHT; y += 2) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(CANVAS_WIDTH, y)
        ctx.stroke()
      }

      // Draw lane lines
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'
      ctx.setLineDash([5, 5])
      for (let i = 1; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(i * 160, 0)
        ctx.lineTo(i * 160, CANVAS_HEIGHT)
        ctx.stroke()
      }
      ctx.setLineDash([])

      // Draw obstacles
      for (const obs of obstaclesRef.current) {
        ctx.fillStyle = obs.color
        ctx.shadowColor = '#FF00FF'
        ctx.shadowBlur = 12
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
        ctx.strokeStyle = '#FF00FF'
        ctx.lineWidth = 2
        ctx.shadowColor = 'transparent'
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height)
      }
      ctx.shadowColor = 'transparent'

      // Draw particles
      for (const p of particlesRef.current) {
        const alpha = p.life / p.maxLife
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Draw player
      const playerX = state.playerLane * 160 + 75

      ctx.strokeStyle = state.isGhostMode ? 'rgba(0, 255, 255, 0.5)' : '#00FFFF'
      ctx.globalAlpha = state.isGhostMode ? 0.5 : 1
      ctx.lineWidth = 2.5

      ctx.beginPath()
      ctx.arc(playerX, state.playerY - 30, 15, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(playerX, state.playerY - 15)
      ctx.lineTo(playerX, state.playerY + 15)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(playerX - 25, state.playerY - 5)
      ctx.lineTo(playerX + 25, state.playerY - 5)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(playerX - 10, state.playerY + 15)
      ctx.lineTo(playerX - 10, state.playerY + 35)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(playerX + 10, state.playerY + 15)
      ctx.lineTo(playerX + 10, state.playerY + 35)
      ctx.stroke()

      ctx.globalAlpha = 1
      ctx.shadowColor = state.isGhostMode ? '#00FFFF' : '#FF00FF'
      ctx.shadowBlur = 15

      setRenderTrigger(prev => prev + 1)

      rafIdRef.current = requestAnimationFrame(gameLoop)
    }

    rafIdRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    }
  }, [gameState, handleGameDeath])

  return (
    <div className="game-container">
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="game-canvas" />

        <div className="scanlines" />

        {gameState === 'playing' && (
          <HUD
            score={gameStateRef.current.score}
            corruption={gameStateRef.current.corruption}
            speed={gameStateRef.current.speed}
            comboCount={gameStateRef.current.comboCount}
            isGhostMode={gameStateRef.current.isGhostMode}
            fps={gameStateRef.current.frameDrop}
          />
        )}

        {gameState === 'start' && <StartScreen onStart={startGame} handDetected={handDetected} />}

        {gameState === 'dead' && (
          <DeathScreen score={gameStateRef.current.score} onRestart={restartGame} handDetected={handDetected} />
        )}

        {error && (
          <div className="screen error-screen">
            <div className="error-title">⚠️ ERROR</div>
            <div className="error-message">{error}</div>
            <div className="error-instruction">Using keyboard controls (Arrow keys + Space)</div>
          </div>
        )}
      </div>

      <GestureControl onGestureUpdate={handleGestureUpdate} onError={(err) => setError(err)} />
    </div>
  )
}
