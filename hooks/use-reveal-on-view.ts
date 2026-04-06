"use client";

import { useEffect, useRef, useState } from "react";

type UseRevealOnViewOptions = {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
  initialVisible?: boolean;
};

export function useRevealOnView<T extends Element = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = "0px",
  once = true,
  initialVisible = false,
}: UseRevealOnViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(initialVisible);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          if (once) {
            observer.disconnect();
          }

          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, isVisible };
}
