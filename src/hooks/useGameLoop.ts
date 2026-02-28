import { useEffect, useRef, RefObject } from 'react'
import { GameState, Obstacle, Particle } from '@/utils/canvas-utils'
import { updateParticles, createTrail, createExplosion } from '@/utils/particles'
import { updateObstacles, createObstacle, shouldSpawn, getNearestObstacleDistance } from '@/utils/obstacles'
import { playHitSound, playDodgeSound } from '@/utils/audio'

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 800

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement>,
  gameState: React.MutableRefObject<GameState>,
  gestures: React.MutableRefObject<any>,
  onDeath: () => void
) {
  const rafIdRef = useRef<number | null>(null)
  const obstaclesRef = useRef<Obstacle[]>([])
  const particlesRef = useRef<Particle[]>([])
  const lastSpawnTimeRef = useRef<number>(Date.now())
  const ghostModeActivationTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

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

      // FPS tracking
      frameCount++
      if (now - fpsTime > 1000) {
        gameState.current.frameDrop = frameCount
        frameCount = 0
        fpsTime = now
      }

      const state = gameState.current

      // ===== UPDATE PHASE =====

      // Update shake and slow motion
      if (state.shakeTimeLeft > 0) {
        state.shakeTimeLeft -= deltaTime
      }
      if (state.slowMotionTimeLeft > 0) {
        state.slowMotionTimeLeft -= deltaTime
      }

      // Apply slow motion to delta time
      const slowMotionMultiplier = state.slowMotionTimeLeft > 0 ? 0.3 : 1
      const effectiveDelta = deltaTime * slowMotionMultiplier

      // Update speed (increase every 15 seconds)
      state.speed = Math.min(5 + (now / 1000 / 15) * 2, 10)

      // Update player lane smoothly
      state.playerLane = state.targetLane
      state.playerY = CANVAS_HEIGHT - 120

      // Update corruption (drain over time)
      const corrupted = state.corruption > 0 && state.corruption < 100
      if (corrupted) {
        state.corruption = Math.max(0, state.corruption - effectiveDelta * 5) // Drain 5% per second
      }

      // Update ghost mode
      if (state.isGhostMode && now > state.ghostModeEndTime) {
        state.isGhostMode = false
      }

      // Handle hack cooldown
      if (now - state.lastHackTime > 300) {
        state.canHack = true
      }

      // Hack detection from gestures
      if (gestures.current.isFist && state.canHack && state.gameRunning) {
        // Find nearest obstacle in current lane
        let nearestObstacle: Obstacle | null = null
        let minDistance = Infinity

        for (const obs of obstaclesRef.current) {
          if (obs.lane === state.playerLane && obs.y > state.playerY - 150) {
            const distance = Math.abs(obs.y - state.playerY)
            if (distance < minDistance) {
              minDistance = distance
              nearestObstacle = obs
            }
          }
        }

        if (nearestObstacle && minDistance < 120) {
          // Destroy obstacle
          const idx = obstaclesRef.current.indexOf(nearestObstacle)
          if (idx > -1) {
            obstaclesRef.current.splice(idx, 1)
          }

          state.corruption = Math.min(100, state.corruption + 20)
          state.canHack = false
          state.lastHackTime = now
          state.shakeIntensity = 8
          state.shakeTimeLeft = 0.2
          state.slowMotionTimeLeft = 0.5
          state.comboCount = 0 // Reset combo

          // Create particles
          particlesRef.current.push(...createExplosion(nearestObstacle.x + nearestObstacle.width / 2, nearestObstacle.y + nearestObstacle.height / 2, 50))

          playHackSound()
        }
      }

      // Spawn obstacles
      const now_ms = now
      if (now_ms - lastSpawnTimeRef.current > 1000 / (1 + state.speed / 5)) {
        obstaclesRef.current.push(createObstacle(CANVAS_HEIGHT, state.speed))
        lastSpawnTimeRef.current = now_ms
      }

      // Update obstacles
      updateObstacles(obstaclesRef.current, state.speed)

      // Collision detection
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i]

        // Simple collision - check if obstacle is in player lane and close to player Y
        if (obs.lane === state.playerLane && obs.y > state.playerY - 60 && obs.y < state.playerY + 60) {
          if (!state.isGhostMode) {
            // Hit!
            playHitSound()
            state.corruption = Math.min(100, state.corruption + 15)
            state.comboCount = 0
            state.shakeIntensity = 12
            state.shakeTimeLeft = 0.15

            obstaclesRef.current.splice(i, 1)
          }
        }
      }

      // Combo system - 3 consecutive dodges triggers ghost mode
      if (state.comboCount >= 3 && !state.isGhostMode) {
        state.isGhostMode = true
        state.ghostModeEndTime = now + 3000
        ghostModeActivationTimeRef.current = now
      }

      // Update corruption - game over at 100
      if (state.corruption >= 100) {
        state.gameRunning = false
        onDeath()
      }

      // Update particles
      updateParticles(particlesRef.current, effectiveDelta)

      // Add trail particles occasionally
      if (Math.random() < 0.3) {
        particlesRef.current.push(...createTrail(state.playerLane * 150 + 75, state.playerY, 0, 0, 2))
      }

      // ===== RENDER PHASE =====

      // Clear canvas with black
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Apply screen shake
      if (state.shakeTimeLeft > 0) {
        const offsetX = (Math.random() - 0.5) * state.shakeIntensity
        const offsetY = (Math.random() - 0.5) * state.shakeIntensity
        ctx.translate(offsetX, offsetY)
      }

      // Draw scanlines
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.02)'
      ctx.lineWidth = 1
      for (let y = 0; y < CANVAS_HEIGHT; y += 2) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(CANVAS_WIDTH, y)
        ctx.stroke()
      }

      // Draw lane indicators
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'
      ctx.lineWidth = 1
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

      // Draw player character
      const playerX = state.playerLane * 160 + 75
      
      ctx.strokeStyle = state.isGhostMode ? 'rgba(0, 255, 255, 0.5)' : '#00FFFF'
      ctx.globalAlpha = state.isGhostMode ? 0.5 : 1
      ctx.lineWidth = 2.5
      
      // Head
      ctx.beginPath()
      ctx.arc(playerX, state.playerY - 30, 15, 0, Math.PI * 2)
      ctx.stroke()
      
      // Body
      ctx.beginPath()
      ctx.moveTo(playerX, state.playerY - 15)
      ctx.lineTo(playerX, state.playerY + 15)
      ctx.stroke()
      
      // Arms
      ctx.beginPath()
      ctx.moveTo(playerX - 25, state.playerY - 5)
      ctx.lineTo(playerX + 25, state.playerY - 5)
      ctx.stroke()
      
      // Legs
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

      rafIdRef.current = requestAnimationFrame(gameLoop)
    }

    rafIdRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [onDeath])

  return { obstaclesRef, particlesRef }
}
