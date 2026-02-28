'use client';

interface HUDProps {
  score: number;
  corruption: number;
  speed: number;
  combo: number;
  unlockedKumari: boolean;
}

export default function HUD({ score, corruption, speed, combo, unlockedKumari }: HUDProps) {
  const corruptionPercent = Math.min(corruption * 100, 100);
  const isCritical = corruptionPercent > 75;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 font-mono">
      {/* Score - Top center */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div
          className="text-4xl font-bold text-cyan-400"
          style={{
            textShadow: '0 0 20px #00FFFF, 0 0 40px #00FFFF',
            letterSpacing: '2px',
          }}
        >
          SCORE: {score.toString().padStart(6, '0')}
        </div>
      </div>

      {/* Speed - Top right */}
      <div className="absolute top-8 right-8 text-cyan-400 text-lg" style={{ textShadow: '0 0 10px #00FFFF' }}>
        SPEED: {speed.toFixed(1)}x
      </div>

      {/* Corruption Meter - Right side */}
      <div className="absolute right-8 top-32 flex flex-col items-end gap-4">
        <div className="text-magenta-400 font-bold" style={{ textShadow: '0 0 10px #FF00FF' }}>
          CORRUPTION
        </div>

        {/* Vertical meter */}
        <div
          className="w-8 h-64 border-2 border-magenta-400 relative overflow-hidden"
          style={{
            boxShadow: isCritical ? '0 0 20px #FF0000, inset 0 0 10px rgba(255, 0, 0, 0.3)' : '0 0 10px #FF00FF',
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-150 w-full"
            style={{
              height: `${corruptionPercent}%`,
              backgroundColor: isCritical ? '#FF0000' : '#FF00FF',
              filter: 'drop-shadow(0 0 10px currentColor)',
              animation: isCritical ? 'pulse 0.5s infinite' : 'none',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,0,255,0.1) 8px, rgba(255,0,255,0.1) 16px)',
            }}
          />
        </div>

        <div className="text-sm text-magenta-400">{corruptionPercent.toFixed(0)}%</div>
      </div>

      {/* Combo indicator - Bottom center */}
      {combo > 1 && (
        <div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center"
          style={{
            animation: 'pulse 0.3s ease-in-out',
          }}
        >
          <div className="text-3xl font-bold text-green-300" style={{ textShadow: '0 0 20px #00FF41' }}>
            {combo}x COMBO
          </div>
          {combo >= 3 && <div className="text-lg text-green-300 mt-1">GHOST MODE ACTIVE</div>}
        </div>
      )}

      {/* Kumari unlock notification */}
      {unlockedKumari && (
        <div
          className="absolute top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 border-2 border-magenta-400 text-center animate-bounce"
          style={{
            textShadow: '0 0 10px #FF00FF',
            boxShadow: '0 0 20px #FF00FF',
          }}
        >
          <div className="text-magenta-400 font-bold">⭐ DIGITAL KUMARI UNLOCKED ⭐</div>
        </div>
      )}

      {/* Critical warning - Top left */}
      {isCritical && (
        <div className="absolute top-8 left-8">
          <div
            className="text-2xl font-bold text-red-500 animate-pulse"
            style={{
              textShadow: '0 0 20px #FF0000',
              letterSpacing: '1px',
            }}
          >
            ⚠ CRITICAL ⚠
          </div>
          <div className="text-sm text-red-400 mt-2">SYSTEM FAILURE IMMINENT</div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
