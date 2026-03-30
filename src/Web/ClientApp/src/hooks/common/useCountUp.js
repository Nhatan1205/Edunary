import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useCountUp — animates a number from 0 to `end` when the element
 * scrolls into view. Returns [ref, displayValue].
 *
 * @param {number} end       - Target number to count up to
 * @param {number} duration  - Animation duration in ms (default 1500)
 * @param {number} threshold - IntersectionObserver threshold (default 0.3)
 */
const useCountUp = (end, duration = 1500, threshold = 0.3) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [end, duration]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.unobserve(node);
        }
      },
      { threshold }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [animate, threshold]);

  return [ref, value];
};

export default useCountUp;
