import { useEffect, useState } from "react";

export function useCountUp(
  end: number,
  duration: number = 600,
  start: number = 0,
  enabled: boolean = true
) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!enabled) {
      setCount(end);
      return;
    }

    const startTime = Date.now();
    const difference = end - start;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + difference * eased;

      setCount(Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, start, enabled]);

  return count;
}
