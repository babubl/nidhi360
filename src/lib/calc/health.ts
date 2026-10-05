import { HEALTH_QUESTIONS } from "../../data/healthcheck";

export type Answer = "yes" | "no" | "unsure";

/** 0–100. "Not sure" earns partial credit because the item still needs checking. */
export function healthScore(answers: Record<string, Answer | undefined>): number {
  let total = 0, got = 0;
  for (const q of HEALTH_QUESTIONS) {
    total += q.weight;
    const a = answers[q.id];
    got += a === "yes" ? q.weight : a === "unsure" ? q.weight * 0.4 : 0;
  }
  return Math.round((got / total) * 100);
}

export function healthBand(score: number): "good" | "fair" | "poor" {
  return score >= 85 ? "good" : score >= 60 ? "fair" : "poor";
}

/** Items to fix: "no" before "unsure", heavier weight first. */
export function fixList(answers: Record<string, Answer | undefined>) {
  return HEALTH_QUESTIONS.filter((q) => answers[q.id] !== "yes").sort(
    (a, b) => b.weight - a.weight || (answers[a.id] === "no" ? -1 : 1) - (answers[b.id] === "no" ? -1 : 1),
  );
}
