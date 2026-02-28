import { useEffect, useRef, RefObject } from 'react'
import { processHand, smoothGesture, detectLaneFromHand, ProcessedGesture } from '@/utils/gestures'

export interface GestureState {
  handDetected: boolean
  handX: number
  handY: number
  isFist: boolean
  lane: number
}

export function useGestures(
  videoRef: RefObject<HTMLVideoElement>,
  onGestureUpdate: (gesture: GestureState) => void,
  onError: (error: string) => void
) {
  const gestureStateRef = useRef<GestureState>({
    handDetected: false,
    handX: 0.5,
    handY: 0.5,
    isFist: false,
    lane: 1,
  })

  const previousGestureRef = useRef<ProcessedGesture | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const detectLoopRef = useRef<number | null>(null)

  useEffect(() => {
    // Load MediaPipe from CDN
    const script1 = document.createElement('script')
    script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js'
    
    const script2 = document.createElement('script')
    script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js'

    Promise.all([
      new Promise((resolve) => {
        script1.onload = resolve
        document.body.appendChild(script1)
      }),
      new Promise((resolve) => {
        script2.onload = resolve
        document.body.appendChild(script2)
      }),
    ]).then(() => {
      initializeMediaPipe()
    }).catch((err) => {
      console.error('[v0] MediaPipe load error:', err)
      onError('MediaPipe failed to load - using keyboard controls')
    })

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (detectLoopRef.current) {
        cancelAnimationFrame(detectLoopRef.current)
      }
    }
  }, [onError])

  const initializeMediaPipe = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 640, facingMode: 'user' },
        audio: false,
      })

      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Initialize MediaPipe Hands
      const HandsModule = (window as any).Hands
      if (!HandsModule) {
        console.error('[v0] MediaPipe Hands not loaded')
        return
      }

      const hands = new HandsModule.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
        }
      })

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      const frameHistory = useRef<ProcessedGesture[]>([])

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const hand = {
            landmarks: results.multiHandLandmarks[0],
            handedness: results.multiHandedness[0].label,
          }

          const processed = processHand(hand, 480, 640)
          frameHistory.current.push(processed)

          // Keep rolling average of last 5 frames
          if (frameHistory.current.length > 5) {
            frameHistory.current.shift()
          }

          // Average the frames
          const avgGesture: ProcessedGesture = {
            handDetected: true,
            handX: frameHistory.current.reduce((sum, g) => sum + g.handX, 0) / frameHistory.current.length,
            handY: frameHistory.current.reduce((sum, g) => sum + g.handY, 0) / frameHistory.current.length,
            isFist: frameHistory.current[frameHistory.current.length - 1].isFist,
            confidence: frameHistory.current[frameHistory.current.length - 1].confidence,
          }

          // Smooth the gesture
          const smoothed = smoothGesture(avgGesture, previousGestureRef.current, 0.7)
          previousGestureRef.current = smoothed

          const lane = detectLaneFromHand(smoothed.handX)

          gestureStateRef.current = {
            handDetected: true,
            handX: smoothed.handX,
            handY: smoothed.handY,
            isFist: smoothed.isFist,
            lane,
          }

          onGestureUpdate(gestureStateRef.current)
        } else {
          gestureStateRef.current.handDetected = false
        }
      })

      const CameraModule = (window as any).Camera
      if (!CameraModule) {
        console.error('[v0] MediaPipe Camera not loaded')
        return
      }

      const camera = new CameraModule.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current })
        },
        width: 480,
        height: 640,
      })

      camera.start()
    } catch (err: any) {
      console.error('[v0] Camera access denied:', err)
      onError('Camera access denied - using keyboard controls')
    }
  }

  return gestureStateRef
}
