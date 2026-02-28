'use client'

import React, { useEffect, useRef, useState } from 'react'

interface StartScreenProps {
  onStart: () => void
  handDetected: boolean
}

export default function StartScreen({ onStart, handDetected }: StartScreenProps) {
  const [glitchActive, setGlitchActive] = useState(false)
  const binaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Random glitch trigger
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 150)
      }
    }, Math.random() * 3000 + 2000)

    return () => clearInterval(glitchInterval)
  }, [])

  useEffect(() => {
    // Generate falling binary code
    if (!binaryRef.current) return

    const generateBinary = () => {
      const char = Math.random() > 0.5 ? '0' : '1'
      const span = document.createElement('span')
      span.className = 'binary-char'
      span.textContent = char

      const left = Math.random() * 100
      const delay = Math.random() * 2
      const duration = Math.random() * 3 + 4

      span.style.left = left + '%'
      span.style.animationDelay = delay + 's'
      span.style.animationDuration = duration + 's'

      binaryRef.current?.appendChild(span)

      setTimeout(() => {
        span.remove()
      }, (duration + delay) * 1000)
    }

    const binaryInterval = setInterval(generateBinary, 100)
    return () => clearInterval(binaryInterval)
  }, [])

  return (
    <div className="screen start-screen">
      <div className="binary-code" ref={binaryRef} />

      <div className={`title neon-text ${glitchActive ? 'glitch' : ''}`}>
        GLITCH RUNNER
      </div>

      <div className="subtitle neon-text-accent">
        Escape deletion inside a corrupted server
      </div>

      <div style={{ marginTop: '60px', textAlign: 'center' }}>
        <div className={`neon-text ${handDetected ? '' : ''}`} style={{ marginBottom: '20px' }}>
          {handDetected ? '✓ HAND DETECTED' : 'Initializing...'}
        </div>

        <div className="neon-text-accent" style={{ fontSize: '18px', marginTop: '40px' }}>
          RAISE YOUR HAND TO BEGIN
        </div>

        <div className="neon-text" style={{ fontSize: '12px', marginTop: '60px', opacity: 0.6 }}>
          Use gestures to move between lanes
        </div>
        <div className="neon-text" style={{ fontSize: '12px', opacity: 0.6 }}>
          Close your fist to destroy obstacles
        </div>
      </div>
    </div>
  )
}
