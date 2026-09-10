"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * useLayoutEffect fires before paint, which is exactly what dismissing the
 * loader needs; on the server it does not exist and React warns. Falling back to
 * useEffect server-side is safe because the server never runs effects at all.
 */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * A gradient-bloom loader with the name drawing itself in.
 *
 * Two rules keep this from becoming the thing everyone hates about "premium"
 * sites:
 *   1. It is capped hard. If fonts/images stall, it leaves anyway at 2.2s.
 *      Nobody is held hostage by a progress animation.
 *   2. It only runs on first visit in a session. Coming back from a project
 *      link should not replay the intro.
 */
const SESSION_KEY = "nara:intro-played";

export function Loader() {
  const reduced = useReducedMotion();
  // Starts shown, and is present in the server markup, so it covers the very
  // first paint. Anything else plays the intro *over* content the visitor has
  // already seen.
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  // Dismiss before the first paint for repeat visits and reduced-motion, so
  // neither ever sees a flash of the intro. matchMedia is read directly rather
  // than via the hook's state, which only settles after a render — a frame too
  // late to prevent the flash.
  useBeforePaint(() => {
    const seen = sessionStorage.getItem(SESSION_KEY);
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || noMotion) setDone(true);
  }, []);

  useEffect(() => {
    if (reduced) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    let raf = 0;
    const start = performance.now();
    const DURATION = 2200;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // Ease-out so it decelerates into completion rather than snapping.
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        sessionStorage.setItem(SESSION_KEY, "1");
        setDone(true);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[10000] grid place-items-center bg-cream-200"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          // The loader is decorative; the page beneath is the real content.
          aria-hidden="true"
        >
          <motion.div
            className="absolute h-[36rem] w-[36rem] rounded-full blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, rgb(var(--theme-accent) / 0.5), rgb(var(--theme-accent-soft) / 0.3), transparent 70%)",
            }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1 + progress * 0.35, opacity: 0.4 + progress * 0.5 }}
            transition={{ duration: 0.4 }}
          />

          <div className="relative flex flex-col items-center gap-8">
            <div className="overflow-hidden">
              {/* Decorative: the hero owns the page's only <h1>. */}
              <motion.div
                className="text-gradient font-display text-display-md font-semibold"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              >
                Nabila Ramadhanty
              </motion.div>
            </div>

            <div className="h-px w-56 overflow-hidden bg-lagoon-50/10">
              <div
                className="h-full bg-gradient-to-r from-violet-400 via-lavender-300 to-pink-300"
                style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
