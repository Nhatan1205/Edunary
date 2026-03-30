import { useEffect, useRef, useCallback } from "react";

/**
 * useScrollAnimation — attaches IntersectionObserver to a ref element.
 * When the element enters the viewport, adds "scroll-visible" to itself
 * and all animated children (.scale-in, .fade-in-*).
 *
 * The ref returned can be attached to any DOM element.
 * If the element is conditionally rendered, the observer will attach
 * when the element mounts.
 *
 * @param {string} animationClass - CSS class for hidden state
 * @param {object} options
 * @param {number} options.threshold - Default 0.15
 * @param {boolean} options.triggerOnce - Default true
 * @returns {{ ref: React.RefObject, triggerAnimation: Function }}
 */
const useScrollAnimation = (animationClass = "fade-in-up", options = {}) => {
  const ref = useRef(null);
  const observerRef = useRef(null);
  const { threshold = 0.15, triggerOnce = true } = options;

  const activate = useCallback(
    (element) => {
      element.classList.add("scroll-visible");
      // Also activate animated children
      element
        .querySelectorAll(".scale-in, .fade-in-up, .fade-in-left, .fade-in-right")
        .forEach((child) => child.classList.add("scroll-visible"));
    },
    []
  );

  // Use a callback ref so we know exactly when the DOM element is assigned
  const setRef = useCallback(
    (node) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      ref.current = node;

      if (!node) return;

      // Add initial hidden class
      node.classList.add(animationClass);

      // Create observer
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            activate(node);
            if (triggerOnce) {
              observer.unobserve(node);
            }
          }
        },
        { threshold }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [animationClass, threshold, triggerOnce, activate]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return setRef;
};

export default useScrollAnimation;
