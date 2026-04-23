"use client";

import type { KeyboardEvent, PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const TOP_OFFSET = 64;
const BOTTOM_OFFSET = 18;
const MIN_THUMB_HEIGHT = 34;

type ScrollIndicatorState = {
  visible: boolean;
  thumbHeight: number;
  thumbTop: number;
  valueNow: number;
};

type ScrollMetrics = {
  scrollableHeight: number;
  trackHeight: number;
  thumbHeight: number;
  availableTrackHeight: number;
};

type DragState = {
  pointerId: number;
  startY: number;
  startScrollY: number;
  scrollableHeight: number;
  availableTrackHeight: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getScrollMetrics(): ScrollMetrics {
  const doc = document.documentElement;
  const scrollableHeight = Math.max(0, doc.scrollHeight - window.innerHeight);
  const trackHeight = Math.max(0, window.innerHeight - TOP_OFFSET - BOTTOM_OFFSET);
  const thumbHeight = Math.max(
    MIN_THUMB_HEIGHT,
    Math.round((window.innerHeight / doc.scrollHeight) * trackHeight),
  );

  return {
    scrollableHeight,
    trackHeight,
    thumbHeight,
    availableTrackHeight: Math.max(1, trackHeight - thumbHeight),
  };
}

export function SiteScrollIndicator() {
  const dragRef = useRef<DragState | null>(null);
  const [state, setState] = useState<ScrollIndicatorState>({
    visible: false,
    thumbHeight: MIN_THUMB_HEIGHT,
    thumbTop: 0,
    valueNow: 0,
  });

  const update = useCallback(() => {
    const metrics = getScrollMetrics();

    if (metrics.scrollableHeight <= 8 || metrics.trackHeight <= MIN_THUMB_HEIGHT) {
      setState((current) => (current.visible ? { ...current, visible: false } : current));
      return;
    }

    const progress = clamp(window.scrollY / metrics.scrollableHeight, 0, 1);
    const thumbTop = Math.round(progress * metrics.availableTrackHeight);
    const valueNow = Math.round(progress * 100);

    setState((current) => {
      if (
        current.visible &&
        current.thumbHeight === metrics.thumbHeight &&
        current.thumbTop === thumbTop &&
        current.valueNow === valueNow
      ) {
        return current;
      }

      return {
        visible: true,
        thumbHeight: metrics.thumbHeight,
        thumbTop,
        valueNow,
      };
    });
  }, []);

  useEffect(() => {
    let frame = 0;

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        update();
        frame = 0;
      });
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [update]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!state.visible) return;

    event.preventDefault();

    const metrics = getScrollMetrics();
    const rect = event.currentTarget.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const isThumbHit = clickY >= state.thumbTop && clickY <= state.thumbTop + state.thumbHeight;

    if (!isThumbHit) {
      const targetThumbTop = clamp(
        clickY - metrics.thumbHeight / 2,
        0,
        metrics.availableTrackHeight,
      );

      window.scrollTo({
        top: (targetThumbTop / metrics.availableTrackHeight) * metrics.scrollableHeight,
        behavior: "smooth",
      });
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollY: window.scrollY,
      scrollableHeight: metrics.scrollableHeight,
      availableTrackHeight: metrics.availableTrackHeight,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();

    const scrollDelta =
      ((event.clientY - drag.startY) / drag.availableTrackHeight) * drag.scrollableHeight;

    window.scrollTo({
      top: clamp(drag.startScrollY + scrollDelta, 0, drag.scrollableHeight),
      behavior: "auto",
    });
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;

    dragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!state.visible) return;

    const doc = document.documentElement;
    const scrollableHeight = Math.max(0, doc.scrollHeight - window.innerHeight);
    let top: number | null = null;

    if (event.key === "ArrowDown") top = window.scrollY + 80;
    if (event.key === "ArrowUp") top = window.scrollY - 80;
    if (event.key === "PageDown") top = window.scrollY + window.innerHeight * 0.75;
    if (event.key === "PageUp") top = window.scrollY - window.innerHeight * 0.75;
    if (event.key === "Home") top = 0;
    if (event.key === "End") top = scrollableHeight;

    if (top === null) return;

    event.preventDefault();
    window.scrollTo({
      top: clamp(top, 0, scrollableHeight),
      behavior: "smooth",
    });
  };

  if (!state.visible) return null;

  return (
    <div
      role="scrollbar"
      aria-label="Page scroll"
      aria-controls="site-page-frame"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={state.valueNow}
      tabIndex={0}
      className="fixed bottom-[18px] right-3 top-16 z-[56] hidden w-3 cursor-pointer touch-none focus-visible:outline-none md:block"
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
    >
      <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-foreground/[0.045]" />
      <div
        className="absolute left-1/2 w-[4px] -translate-x-1/2 rounded-full bg-foreground/25 shadow-[0_0_12px_rgba(232,237,247,0.18)] transition-colors duration-150 hover:bg-foreground/40"
        style={{
          height: `${state.thumbHeight}px`,
          transform: `translateX(-50%) translateY(${state.thumbTop}px)`,
        }}
      />
    </div>
  );
}
