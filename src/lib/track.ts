/**
 * Privacy-first product analytics.
 * Uses Plausible (cookie-less, no personal data) when VITE_PLAUSIBLE_DOMAIN is set; otherwise a no-op.
 * Never send search text, amounts, claim IDs or anything typed by the user — only event names and coarse labels.
 */
type Props = Record<string, string | number | boolean>;
declare global { interface Window { plausible?: (event: string, opts?: { props?: Props }) => void } }

const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

export function initAnalytics() {
  if (!domain || typeof document === "undefined" || document.getElementById("plausible")) return;
  const s = document.createElement("script");
  s.id = "plausible";
  s.defer = true;
  s.dataset.domain = domain;
  s.src = "https://plausible.io/js/script.tagged-events.js";
  document.head.appendChild(s);
  // Plausible's documented queue stub, so events fired before the script loads aren't lost.
  const w = window as unknown as { plausible?: { (...a: unknown[]): void; q?: unknown[][] } };
  w.plausible = w.plausible || function (...a: unknown[]) { (w.plausible!.q = w.plausible!.q || []).push(a); };
}

export type EventName =
  | "Resolved" | "Not resolved" | "Search" | "Search no results"
  | "Share WhatsApp" | "Grievance copied" | "Calendar downloaded" | "Expert contact" | "Monthly logged" | "Chat opened" | "Chat question";

export function track(event: EventName, props?: Props) {
  try { window.plausible?.(event, props ? { props } : undefined); } catch { /* analytics must never break the app */ }
}
