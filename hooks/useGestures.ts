import { useState, useRef, useCallback } from 'react';

export interface GestureState {
  handPosition: { x: number; y: number } | null;
  isFist: boolean;
  detected: boolean;
}

export function useGestures(onGestureChange?: (gesture: GestureState) => void) {
  const [gesture, setGesture] = useState<GestureState>({
    handPosition: null,
    isFist: false,
    detected: false,
  });

  const gestureRef = useRef(gesture);

  const updateGesture = useCallback((newGesture: GestureState) => {
    gestureRef.current = newGesture;
    setGesture(newGesture);
    onGestureChange?.(newGesture);
  }, [onGestureChange]);

  return { gesture, updateGesture, gestureRef };
}
