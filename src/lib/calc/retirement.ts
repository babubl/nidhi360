/**
 * Retirement income check: EPF + EPS + NPS (+ other savings) against what retirement will cost.
 * Reuses the EPF, EPS and NPS calculators so every number follows the same rules register.
 *  - Expenses grow with inflation until retirement and after it.
 *  - EPS pension and the NPS annuity are fixed in rupees: they do not rise with inflation.
 *  - The corpus (EPF + NPS lump sum + other savings) earns the post-retirement return and
 *    pays whatever the pensions don't cover, year by year, until it runs out or lifeTo is reached.
 */
import { projectEpf } from "./epfCorpus";
import { estimateEpsPension } from "./epsPension";
import { monthlyAnnuity, projectCorpus, type Sector } from "./nps";

export interface RetirementInput {
  age: number;
  retireAge: number;
  lifeTo: number;
  /** Monthly household expenses today. */
  monthlyExpense: number;
  inflationPct: number;
  /** Return on the corpus after retirement. */
  postReturnPct: number;
  // EPF
  basic: number;
  pfBalance: number;
  salaryGrowthPct: number;
  epfRatePct: number;
  vpfPct: number;
  // EPS
  epsYears: number;
  // NPS
  npsCorpus: number;
  npsMonthly: number;
  npsYears: number;
  npsReturnPct: number;
  sector: Sector;
  annuityRatePct: number;
  // Other retirement savings (mutual funds, PPF etc.)
  otherCorpus: number;
  otherMonthly: number;
  otherReturnPct: number;
}

export interface RetirementYear { age: number; need: number; pensions: number; drawn: number; corpus: number }

export interface RetirementResult {
  years: number;
  epf: number;
  npsCorpus: number;
  npsLump: number;
  npsAnnuityMonthly: number;
  epsMonthly: number;
  epsAge: number;
  other: number;
  corpusAtRetirement: number;
  monthlyExpenseAtRetirement: number;
  /** Corpus needed at retirement so the money lasts to lifeTo. */
  corpusNeeded: number;
  /** Age at which the corpus runs out, or lifeTo if it lasts. */
  lastsTo: number;
  lasts: boolean;
  readinessPct: number;
  /** Extra monthly saving (rising 5% a year) at the other-savings return that closes the gap. */
  extraMonthlyNeeded: number;
  path: RetirementYear[];
}

const fvMonthly = (monthly: number, years: number, ratePct: number, stepUpPct = 0) => {
  const r = Math.pow(1 + ratePct / 100, 1 / 12) - 1;
  let c = 0, m = monthly;
  for (let i = 0; i < Math.round(years * 12); i++) {
    if (i > 0 && i % 12 === 0) m *= 1 + stepUpPct / 100;
    c = c * (1 + r) + m;
  }
  return c;
};

/** Simulate drawdown from retirement; returns the path and the age the money runs out. */
function drawdown(corpus: number, firstYearNeed: number, i: RetirementInput, epsMonthly: number, epsAge: number, annuityMonthly: number) {
  const path: RetirementYear[] = [];
  let c = corpus, need = firstYearNeed, lastsTo = i.lifeTo;
  let ranOut = false;
  for (let a = i.retireAge; a < i.lifeTo; a++) {
    const pensions = (a >= epsAge ? epsMonthly * 12 : 0) + annuityMonthly * 12;
    const drawn = Math.max(0, need - pensions);
    c = (c - drawn) * (1 + i.postReturnPct / 100);
    if (c < 0 && !ranOut) { ranOut = true; lastsTo = a; }
    path.push({ age: a, need, pensions, drawn, corpus: Math.max(0, c) });
    need *= 1 + i.inflationPct / 100;
  }
  return { path, lastsTo, lasts: !ranOut };
}

export function retirementCheck(i: RetirementInput): RetirementResult {
  const years = Math.max(0, i.retireAge - i.age);

  const epf = projectEpf({ basicMonthly: i.basic, currentBalance: i.pfBalance, age: i.age, retireAge: i.retireAge, salaryGrowthPct: i.salaryGrowthPct, ratePct: i.epfRatePct, vpfPct: i.vpfPct, employerOnFullBasic: false }).balanceAtRetirement;

  // EPS pays from 58 at the earliest without reduction; if retiring before 58, assume they wait for 58.
  const epsAge = Math.max(58, Math.min(60, i.retireAge));
  const salaryAtExit = i.basic * Math.pow(1 + i.salaryGrowthPct / 100, years);
  const eps = estimateEpsPension({ salary: salaryAtExit, serviceSoFar: i.epsYears, currentAge: i.age, leaveAge: Math.min(58, i.retireAge), startAge: epsAge });
  const epsMonthly = eps.eligible ? eps.monthlyPension : 0;

  const nps = i.npsCorpus > 0 || i.npsMonthly > 0
    ? projectCorpus({ age: i.age, yearsInNps: i.npsYears, corpus: i.npsCorpus, monthlyContribution: i.npsMonthly, annualStepUpPct: i.salaryGrowthPct, expectedReturnPct: i.npsReturnPct, exitAge: i.retireAge, sector: i.sector })
    : null;
  const npsLump = nps ? nps.lumpSumMax + nps.systematic : 0;
  const npsAnnuityMonthly = nps ? monthlyAnnuity(nps.annuityMin, i.annuityRatePct) : 0;

  const other = i.otherCorpus * Math.pow(1 + i.otherReturnPct / 100, years) + fvMonthly(i.otherMonthly, years, i.otherReturnPct, 5);

  const corpusAtRetirement = epf + npsLump + other;
  const monthlyExpenseAtRetirement = i.monthlyExpense * Math.pow(1 + i.inflationPct / 100, years);
  const firstYearNeed = monthlyExpenseAtRetirement * 12;

  const run = drawdown(corpusAtRetirement, firstYearNeed, i, epsMonthly, epsAge, npsAnnuityMonthly);

  // Corpus needed: present value at retirement of each year's shortfall (paid at the start of the year).
  let corpusNeeded = 0, need = firstYearNeed;
  for (let a = i.retireAge, k = 0; a < i.lifeTo; a++, k++) {
    const pensions = (a >= epsAge ? epsMonthly * 12 : 0) + npsAnnuityMonthly * 12;
    corpusNeeded += Math.max(0, need - pensions) / Math.pow(1 + i.postReturnPct / 100, k);
    need *= 1 + i.inflationPct / 100;
  }

  const gap = Math.max(0, corpusNeeded - corpusAtRetirement);
  const perRupee = years > 0 ? fvMonthly(1, years, i.otherReturnPct, 5) : 0;
  const extraMonthlyNeeded = gap > 0 ? (perRupee > 0 ? gap / perRupee : Infinity) : 0;

  return {
    years,
    epf,
    npsCorpus: nps?.corpusAtExit ?? 0,
    npsLump,
    npsAnnuityMonthly,
    epsMonthly,
    epsAge,
    other,
    corpusAtRetirement,
    monthlyExpenseAtRetirement,
    corpusNeeded,
    lastsTo: run.lastsTo,
    lasts: run.lasts,
    readinessPct: corpusNeeded > 0 ? Math.min(100, (corpusAtRetirement / corpusNeeded) * 100) : 100,
    extraMonthlyNeeded,
    path: run.path,
  };
}
