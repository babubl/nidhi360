/**
 * EPF corpus projection to a chosen age.
 * Monthly: employee 12% of basic + DA; employer 12%, of which 8.33% of wages up to the ceiling goes to EPS
 * (not part of the PF balance) and the rest to EPF. Optional VPF on top. Interest compounds yearly
 * on the monthly running balance, as EPFO computes it. Wage ceiling ₹25,000 from 17 Sep 2026 (R10).
 */
export interface EpfInput {
  basicMonthly: number;
  currentBalance: number;
  age: number;
  retireAge: number;
  salaryGrowthPct: number;
  ratePct: number;
  vpfPct: number;
  /** Employer contributes on full basic (true) or restricts to the wage ceiling (false). */
  employerOnFullBasic: boolean;
}

export interface EpfYear { age: number; balance: number; contributed: number; interest: number }
export interface EpfResult {
  balanceAtRetirement: number;
  yourContributions: number;
  employerContributions: number;
  interestEarned: number;
  monthlyNow: { employee: number; vpf: number; employerEpf: number; eps: number };
  years: EpfYear[];
}

export const WAGE_CEILING = 25000;
export const EPS_RATE = 0.0833;

export function monthlySplit(basic: number, vpfPct: number, employerOnFullBasic: boolean) {
  const employee = basic * 0.12;
  const vpf = (basic * vpfPct) / 100;
  const employerBase = employerOnFullBasic ? basic : Math.min(basic, WAGE_CEILING);
  const eps = Math.min(basic, WAGE_CEILING) * EPS_RATE;
  const employerEpf = Math.max(0, employerBase * 0.12 - eps);
  return { employee, vpf, employerEpf, eps };
}

export function projectEpf(i: EpfInput): EpfResult {
  const years: EpfYear[] = [];
  let balance = Math.max(0, i.currentBalance);
  let basic = Math.max(0, i.basicMonthly);
  let you = 0, emp = 0, interestTotal = 0;
  const n = Math.max(0, Math.round(i.retireAge - i.age));
  for (let y = 0; y < n; y++) {
    const s = monthlySplit(basic, i.vpfPct, i.employerOnFullBasic);
    const monthly = s.employee + s.vpf + s.employerEpf;
    let interest = 0;
    let running = balance;
    for (let m = 0; m < 12; m++) {
      running += monthly;
      interest += (running * i.ratePct) / 100 / 12;
    }
    balance = running + interest;
    you += (s.employee + s.vpf) * 12;
    emp += s.employerEpf * 12;
    interestTotal += interest;
    years.push({ age: i.age + y + 1, balance, contributed: monthly * 12, interest });
    basic *= 1 + i.salaryGrowthPct / 100;
  }
  return {
    balanceAtRetirement: balance,
    yourContributions: you,
    employerContributions: emp,
    interestEarned: interestTotal,
    monthlyNow: monthlySplit(Math.max(0, i.basicMonthly), i.vpfPct, i.employerOnFullBasic),
    years,
  };
}
