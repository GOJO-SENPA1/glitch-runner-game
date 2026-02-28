# GLITCH RUNNER - Cyberpunk Endless Runner

A browser-based cyberpunk endless runner game with hand gesture controls using MediaPipe Hands.

## 🎮 Gameplay

**Concept**: You are a rogue AI escaping deletion inside a corrupted server. Navigate through antivirus bots, firewalls, and data blocks while managing your corruption meter.

### Controls (Hand Gestures)
- **Move Hand RIGHT** → Dodge right
- **Move Hand LEFT** → Dodge left
- **Move Hand UP** → Jump
- **CLOSED FIST** → Hack nearest obstacle (increases corruption by 20%)

## 🎯 Game Mechanics

- **Endless Runner**: Character runs automatically, speed increases every 15 seconds
- **3 Lanes**: Navigate left, center, right lanes
- **Corruption Meter**: Fills with each hack, slowly drains when not hacking. Game over at 100%
- **Combo System**: 3 consecutive dodges without hacking = "GHOST MODE" (3 seconds invincibility)
- **Score**: Increases every second survived
- **Obstacles**: Antivirus bots, firewalls, data blocks spawn randomly

## 🌟 Features

### Visual Style
- **Neon Cyberpunk Aesthetic**: Electric cyan, hot magenta, neon green palette
- **CRT Scanlines**: Full-screen overlay with animated scanlines
- **Screen Flicker**: Subtle flickering effect for authenticity
- **Glitch Effects**: Chromatic aberration and digital distortion at high corruption
- **Particle System**: 50+ particles on obstacle destruction, character trails
- **Screen Shake**: Camera shake on obstacle hits

### Audio
- **Synthwave Beat**: Dynamic background music generated with Tone.js
- **Sound Effects**: Hack, jump, and death sounds
- **Dynamic Audio**: Audio reacts to gameplay events

### Special Features
- **Hand Gesture Tracking**: Real-time webcam tracking with hand skeleton overlay
- **Slow-Motion**: 0.5 second slow-mo effect when hacking
- **Screen Crack Visualization**: Cracks appear at 75%+ corruption
- **Digital Kumari Unlock**: Unlock special character skin by surviving 60 seconds
- **Terminal Death Sequence**: Fake system deletion screen with typing animation

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📋 Requirements

- **Camera Permission**: Required for hand gesture tracking
- **Modern Browser**: Chrome, Firefox, or Edge (requires WebGL)
- **Webcam**: For MediaPipe hand detection

## 🎨 Visual Effects

- **Neon Glow**: All text and UI elements use cyan/magenta glow effects
- **Bloom Effect**: Canvas-based glow on characters and obstacles
- **Chromatic Aberration**: Red/blue channel shift at high corruption
- **Screen Cracks**: SVG overlay that intensifies with corruption
- **Particle Explosions**: 50+ particle burst on obstacle destruction

## 🏗️ Technical Stack

- **React 19** with functional components and hooks
- **HTML5 Canvas** for game rendering (60 FPS)
- **MediaPipe Hands** for gesture detection
- **Tone.js** for procedural audio generation
- **CSS Animations** for visual effects and scanlines
- **TypeScript** for type safety

## 🎮 Gameplay Tips

1. **Manage Corruption**: Use hacks strategically—each hack raises corruption by 20%
2. **Build Combos**: Dodge obstacles without hacking to build your combo multiplier
3. **Ghost Mode**: Reach 3x combo for 3 seconds of invincibility
4. **Watch Your Position**: Hand position determines your lane (left/center/right)
5. **Time Your Jumps**: Jump early to clear obstacles

## 📊 Performance

- Optimized for 60 FPS on standard laptops
- RequestAnimationFrame-based game loop
- Efficient particle system with array splicing
- MediaPipe runs in separate effect to prevent blocking

## 🎯 File Structure

```
src/
├── components/
│   ├── Game.tsx           (Main game loop and canvas rendering)
│   ├── GestureControl.tsx (MediaPipe hand tracking)
│   ├── HUD.tsx            (Score, corruption, speed display)
│   ├── StartScreen.tsx    (Game start screen)
│   ├── DeathScreen.tsx    (Terminal deletion sequence)
│   └── ErrorBoundary.tsx  (Error handling)
├── utils/
│   ├── audio.ts           (Tone.js audio generation)
│   ├── particles.ts       (Particle system)
│   └── obstacles.ts       (Obstacle spawning and collision)
├── hooks/
│   ├── useGameLoop.ts     (RAF game loop hook)
│   └── useGestures.ts     (Gesture state management)
├── app/
│   ├── globals.css        (Cyberpunk theme and effects)
│   ├── layout.tsx         (Root layout)
│   └── page.tsx           (Main page)
└── README.md
```

## 🎨 Color Palette

- **Primary**: Electric Cyan (#00FFFF)
- **Secondary**: Hot Magenta (#FF00FF)
- **Accent**: Neon Green (#00FF41)
- **Background**: Pure Black (#000000)

## 🔧 Customization

Edit `globals.css` to customize:
- Scanline animation speed
- Glitch effect timing
- Neon glow intensity
- Screen flicker rate

Edit `components/Game.tsx` to adjust:
- Game difficulty
- Obstacle spawn rate
- Character speed progression
- Corruption decay rate

## 🐛 Troubleshooting

**Camera not working?**
- Ensure you've allowed camera permissions
- Check if your browser supports WebRTC
- The game will fall back to keyboard controls if MediaPipe fails

**Low FPS?**
- Close other browser tabs
- Reduce screen resolution
- Disable other extensions

**Audio not playing?**
- Ensure your browser allows audio (may need user interaction)
- Check volume settings

## 📜 License

Created for v0.app - Educational game project

## 🙏 Credits

- **MediaPipe**: Hand gesture detection
- **Tone.js**: Audio synthesis
- **React & Next.js**: Framework
- **Tailwind CSS**: Styling
