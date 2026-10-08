import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** True when the visitor has asked their device to reduce motion. */
export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
