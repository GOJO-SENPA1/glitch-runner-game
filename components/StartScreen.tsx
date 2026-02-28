'use client';

import { useEffect, useState } from 'react';

interface StartScreenProps {
  onStart: () => void;
  handDetected: boolean;
}

export default function StartScreen({ onStart, handDetected }: StartScreenProps) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Binary rain background */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-cyan-300 font-mono text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              animation: `binaryFall ${3 + Math.random() * 2}s linear infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>

      {/* Main title */}
      <div className="z-10 text-center">
        <h1
          className={`text-7xl font-mono font-bold mb-8 transition-all duration-100 ${
            glitch ? 'text-magenta-500' : 'text-cyan-400'
          }`}
          style={{
            textShadow: glitch
              ? '2px 2px 0 #FF00FF, -2px -2px 0 #00FF41, 0 0 20px #00FFFF'
              : '0 0 20px #00FFFF, 0 0 40px #00FFFF',
          }}
          data-glitch="GLITCH RUNNER"
        >
          GLITCH RUNNER
        </h1>

        <p className="text-lg font-mono text-green-300 mb-12 animate-pulse">
          ESCAPE THE DELETION SEQUENCE
        </p>

        {/* Hand detection status */}
        <div
          className={`mb-12 p-4 border-2 font-mono text-lg transition-all ${
            handDetected
              ? 'border-green-400 text-green-400 shadow-lg'
              : 'border-cyan-400 text-cyan-400'
          }`}
          style={{
            boxShadow: handDetected ? '0 0 20px #00FF41' : '0 0 10px #00FFFF',
          }}
        >
          {handDetected ? (
            <>
              <div>✓ HAND DETECTED</div>
              <div className="text-sm mt-2">WEBCAM ACTIVE</div>
            </>
          ) : (
            <>
              <div>⚠ WAITING FOR HAND...</div>
              <div className="text-sm mt-2">ALLOW CAMERA ACCESS</div>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="mb-12 text-cyan-300 font-mono text-sm leading-relaxed">
          <p className="mb-4">→ MOVE HAND RIGHT/LEFT: DODGE</p>
          <p className="mb-4">→ MOVE HAND UP: JUMP</p>
          <p className="mb-4">→ CLOSED FIST: HACK OBSTACLES</p>
          <p className="text-magenta-400 font-bold text-xl mt-8 animate-pulse">
            RAISE YOUR HAND TO BEGIN
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={!handDetected}
          className="mt-8 px-12 py-4 border-2 border-cyan-400 text-cyan-400 font-mono font-bold text-lg hover:bg-cyan-400 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            boxShadow: handDetected ? '0 0 20px #00FFFF' : 'none',
          }}
        >
          START GAME
        </button>
      </div>
    </div>
  );
}
