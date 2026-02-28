'use client'

import React, { useRef, useEffect } from 'react'
import { useGestures } from '@/hooks/useGestures'

interface GestureControlProps {
  onGestureUpdate: (gesture: any) => void
  onError: (error: string) => void
}

export default function GestureControl({ onGestureUpdate, onError }: GestureControlProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const gestureRef = useGestures(videoRef, onGestureUpdate, onError)

  // Keyboard fallback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onGestureUpdate({
          handDetected: true,
          handX: 0.15,
          handY: 0.5,
          isFist: false,
          lane: 0,
        })
      } else if (e.key === 'ArrowRight') {
        onGestureUpdate({
          handDetected: true,
          handX: 0.85,
          handY: 0.5,
          isFist: false,
          lane: 2,
        })
      } else if (e.key === 'ArrowUp') {
        onGestureUpdate({
          handDetected: true,
          handX: 0.5,
          handY: 0.5,
          isFist: false,
          lane: 1,
        })
      } else if (e.code === 'Space') {
        onGestureUpdate({
          ...gestureRef.current,
          isFist: true,
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onGestureUpdate])

  return (
    <video
      ref={videoRef}
      className="webcam-feed"
      autoPlay
      playsInline
      style={{ display: 'none' }}
    />
  )
}
