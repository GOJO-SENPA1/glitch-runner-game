'use client';

import { useEffect, useRef, useState } from 'react';

interface GestureState {
  handPosition: { x: number; y: number } | null;
  isFist: boolean;
  detected: boolean;
  videoReady: boolean;
}

interface GestureControlProps {
  onGesture: (gesture: GestureState) => void;
}

declare global {
  interface Window {
    Hands?: any;
    Camera?: any;
  }
}

export default function GestureControl({ onGesture }: GestureControlProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const positionHistoryRef = useRef<Array<{ x: number; y: number }>>([]);
  const lastHackTimeRef = useRef(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        console.log('[v0] Starting MediaPipe initialization...');
        
        // Load scripts from CDN
        await Promise.all([
          new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.1/drawing_utils.js';
            script.onload = () => {
              console.log('[v0] DrawingUtils loaded');
              resolve(null);
            };
            script.onerror = () => {
              console.log('[v0] DrawingUtils load failed (optional)');
              resolve(null); // Optional, doesn't fail initialization
            };
            document.body.appendChild(script);
          }),
          new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js';
            script.onload = () => {
              console.log('[v0] Camera utils loaded');
              resolve(null);
            };
            script.onerror = reject;
            document.body.appendChild(script);
          }),
          new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js';
            script.onload = () => {
              console.log('[v0] Hands model loaded');
              resolve(null);
            };
            script.onerror = reject;
            document.body.appendChild(script);
          }),
        ]);

        console.log('[v0] All scripts loaded, checking window objects...');
        if (!window.Hands || !window.Camera) {
          console.error('[v0] Missing window.Hands or window.Camera', { Hands: !!window.Hands, Camera: !!window.Camera });
          throw new Error('MediaPipe libraries failed to load');
        }

        const { Hands, Camera, DrawingUtils } = window;

        console.log('[v0] Initializing Hands model...');
        handsRef.current = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`,
        });

        handsRef.current.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        handsRef.current.onResults((results: any) => {
          const ctx = canvasRef.current?.getContext('2d');
          if (!ctx || !canvasRef.current) return;

          // Clear canvas
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Draw video
          if (results.image) {
            ctx.drawImage(results.image, 0, 0);
          }

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const wrist = landmarks[0];
            const handCenter = { x: wrist.x, y: wrist.y };

            // Add to history for smoothing
            positionHistoryRef.current.push(handCenter);
            if (positionHistoryRef.current.length > 5) {
              positionHistoryRef.current.shift();
            }

            // Calculate average position
            const avgPosition = {
              x: positionHistoryRef.current.reduce((sum, p) => sum + p.x, 0) / positionHistoryRef.current.length,
              y: positionHistoryRef.current.reduce((sum, p) => sum + p.y, 0) / positionHistoryRef.current.length,
            };

            // Detect fist (all fingertips below MCP joints)
            const fingertips = [4, 8, 12, 16, 20];
            const mcpJoints = [2, 6, 10, 14, 18];

            let isFist = true;
            for (let i = 0; i < fingertips.length; i++) {
              if (landmarks[fingertips[i]].y > landmarks[mcpJoints[i]].y) {
                isFist = false;
                break;
              }
            }

            // Draw hand skeleton
            ctx.strokeStyle = isFist ? '#FF00FF' : '#00FFFF';
            ctx.lineWidth = 2;

            // Draw connections
            const connections = [
              [0, 1], [1, 2], [2, 3], [3, 4],
              [5, 6], [6, 7], [7, 8],
              [9, 10], [10, 11], [11, 12],
              [13, 14], [14, 15], [15, 16],
              [17, 18], [18, 19], [19, 20],
              [0, 5], [5, 9], [9, 13], [13, 17],
            ];

            for (const [start, end] of connections) {
              const l1 = landmarks[start];
              const l2 = landmarks[end];
              ctx.beginPath();
              ctx.moveTo(l1.x * canvasRef.current.width, l1.y * canvasRef.current.height);
              ctx.lineTo(l2.x * canvasRef.current.width, l2.y * canvasRef.current.height);
              ctx.stroke();
            }

            // Draw joints
            for (const landmark of landmarks) {
              ctx.fillStyle = isFist ? '#FF00FF' : '#00FFFF';
              ctx.beginPath();
              ctx.arc(
                landmark.x * canvasRef.current.width,
                landmark.y * canvasRef.current.height,
                4,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }

            const now = Date.now();
            onGesture({
              handPosition: avgPosition,
              isFist: isFist && now - lastHackTimeRef.current > 300,
              detected: true,
              videoReady: true,
            });

            if (isFist) {
              lastHackTimeRef.current = now;
            }
          } else {
            onGesture({
              handPosition: null,
              isFist: false,
              detected: false,
              videoReady: true,
            });
          }
        });

        if (!videoRef.current) throw new Error('Video element not found');

        console.log('[v0] Creating Camera instance...');
        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 320,
          height: 240,
        });

        console.log('[v0] Initializing camera (this will request permissions)...');
        await cameraRef.current.initialize();
        console.log('[v0] Camera initialized successfully');
        
        console.log('[v0] Starting camera stream...');
        cameraRef.current.start();
        console.log('[v0] Camera stream started');
      } catch (err) {
        console.error('[v0] MediaPipe setup error:', err);
        console.error('[v0] Error type:', err instanceof Error ? err.message : String(err));
        setError('Camera access denied or MediaPipe failed to load. Using keyboard fallback.');
        onGesture({
          handPosition: null,
          isFist: false,
          detected: false,
          videoReady: false,
        });
      }
    };

    initMediaPipe();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [onGesture]);

  return (
    <div className="fixed bottom-4 left-4 z-10 bg-black border-2 border-cyan-400 rounded-lg overflow-hidden" style={{ width: '20vw', aspectRatio: '4/3' }}>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {error && (
        <div className="absolute inset-0 bg-black flex items-center justify-center text-xs text-red-400 p-2 text-center">
          <div>{error}</div>
        </div>
      )}
    </div>
  );
}
