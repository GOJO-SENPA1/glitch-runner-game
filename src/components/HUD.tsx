'use client'

import React, { useEffect, useState } from 'react'

interface HUDProps {
  score: number
  corruption: number
  speed: number
  comboCount: number
  isGhostMode: boolean
  fps: number
}

export default function HUD({
  score,
  corruption,
  speed,
  comboCount,
  isGhostMode,
  fps,
}: HUDProps) {
  const [showCombo, setShowCombo] = useState(false)
  const [comboKey, setComboKey] = useState(0)

  useEffect(() => {
    if (comboCount >= 3 && comboCount % 3 === 0) {
      setShowCombo(true)
      setComboKey(prev => prev + 1)
      setTimeout(() => setShowCombo(false), 1000)
    }
  }, [comboCount])

  return (
    <div className="hud">
      {/* Score Display */}
      <div className="score-display">
        SCORE: {Math.floor(score)}
      </div>

      {/* Speed Display */}
      <div className="speed-display">
        SPD: {speed.toFixed(1)}
      </div>

      {/* Corruption Meter */}
      <div className="corruption-display">
        <div className="corruption-label">CORRUPTION</div>
        <div className="corruption-bar neon-border-secondary">
          <div
            className="corruption-fill"
            style={{
              height: `${Math.min(corruption, 100)}%`,
            }}
          />
        </div>
        <div className="corruption-label" style={{ marginTop: '5px' }}>
          {Math.floor(corruption)}%
        </div>
      </div>

      {/* Combo Display */}
      {showCombo && comboCount >= 3 && (
        <div key={comboKey} className="combo-display active">
          +{comboCount}x COMBO
        </div>
      )}

      {/* Ghost Mode Indicator */}
      {isGhostMode && (
        <div className="ghost-indicator">
          ◆ GHOST MODE ◆
        </div>
      )}
    </div>
  )
}
