import { useCallback, useRef } from "react";

interface UseTiltOptions {
  maxTilt?: number;
  scale?: number;
  speed?: number;
}

export function useTilt(options?: UseTiltOptions) {
  const { maxTilt = 12, scale = 1.04, speed = 400 } = options ?? {};
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;

      if (frameRef.current) cancelAnimationFrame(frameRef.current);

      frameRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateX = (0.5 - y) * maxTilt;
        const rotateY = (x - 0.5) * maxTilt;

        el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
        el.style.transition = `transform ${speed}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      });
    },
    [maxTilt, scale, speed]
  );

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    el.style.transition = `transform ${speed}ms cubic-bezier(0.16, 1, 0.3, 1)`;
  }, [speed]);

  return { ref, handleMove, handleLeave };
}
