import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

// Global registry to track pages that have already completed their entrance animations.
// This prevents animations from repeating on client-side router navigation.
export const visitedPaths = new Set<string>();

/**
 * Returns a [ref, isInView] pair.
 * Attach `ref` (callback ref) to a DOM element and `isInView` toggles true
 * when that element enters the viewport. Handles conditional rendering correctly
 * and prevents re-triggering animations on revisited pages.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
  once = true,
}: UseInViewOptions = {}) {
  const router = useRouter();
  const path = router?.pathname || "";
  const hasVisited = visitedPaths.has(path);

  const [isInView, setIsInView] = useState(hasVisited);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      // Disconnect previous observer if exists
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // If page was already animated in this session, skip observation
      if (hasVisited) {
        setIsInView(true);
        return;
      }

      if (node) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              if (once) {
                observer.disconnect();
              }
            } else if (!once) {
              setIsInView(false);
            }
          },
          { threshold, rootMargin }
        );

        observer.observe(node);
        observerRef.current = observer;
      }
    },
    [threshold, rootMargin, once, hasVisited]
  );

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [ref, isInView, hasVisited] as const;
}
