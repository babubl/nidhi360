import { useEffect, useRef, useState } from "react";

const PREFIX = "n360:";

/**
 * useState persisted to localStorage, tolerant of private mode and blocked storage.
 * Reads after mount so prerendered HTML and the first client render match.
 */
export function useStoredState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const s = localStorage.getItem(PREFIX + key);
      if (s) setV(JSON.parse(s) as T);
    } catch { /* storage unavailable */ }
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(PREFIX + key, JSON.stringify(v)); } catch { /* storage unavailable */ }
  }, [key, v]);
  return [v, setV] as const;
}

/**
 * The user's own details, shared across tools so they type them once.
 * Saved only on this device. Keys are prefixed "me." so tools prefill each other.
 */
export const useMe = <T,>(field: "age" | "pfBalance" | "pfYears" | "salary" | "epsYears" | "dob" | "lastWorkingDay" | "npsCorpus" | "npsYears", initial: T) =>
  useStoredState<T>("me." + field, initial);

export function clearSavedData() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
  } catch { /* storage unavailable */ }
}

/** Everything Nidhi360 saved on this device, as a JSON backup (amounts and dates only). */
export function exportSavedData(): string {
  const data: Record<string, unknown> = {};
  try {
    for (const k of Object.keys(localStorage)) {
      if (!k.startsWith(PREFIX) || k.startsWith(PREFIX + "visit.")) continue;
      try { data[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k) ?? "null"); } catch { /* skip unreadable */ }
    }
  } catch { /* storage unavailable */ }
  return JSON.stringify({ app: "nidhi360", version: 1, exported: new Date().toISOString(), data }, null, 2);
}

/** Restore a backup made by exportSavedData. Returns how many items were restored. */
export function importSavedData(text: string): number {
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error("That isn't a Nidhi360 backup file."); }
  const p = parsed as { app?: string; data?: Record<string, unknown> };
  if (p?.app !== "nidhi360" || !p.data || typeof p.data !== "object") throw new Error("That isn't a Nidhi360 backup file.");
  let n = 0;
  for (const [k, v] of Object.entries(p.data)) {
    if (!/^[\w.-]{1,64}$/.test(k)) continue;
    const s = JSON.stringify(v);
    if (s.length > 200_000) continue;
    try { localStorage.setItem(PREFIX + k, s); n++; } catch { throw new Error("This browser won't let us save data. Is it in private mode?"); }
  }
  return n;
}

/**
 * Date of the person's previous visit (before this browser session), stored on this device only.
 * Powers "what changed since you were last here". Idempotent within a session.
 */
export function usePreviousVisit(): string | undefined {
  const [prev, setPrev] = useState<string | undefined>(undefined);
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (!sessionStorage.getItem("n360:visited")) {
        const last = localStorage.getItem(PREFIX + "visit.last");
        if (last) localStorage.setItem(PREFIX + "visit.prev", last);
        localStorage.setItem(PREFIX + "visit.last", today);
        sessionStorage.setItem("n360:visited", "1");
      }
      const p = localStorage.getItem(PREFIX + "visit.prev");
      if (p) setPrev(p);
    } catch { /* storage unavailable */ }
  }, []);
  return prev;
}
