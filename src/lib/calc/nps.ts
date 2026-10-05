/**
 * NPS projection, exit split and tax deductions.
 * Exit rules: PFRDA (Exits and Withdrawals) Amendment Regulations, Dec 2025 (R15–R18).
 * Tax: only 60% of the corpus is tax-free as lump sum (R21); deductions per R22.
 */
export type Sector = "private" | "government";

export interface ExitSplit {
  isNormalExit: boolean;
  lumpSumMax: number;
  annuityMin: number;
  systematic: number;
  taxFreeLump: number;
  taxableLump: number;
  notes: string[];
  rules: string[];
}

export function exitSplit(sector: Sector, corpus: number, isNormalExit: boolean): ExitSplit {
  const notes: string[] = [];
  let lump = 0, annuity = 0, systematic = 0;
  let rules = ["R15", "R16"];

  if (!isNormalExit) {
    rules = ["R18"];
    if (corpus <= 500000) lump = corpus;
    else { lump = corpus * 0.2; annuity = corpus * 0.8; }
  } else if (corpus <= 800000) {
    lump = corpus;
  } else if (sector === "government") {
    lump = corpus * 0.6; annuity = corpus * 0.4;
  } else if (corpus <= 1200000) {
    if (corpus * 0.8 >= 600000) { lump = corpus * 0.8; annuity = corpus * 0.2; }
    else { lump = 600000; systematic = corpus - 600000; }
    notes.push("With a corpus of ₹8–12 lakh you can also take ₹6 lakh as a lump sum and withdraw the rest gradually over at least 6 years, with no annuity.");
  } else {
    lump = corpus * 0.8; annuity = corpus * 0.2;
  }

  const taxFreeLump = Math.min(lump, corpus * 0.6);
  return { isNormalExit, lumpSumMax: lump, annuityMin: annuity, systematic, taxFreeLump, taxableLump: Math.max(0, lump - taxFreeLump), notes, rules };
}

export interface ProjectionInput {
  age: number;
  yearsInNps: number;
  corpus: number;
  monthlyContribution: number;
  annualStepUpPct: number;
  expectedReturnPct: number;
  exitAge: number;
  sector: Sector;
}

export interface ProjectionResult extends ExitSplit {
  corpusAtExit: number;
  totalContributed: number;
  yearsAtExit: number;
}

export function projectCorpus(p: ProjectionInput): ProjectionResult {
  const exitAge = Math.max(p.age, Math.min(85, p.exitAge));
  const months = Math.round((exitAge - p.age) * 12);
  const r = Math.pow(1 + p.expectedReturnPct / 100, 1 / 12) - 1;
  let corpus = Math.max(0, p.corpus);
  let monthly = Math.max(0, p.monthlyContribution);
  let contributed = 0;
  for (let m = 0; m < months; m++) {
    if (m > 0 && m % 12 === 0) monthly *= 1 + p.annualStepUpPct / 100;
    corpus = corpus * (1 + r) + monthly;
    contributed += monthly;
  }
  const yearsAtExit = p.yearsInNps + (exitAge - p.age);
  const isNormalExit = exitAge >= 60 || (p.sector === "private" && yearsAtExit >= 15);
  return { ...exitSplit(p.sector, corpus, isNormalExit), corpusAtExit: corpus, totalContributed: contributed, yearsAtExit };
}

export const monthlyAnnuity = (annuityCorpus: number, ratePct: number) => (annuityCorpus * ratePct) / 100 / 12;

export interface TaxInput {
  regime: "new" | "old";
  /** Annual basic + DA. */
  basic: number;
  employerPct: number;
  /** Your own annual contribution (old regime only). */
  ownContribution: number;
  /** 80C already used by EPF, PPF, ELSS, insurance etc. */
  used80C: number;
  slabPct: number;
}

export interface TaxResult {
  employerAmount: number;
  employerDeduction: number;
  own80C: number;
  own1B: number;
  totalDeduction: number;
  taxSaved: number;
  employerOverCap: boolean;
}

export function npsTaxSaving(t: TaxInput): TaxResult {
  const employerAmount = (t.basic * t.employerPct) / 100;
  const cap = t.basic * (t.regime === "new" ? 0.14 : 0.1);
  const employerDeduction = Math.min(employerAmount, cap);
  let own80C = 0, own1B = 0;
  if (t.regime === "old") {
    const room = Math.max(0, 150000 - t.used80C);
    own80C = Math.min(t.ownContribution, t.basic * 0.1, room);
    own1B = Math.min(50000, Math.max(0, t.ownContribution - own80C));
  }
  const totalDeduction = employerDeduction + own80C + own1B;
  return { employerAmount, employerDeduction, own80C, own1B, totalDeduction, taxSaved: totalDeduction * (t.slabPct / 100) * 1.04, employerOverCap: employerAmount > cap };
}
