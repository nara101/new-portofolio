"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

/**
 * Two rewards for curiosity: a console note for anyone who opens devtools, and
 * the Konami code for anyone who tries it.
 *
 * Both are strictly additive. Neither traps focus, plays sound, or blocks the
 * page, and the keydown listener ignores anything typed into the contact form.
 */
export function EasterEggs({ name, email }: { name: string; email: string }) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    console.log(
      `%c${name}`,
      "font-size:22px;font-weight:800;background:linear-gradient(90deg,#B46A72,#F7C8D3);-webkit-background-clip:text;color:transparent;padding:4px 0",
    );
    console.log(
      `%cYou opened the console. That's the right instinct.\n\nThis site is Next.js + TypeScript + Tailwind, with Lenis for scroll and\nFramer Motion for everything that moves. The GitHub section is live from\nthe API. No numbers on this page are invented.\n\nIf you're reading this, you should probably just email me: ${email}\n\nps — try the Konami code.`,
      "font-family:ui-monospace,monospace;font-size:12px;line-height:1.7;color:#A9B7C6",
    );
  }, [name, email]);

  useEffect(() => {
    let index = 0;

    const onKey = (e: KeyboardEvent) => {
      // Don't hijack keys meant for the contact form.
      const el = e.target as HTMLElement | null;
      if (el?.matches?.("input, textarea, [contenteditable='true']")) return;

      if (e.key.toLowerCase() === KONAMI[index].toLowerCase()) {
        index += 1;
        if (index === KONAMI.length) {
          setUnlocked(true);
          index = 0;
        }
      } else {
        // Restart, but allow the failed key to be a valid first key.
        index = e.key === KONAMI[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const t = setTimeout(() => setUnlocked(false), 6000);
    return () => clearTimeout(t);
  }, [unlocked]);

  return (
    <AnimatePresence>
      {unlocked && (
        <motion.div
          key="konami"
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass glass-sheen fixed bottom-8 left-1/2 z-[9997] -translate-x-1/2 rounded-full px-6 py-3.5 shadow-lift"
          role="status"
          aria-live="polite"
        >
          <p className="whitespace-nowrap text-xs text-lavender-50">
            <span className="mr-2">🌙</span>
            Achievement unlocked —{" "}
            <span className="text-gradient font-semibold">you tried the Konami code</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
