'use client';

import { useEffect, useState } from 'react';

interface DeathScreenProps {
  score: number;
  onRestart: () => void;
}

export default function DeathScreen({ score, onRestart }: DeathScreenProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [showScore, setShowScore] = useState(false);
  const [screenOff, setScreenOff] = useState(false);

  const terminalLines = [
    '> SCANNING ROGUE PROCESS...',
    '> IDENTIFIED: AI_UNIT_07',
    '> INITIATING DELETION...',
    '> MEMORY WIPED.',
    '> GOODBYE.',
  ];

  useEffect(() => {
    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let currentLine = '';

    const typeCharacter = () => {
      if (currentLineIndex < terminalLines.length) {
        const line = terminalLines[currentLineIndex];
        if (currentCharIndex < line.length) {
          currentLine += line[currentCharIndex];
          setLines([...lines.slice(0, currentLineIndex), currentLine]);
          currentCharIndex++;
          setTimeout(typeCharacter, 50);
        } else {
          currentLineIndex++;
          currentCharIndex = 0;
          currentLine = '';
          setTimeout(typeCharacter, 400);
        }
      } else {
        // All lines typed, wait then show score
        setTimeout(() => {
          setShowScore(true);
          setTimeout(() => {
            setScreenOff(true);
          }, 2000);
        }, 2000);
      }
    };

    const timer = setTimeout(typeCharacter, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center font-mono transition-all duration-500"
      style={{
        clipPath: screenOff ? 'inset(50% 0 50% 0)' : 'inset(0 0 0 0)',
      }}
    >
      {/* Terminal output */}
      <div className="text-green-400 text-lg leading-relaxed text-center mb-20">
        {lines.map((line, i) => (
          <div
            key={i}
            className="mb-2"
            style={{
              textShadow: '0 0 10px #00FF41',
            }}
          >
            {line}
            {i === lines.length - 1 && lines.length < terminalLines.length && (
              <span className="animate-pulse">_</span>
            )}
          </div>
        ))}
      </div>

      {/* Final score - fade in */}
      {showScore && (
        <div
          className="text-center animate-in fade-in duration-500"
          style={{
            animation: 'fadeIn 1s ease-in-out forwards',
          }}
        >
          <div className="text-5xl font-bold text-magenta-400 mb-6" style={{ textShadow: '0 0 30px #FF00FF' }}>
            {score.toString().padStart(6, '0')}
          </div>
          <div className="text-cyan-400 text-2xl mb-8" style={{ textShadow: '0 0 20px #00FFFF' }}>
            FINAL SCORE
          </div>

          <button
            onClick={onRestart}
            className="px-12 py-4 border-2 border-magenta-400 text-magenta-400 font-bold text-lg hover:bg-magenta-400 hover:text-black transition-all mt-8"
            style={{
              boxShadow: '0 0 20px #FF00FF',
            }}
          >
            RAISE FIST TO RESTART
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
