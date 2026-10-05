/**
 * EPS pension estimate (R14, R24, R10).
 * Pension = pensionable salary × pensionable service ÷ 70
 *  - pensionable salary: average of the last 60 months, capped at the wage ceiling
 *    (₹15,000 before 17 Sep 2026, ₹25,000 from then).
 *  - 2 years' weightage for 20+ years of service, when claimed at 58 or later.
 *  - Early pension from 50: reduced 4% per year short of 58. Deferred to 59/60: +4% per year.
 *  - Minimum pension ₹1,000. Under 10 years of service: no pension, withdrawal benefit only.
 * Not covered: higher-pension (actual salary) members, disability and family pension.
 */
export interface EpsInput {
  /** Monthly basic + DA today. */
  salary: number;
  /** EPS service already completed, in years. */
  serviceSoFar: number;
  currentAge: number;
  /** Age at which you stop working in EPS-covered employment. */
  leaveAge: number;
  /** Age at which you start drawing pension (50–60). */
  startAge: number;
  /** Date used as "today" (for tests). */
  today?: Date;
}

export interface EpsResult {
  eligible: boolean;
  totalService: number;
  weightage: number;
  pensionableSalary: number;
  basePension: number;
  adjustmentPct: number;
  monthlyPension: number;
  notes: string[];
}

export const CEILING_OLD = 15000;
export const CEILING_NEW = 25000;
export const CEILING_CHANGE = new Date("2026-09-17T00:00:00");
export const MIN_PENSION = 1000;

export function averagePensionableSalary(salary: number, exitDate: Date): number {
  let total = 0;
  for (let m = 1; m <= 60; m++) {
    const d = new Date(exitDate);
    d.setMonth(d.getMonth() - m);
    const cap = d >= CEILING_CHANGE ? CEILING_NEW : CEILING_OLD;
    total += Math.min(salary, cap);
  }
  return total / 60;
}

export function estimateEpsPension(i: EpsInput): EpsResult {
  const today = i.today ?? new Date();
  const notes: string[] = [];
  const yearsMore = Math.max(0, i.leaveAge - i.currentAge);
  const totalService = Math.max(0, i.serviceSoFar + yearsMore);
  const exitDate = new Date(today);
  exitDate.setMonth(exitDate.getMonth() + Math.round(yearsMore * 12));

  if (totalService < 10) {
    notes.push(`With ${+totalService.toFixed(1)} years of EPS service you're below the 10-year line, so there's no monthly pension, only a one-time withdrawal benefit (Form 10C). Staying in covered employment for ${+(10 - totalService).toFixed(1)} more years would qualify you.`);
    return { eligible: false, totalService, weightage: 0, pensionableSalary: 0, basePension: 0, adjustmentPct: 0, monthlyPension: 0, notes };
  }

  const startAge = Math.min(60, Math.max(50, i.startAge));
  const weightage = totalService >= 20 && startAge >= 58 ? 2 : 0;
  const pensionableSalary = averagePensionableSalary(i.salary, exitDate);
  const basePension = (pensionableSalary * (totalService + weightage)) / 70;

  let adjustmentPct = 0;
  if (startAge < 58) adjustmentPct = -4 * (58 - startAge);
  if (startAge > 58) adjustmentPct = 4 * (startAge - 58);
  let monthlyPension = basePension * (1 + adjustmentPct / 100);
  if (monthlyPension < MIN_PENSION) {
    monthlyPension = MIN_PENSION;
    notes.push("Your formula pension is below the ₹1,000 minimum, so the minimum applies.");
  }
  if (weightage) notes.push("You get 2 extra years of service credit for 20+ years of service.");
  if (startAge < 58) notes.push(`Starting at ${startAge} cuts your pension by ${-adjustmentPct}% for life.`);
  if (startAge > 58) notes.push(`Deferring to ${startAge} raises your pension by ${adjustmentPct}%.`);
  if (i.salary > CEILING_OLD) notes.push("Salary above the wage ceiling is not counted unless you're in the higher-pension category, which this estimate doesn't cover.");

  return { eligible: true, totalService, weightage, pensionableSalary, basePension, adjustmentPct, monthlyPension, notes };
}
