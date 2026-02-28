export interface Obstacle {
  x: number;
  y: number;
  lane: number;
  width: number;
  height: number;
  speed: number;
  type: 'bot' | 'firewall' | 'datablock';
  color: string;
}

export class ObstacleSpawner {
  obstacles: Obstacle[] = [];
  spawnCounter = 0;
  spawnRate = 80; // frames between spawns
  baseSpeed = 6;
  speedIncrease = 0.02;
  elapsedFrames = 0;

  constructor() {}

  update(canvasWidth: number, canvasHeight: number) {
    this.elapsedFrames++;
    const currentSpeed = this.baseSpeed + (this.elapsedFrames * this.speedIncrease) / 1000;

    this.spawnCounter++;
    if (this.spawnCounter > this.spawnRate) {
      this.spawnObstacle(canvasWidth, canvasHeight, currentSpeed);
      this.spawnCounter = 0;
      // Gradually increase difficulty
      if (this.spawnRate > 40) {
        this.spawnRate -= 0.1;
      }
    }

    // Move obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= currentSpeed;

      // Remove if off screen
      if (obs.x + obs.width < 0) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  private spawnObstacle(width: number, height: number, speed: number) {
    const lane = Math.floor(Math.random() * 3);
    const laneX = 100 + lane * (width / 3) + (width / 6 - 25);
    const type = this.getRandomType();

    const obstacle: Obstacle = {
      x: width,
      y: laneX,
      lane,
      width: 50,
      height: 40,
      speed,
      type,
      color: type === 'bot' ? '#FF00FF' : type === 'firewall' ? '#FF6600' : '#FFFF00',
    };

    this.obstacles.push(obstacle);
  }

  private getRandomType(): 'bot' | 'firewall' | 'datablock' {
    const rand = Math.random();
    if (rand < 0.5) return 'bot';
    if (rand < 0.8) return 'firewall';
    return 'datablock';
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const obs of this.obstacles) {
      ctx.save();
      ctx.shadowColor = obs.color;
      ctx.shadowBlur = 10;

      ctx.fillStyle = obs.color;
      ctx.globalAlpha = 0.8;

      if (obs.type === 'bot') {
        // Draw bot shape
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(obs.x + 5, obs.y + 5, obs.width - 10, obs.height - 10);
      } else if (obs.type === 'firewall') {
        // Draw firewall shape
        ctx.globalAlpha = 0.7;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeStyle = '#FF6600';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      } else {
        // Draw datablock
        ctx.globalAlpha = 0.8;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = '#FF00FF';
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(obs.x + i * 15, obs.y + 10, 10, 20);
        }
      }

      ctx.restore();
    }
  }

  clear() {
    this.obstacles = [];
    this.spawnCounter = 0;
    this.spawnRate = 80;
    this.elapsedFrames = 0;
  }
}
