import { REJECTIONS } from "../../data/rejections";
import type { RejectionReason } from "../../data/types";

export interface RejectionMatch { reason: RejectionReason; hits: string[]; score: number }

/** Keyword match; longer keywords weigh more. Returns up to 3 close matches. */
export function matchRejection(text: string): RejectionMatch[] {
  const t = " " + text.toLowerCase() + " ";
  const scored = REJECTIONS.map((reason) => {
    const hits = reason.keywords.filter((k) => t.includes(k));
    return { reason, hits, score: hits.reduce((s, k) => s + k.length, 0) };
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return [];
  const top = scored[0].score;
  return scored.filter((m) => m.score >= top * 0.6).slice(0, 3);
}

/** Aadhaar, PAN, 12-digit UAN or an OTP: never send these to the AI. */
export const SENSITIVE_PATTERN = /\b\d{12}\b|\b\d{4}\s\d{4}\s\d{4}\b|\b[A-Z]{5}\d{4}[A-Z]\b|\botp\b\s*[:=]?\s*\d{4,8}/i;
export const containsSensitive = (s: string) => SENSITIVE_PATTERN.test(s);
