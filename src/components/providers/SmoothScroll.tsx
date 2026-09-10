"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Owns the single source of scroll truth.
 *
 * Lenis and ScrollTrigger both want to drive the frame loop; letting them run
 * independently produces jitter, so GSAP's ticker drives Lenis and Lenis in turn
 * notifies ScrollTrigger. Nothing else in the app should call requestAnimationFrame
 * for scroll.
 *
 * Under prefers-reduced-motion the whole thing is skipped and the browser's
 * native scroll takes over — interpolated scrolling is exactly what that setting
 * is asking us not to do.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (reduced) {
      // Progress still needs to be published for non-motion consumers.
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        document.documentElement.style.setProperty("--scroll-progress", p.toFixed(4));
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      duration: 1.1,
      // Exponential ease-out: fast pickup, long calm settle.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Never hijack touch. Native momentum on mobile beats anything we fake.
      syncTouch: false,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", (e: { progress: number }) => {
      ScrollTrigger.update();
      document.documentElement.style.setProperty(
        "--scroll-progress",
        e.progress.toFixed(4),
      );
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Anchor links must go through Lenis or they fight the interpolation.
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.4 });
      // Keep the URL and the focus ring honest for keyboard/screen-reader users.
      history.pushState(null, "", id);
      (target as HTMLElement).setAttribute("tabindex", "-1");
      (target as HTMLElement).focus({ preventScroll: true });
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [reduced]);

  return <>{children}</>;
}
