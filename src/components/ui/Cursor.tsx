"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useFinePointer } from "@/lib/useReducedMotion";

type CursorMode = "default" | "link" | "text" | "view";

/**
 * A two-part cursor: a dot that tracks the pointer exactly, and a ring that
 * trails it with spring damping. The lag between them is the whole effect.
 *
 * Rules this follows, because a custom cursor is an accessibility liability
 * otherwise:
 *   - Only mounts for fine pointers (never touch).
 *   - Never mounts under prefers-reduced-motion.
 *   - The real cursor is only hidden once this is actually rendering, via the
 *     data-custom-cursor attribute on <body>. If this component fails to mount,
 *     the system cursor is still there.
 *   - Hidden from assistive tech entirely.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);

  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;
    document.body.setAttribute("data-custom-cursor", "on");
    return () => document.body.removeAttribute("data-custom-cursor");
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) setVisible(true);

      const el = e.target as HTMLElement | null;
      if (!el?.closest) return;

      if (el.closest("[data-cursor='view']")) setMode("view");
      else if (el.closest("a, button, [role='button'], summary")) setMode("link");
      else if (el.closest("input, textarea, [contenteditable='true']")) setMode("text");
      else setMode("default");
    };

    const tick = () => {
      // Dot is exact; ring springs toward it. 0.18 lands around 120ms of trail.
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      cancelAnimationFrame(frame);
    };
  }, [enabled, visible]);

  if (!enabled) return null;

  const ringSize = mode === "view" ? 72 : mode === "link" ? 44 : mode === "text" ? 4 : 28;
  const ringOpacity = mode === "text" ? 0 : 1;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        ref={dotRef}
        className="absolute left-0 top-0 rounded-full bg-pink-300 transition-[width,height,opacity] duration-300 ease-calm"
        style={{
          width: mode === "text" ? 2 : 6,
          height: mode === "text" ? 22 : 6,
          borderRadius: mode === "text" ? 2 : 999,
          opacity: visible ? 1 : 0,
        }}
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 rounded-full border border-lavender-300/60 backdrop-blur-[1px] transition-[width,height,opacity,background-color] duration-300 ease-calm"
        style={{
          width: ringSize,
          height: ringSize,
          opacity: visible ? ringOpacity * 0.9 : 0,
          backgroundColor:
            mode === "view" ? "rgb(var(--theme-accent) / 0.14)" : "transparent",
        }}
      >
        {mode === "view" && (
          <span className="absolute inset-0 grid place-items-center text-[9px] font-medium uppercase tracking-[0.18em] text-lavender-100">
            View
          </span>
        )}
      </div>
    </div>
  );
}
