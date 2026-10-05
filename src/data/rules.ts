import raw from "./rules.json";
import type { Rule } from "./types";

export const RULES = raw as Rule[];

/** Date the whole register was last verified against official sources. */
export const RULES_CHECKED_ON = "2026-10-05";

export const ruleById = (id: string): Rule | undefined => RULES.find((r) => r.id === id);

export const rulesByRecency = (): Rule[] =>
  [...RULES].sort((a, b) => b.effective.localeCompare(a.effective));
