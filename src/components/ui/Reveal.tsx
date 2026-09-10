"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 28 },
    shown: { opacity: 1, y: 0 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(12px)", scale: 0.97 },
    shown: { opacity: 1, filter: "blur(0px)", scale: 1 },
  },
  mask: {
    hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
    shown: { opacity: 1, clipPath: "inset(0 0 0% 0)" },
  },
};

/**
 * Scroll-in reveal. Framer Motion's `whileInView` already no-ops its transforms
 * under prefers-reduced-motion via the global CSS duration override, and
 * `once` keeps it from re-firing on scroll-back — replaying reveals every pass
 * is the fastest way to make a long page feel restless.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={variants[variant]}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Staggers direct children. Pair with <Reveal> inside. */
export function RevealGroup({
  children,
  stagger = 0.08,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ shown: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}
