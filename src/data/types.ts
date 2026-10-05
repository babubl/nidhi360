export type Area = "pf" | "nps" | "tax";
export type RuleStatus = "live" | "announced";

export interface Rule {
  id: string;
  area: Area;
  status: RuleStatus;
  /** ISO date the rule applies from (or the date its status was last checked, for announced rules). */
  effective: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
}

export interface RejectionReason {
  id: string;
  title: string;
  keywords: string[];
  meaning: string;
  fix: string[];
  rules: string[];
}

export interface HealthQuestion {
  id: string;
  weight: 1 | 2 | 3;
  question: string;
  why: string;
  fix: string[];
}
