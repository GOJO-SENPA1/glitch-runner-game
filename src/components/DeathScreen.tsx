'use client'

import React, { useEffect, useState } from 'react'

interface DeathScreenProps {
  score: number
  onRestart: () => void
  handDetected: boolean
}

export default function DeathScreen({ score, onRestart, handDetected }: DeathScreenProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [showScore, setShowScore] = useState(false)
  const [crtOff, setCrtOff] = useState(false)

  useEffect(() => {
    const lines = [
      '> SCANNING ROGUE PROCESS...',
      '> IDENTIFIED: AI_UNIT_07',
      '> INITIATING DELETION...',
      '> MEMORY WIPED.',
      '> GOODBYE.',
    ]

    let currentLineIndex = 0
    let currentCharIndex = 0
    let currentDisplayed = ''

    const typeInterval = setInterval(() => {
      if (currentLineIndex < lines.length) {
        const currentLine = lines[currentLineIndex]

        if (currentCharIndex < currentLine.length) {
          currentDisplayed += currentLine[currentCharIndex]
          currentCharIndex++

          setDisplayedLines([...displayedLines.slice(0, currentLineIndex), currentDisplayed])
        } else {
          // Line complete, move to next
          currentLineIndex++
          currentCharIndex = 0
          currentDisplayed = ''

          if (currentLineIndex < lines.length) {
            setDisplayedLines([...lines.slice(0, currentLineIndex)])
          }
        }
      } else {
        clearInterval(typeInterval)

        // After all lines done, show score
        setTimeout(() => {
          setShowScore(true)
        }, 2000)

        setTimeout(() => {
          setCrtOff(true)
        }, 3000)
      }
    }, 50)

    return () => clearInterval(typeInterval)
  }, [])

  return (
    <div className={`screen death-screen ${crtOff ? 'crt-off' : ''}`}>
      <div className="terminal-line">
        {displayedLines.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>

      {showScore && (
        <div className="final-score neon-text-accent">
          FINAL SCORE: {Math.floor(score)}
        </div>
      )}

      {handDetected && (
        <div className="neon-text" style={{ marginTop: '60px', fontSize: '12px', opacity: 0.7 }}>
          RAISE FIST TO RESTART
        </div>
      )}
    </div>
  )
}
