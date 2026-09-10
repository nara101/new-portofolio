"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "journey", label: "Journey" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Work" },
  { id: "certificates", label: "Credentials" },
  { id: "testimonials", label: "Words" },
  { id: "contact", label: "Contact" },
];

/**
 * A dot rail that reports where you are. IntersectionObserver rather than
 * scroll math so it costs nothing per frame and stays correct when sections
 * change height.
 *
 * Hidden below lg: on a phone this would be seven tap targets stacked down the
 * thumb zone, competing with the content. Mobile gets the progress bar instead.
 */
export function Nav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // The entry closest to the middle of the viewport wins, so a short
        // section sandwiched between two tall ones still registers.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav
        aria-label="Section navigation"
        className="fixed right-8 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      >
        <ul className="flex flex-col gap-1">
          {SECTIONS.map(({ id, label }) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex items-center justify-end gap-3 py-1.5"
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-500 ease-calm",
                      isActive
                        ? "text-rosewood-400 opacity-100"
                        : "text-lavender-100 opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-[2px] transition-all duration-500 ease-calm",
                      isActive
                        ? "w-7 bg-rosewood-400"
                        : "w-3.5 bg-lavender-200/60 group-hover:w-5 group-hover:bg-rosewood-400",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: a hairline progress bar, fed by the same --scroll-progress the
          Lenis provider publishes. No JS per frame here. */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-40 h-[2px] bg-lagoon-50/25 lg:hidden"
      >
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-violet-400 to-pink-300"
          style={{ scaleX: "var(--scroll-progress)" as unknown as number }}
        />
      </div>
    </>
  );
}
