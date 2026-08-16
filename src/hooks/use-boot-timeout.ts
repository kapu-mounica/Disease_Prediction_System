import { useEffect, useState } from "react";

/**
 * Returns true once `ms` milliseconds have passed since mount.
 * Used to show a "backend unreachable" banner when a Convex query stays in
 * its loading state for too long.
 */
export function useBootTimeout(ms = 10000): boolean {
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setElapsed(true), ms);
    return () => window.clearTimeout(id);
  }, [ms]);
  return elapsed;
}
