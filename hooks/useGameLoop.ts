import { useEffect, useRef } from 'react';

export function useGameLoop(callback: () => void) {
  const animationIdRef = useRef<number>();

  useEffect(() => {
    const loop = () => {
      callback();
      animationIdRef.current = requestAnimationFrame(loop);
    };

    animationIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [callback]);

  return animationIdRef;
}
