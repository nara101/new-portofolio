"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion, useFinePointer } from "@/lib/useReducedMotion";

/**
 * The ambient backdrop: four large, slowly drifting colour fields plus grain.
 *
 * Deliberately CSS/SVG rather than WebGL. Four blurred radial gradients composite
 * on the GPU for effectively nothing, where a canvas would cost a context, a
 * render loop and a battery. Three.js is reserved for somewhere it earns its
 * keep.
 *
 * The pointer parallax is written to CSS custom properties from a rAF loop
 * rather than to React state — this repaints on the compositor and never
 * re-renders the tree.
 */
export function Aurora() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();

  useEffect(() => {
    if (reduced || !fine) return;

    const el = ref.current;
    if (!el) return;

    // Targets are where the pointer is; current lags behind for inertia.
    let targetX = 0.5;
    let targetY = 0.5;
    let currentX = 0.5;
    let currentY = 0.5;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX / window.innerWidth;
      targetY = e.clientY / window.innerHeight;
    };

    const tick = () => {
      // Heavy damping: the background should feel like it is underwater.
      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;
      el.style.setProperty("--pointer-x", `${(currentX * 100).toFixed(2)}%`);
      el.style.setProperty("--pointer-y", `${(currentY * 100).toFixed(2)}%`);
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [reduced, fine]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="grain pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "rgb(var(--bg-deep))" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgb(var(--tw-cream-100)), rgb(var(--bg-deep)), rgb(var(--tw-cream-300)))",
        }}
      />

      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background:
            "radial-gradient(60rem 60rem at var(--pointer-x, 50%) var(--pointer-y, 50%), rgb(var(--theme-accent-soft) / 0.35), transparent 70%)",
        }}
      />

      <div
        className="animate-drift absolute -left-[15%] top-[-10%] h-[45rem] w-[45rem] rounded-full blur-[110px]"
        style={{ background: "rgb(var(--theme-accent-nature) / 0.28)" }}
      />
      <div
        className="animate-drift-slow absolute -right-[10%] top-[20%] h-[38rem] w-[38rem] rounded-full blur-[120px]"
        style={{ background: "rgb(var(--theme-accent-soft) / 0.35)", animationDelay: "-8s" }}
      />
      <div
        className="animate-drift absolute bottom-[5%] left-[20%] h-[42rem] w-[42rem] rounded-full blur-[130px]"
        style={{ background: "rgb(var(--theme-accent-sky) / 0.32)", animationDelay: "-16s" }}
      />
      <div
        className="animate-drift-slow absolute -bottom-[15%] right-[15%] h-[34rem] w-[34rem] rounded-full blur-[120px]"
        style={{ background: "rgb(var(--theme-accent) / 0.16)", animationDelay: "-24s" }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgb(var(--bg-deep) / 0.65) 100%)",
        }}
      />
    </div>
  );
}
