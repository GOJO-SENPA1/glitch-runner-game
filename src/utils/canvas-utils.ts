export interface GameState {
  playerLane: number // 0=left, 1=center, 2=right
  playerY: number
  targetLane: number
  speed: number
  score: number
  corruption: number
  comboCount: number
  isGhostMode: boolean
  ghostModeEndTime: number
  gameRunning: boolean
  frameDrop: number
  shakeIntensity: number
  shakeTimeLeft: number
  slowMotionTimeLeft: number
  lastHackTime: number
  canHack: boolean
  characterUnlocked: boolean // Digital Kumari
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  isGhost: boolean,
  unlocked: boolean
) {
  ctx.save()
  
  if (isGhost) {
    ctx.globalAlpha = 0.4
  }
  
  if (unlocked) {
    // Digital Kumari - neon glitch aesthetic
    ctx.strokeStyle = '#00FFFF'
    ctx.fillStyle = '#FF00FF'
    ctx.lineWidth = 2
    
    // Head circle
    ctx.beginPath()
    ctx.arc(x, y - size * 0.3, size * 0.25, 0, Math.PI * 2)
    ctx.stroke()
    
    // Body
    ctx.beginPath()
    ctx.moveTo(x, y - size * 0.05)
    ctx.lineTo(x, y + size * 0.2)
    ctx.stroke()
    
    // Arms (more elaborate)
    ctx.beginPath()
    ctx.moveTo(x - size * 0.3, y)
    ctx.lineTo(x + size * 0.3, y)
    ctx.stroke()
    
    // Legs
    ctx.beginPath()
    ctx.moveTo(x - size * 0.15, y + size * 0.2)
    ctx.lineTo(x - size * 0.15, y + size * 0.45)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(x + size * 0.15, y + size * 0.2)
    ctx.lineTo(x + size * 0.15, y + size * 0.45)
    ctx.stroke()
  } else {
    // Standard cyan wireframe
    ctx.strokeStyle = '#00FFFF'
    ctx.lineWidth = 2.5
    
    // Head
    ctx.beginPath()
    ctx.arc(x, y - size * 0.3, size * 0.25, 0, Math.PI * 2)
    ctx.stroke()
    
    // Body
    ctx.beginPath()
    ctx.moveTo(x, y - size * 0.05)
    ctx.lineTo(x, y + size * 0.2)
    ctx.stroke()
    
    // Arms
    ctx.beginPath()
    ctx.moveTo(x - size * 0.25, y)
    ctx.lineTo(x + size * 0.25, y)
    ctx.stroke()
    
    // Legs
    ctx.beginPath()
    ctx.moveTo(x - size * 0.15, y + size * 0.2)
    ctx.lineTo(x - size * 0.15, y + size * 0.45)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(x + size * 0.15, y + size * 0.2)
    ctx.lineTo(x + size * 0.15, y + size * 0.45)
    ctx.stroke()
  }
  
  // Neon glow
  ctx.shadowColor = isGhost ? '#00FFFF' : '#FF00FF'
  ctx.shadowBlur = 15
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  
  ctx.restore()
}

export function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle
) {
  ctx.save()
  
  const alpha = particle.life / particle.maxLife
  ctx.globalAlpha = alpha
  ctx.fillStyle = particle.color
  
  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.restore()
}




