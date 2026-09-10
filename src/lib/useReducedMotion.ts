"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media queries are external stores, so useSyncExternalStore is the right tool:
 * it subscribes without a setState-in-effect cascade, and it re-reads on every
 * change rather than sampling once at mount — the setting can be toggled
 * mid-session and a one-shot read would strand the user in whichever mode they
 * started in.
 *
 * The server snapshot is deliberately the *non*-matching value for both queries,
 * so SSR markup describes a static, pointer-less page. Motion and cursor effects
 * are therefore opt-in after hydration and can never cause a mismatch.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** True when the visitor has asked the OS to reduce motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True only on devices with a real hovering pointer. */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
