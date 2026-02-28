import { Obstacle } from './canvas-utils'

export interface ObstacleSpawner {
  lastSpawnTime: number
  spawnInterval: number
}

export interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  lane: number
  type: 'bot' | 'firewall' | 'datablock'
  color: string
}

const OBSTACLE_TYPES: Array<'bot' | 'firewall' | 'datablock'> = ['bot', 'firewall', 'datablock']
const LANE_POSITIONS = [75, 225, 375] // Center of each lane

export function createObstacleSpawner(spawnInterval: number = 1000): ObstacleSpawner {
  return {
    lastSpawnTime: Date.now(),
    spawnInterval,
  }
}

export function shouldSpawn(spawner: ObstacleSpawner, speed: number): boolean {
  const now = Date.now()
  const adjustedInterval = spawner.spawnInterval / (1 + speed / 10)
  
  if (now - spawner.lastSpawnTime > adjustedInterval) {
    spawner.lastSpawnTime = now
    return true
  }
  return false
}

export function createObstacle(canvasHeight: number, speed: number): Obstacle {
  const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)]
  const lane = Math.floor(Math.random() * 3)
  
  let width = 60
  let height = 40
  let color = '#FF00FF'
  
  if (type === 'bot') {
    width = 50
    height = 50
    color = '#FF00FF'
  } else if (type === 'firewall') {
    width = 80
    height = 30
    color = '#FF1493'
  } else if (type === 'datablock') {
    width = 40
    height = 60
    color = '#FF0080'
  }
  
  return {
    x: LANE_POSITIONS[lane] - width / 2,
    y: -height,
    width,
    height,
    lane,
    type,
    color,
  }
}

export function updateObstacles(obstacles: Obstacle[], speed: number) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].y += speed * 2
    
    // Remove obstacles that are off screen
    if (obstacles[i].y > 800) {
      obstacles.splice(i, 1)
    }
  }
}

export function findNearestObstacle(
  obstacles: Obstacle[],
  playerLane: number,
  playerY: number
): Obstacle | null {
  let nearest: Obstacle | null = null
  let minDistance = Infinity
  
  for (const obstacle of obstacles) {
    // Only consider obstacles in the player lane that are ahead
    if (obstacle.lane === playerLane && obstacle.y > playerY - 100) {
      const distance = Math.abs(obstacle.y - playerY)
      if (distance < minDistance) {
        minDistance = distance
        nearest = obstacle
      }
    }
  }
  
  return nearest
}

export function getNearestObstacleDistance(
  obstacles: Obstacle[],
  playerLane: number,
  playerY: number
): number {
  const nearest = findNearestObstacle(obstacles, playerLane, playerY)
  return nearest ? Math.abs(nearest.y - playerY) : Infinity
}
