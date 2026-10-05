import { useEffect, useState } from "react";

const PREFIX = "n360:";

/** useState persisted to localStorage, tolerant of private mode and blocked storage. */
export function useStoredState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const s = localStorage.getItem(PREFIX + key);
      return s ? (JSON.parse(s) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
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
