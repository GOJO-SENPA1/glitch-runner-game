import { Particle } from './canvas-utils'

export type { Particle }

export function createExplosion(
  x: number,
  y: number,
  count: number = 50
): Particle[] {
  const particles: Particle[] = []
  const colors = ['#00FFFF', '#FF00FF', '#00FF41']
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const speed = 2 + Math.random() * 4
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    })
  }
  
  return particles
}

export function createTrail(
  x: number,
  y: number,
  vx: number,
  vy: number,
  count: number = 3
): Particle[] {
  const particles: Particle[] = []
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + Math.random() * 10 - 5,
      y: y + Math.random() * 10 - 5,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      life: 1,
      maxLife: 1,
      size: 1 + Math.random() * 2,
      color: '#00FFFF',
    })
  }
  
  return particles
}

export function updateParticles(particles: Particle[], deltaTime: number = 0.016) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.1 // gravity
    p.life -= deltaTime / p.maxLife
    
    if (p.life <= 0) {
      particles.splice(i, 1)
    }
  }
}

export function createMultiplierText(
  x: number,
  y: number,
  multiplier: number
): Particle[] {
  return [{
    x,
    y,
    vx: 0,
    vy: -1,
    life: 1,
    maxLife: 1,
    size: multiplier, // Abuse size to store multiplier value
    color: '#00FF41',
  }]
}
