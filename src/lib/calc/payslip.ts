/**
 * Payslip PF checker.
 *  - PF wages: basic + DA + retaining allowance, but under the labour codes (R35, in force 21 Nov 2025)
 *    allowances above 50% of total pay are added back, so wages are at least half of total pay.
 *  - Employee 12% of PF wages. If wages exceed the ceiling (₹25,000, R10) the employer may restrict both
 *    shares to 12% of the ceiling (₹3,000). Anything above 12% is voluntary PF (VPF).
 *  - Employer 12%: 8.33% of wages up to the ceiling to EPS (max ₹2,083), the rest to EPF.
 *    Employer also pays EDLI (0.5% of wages up to the ceiling) and admin charges (0.5%); never the employee.
 */
import { WAGE_CEILING, EPS_RATE } from "./epfCorpus";

export interface PayslipInput {
  /** Basic + DA (+ retaining allowance), monthly. */
  basicDa: number;
  /** Total monthly pay before deductions (gross), excluding the employer's PF. */
  totalPay: number;
  /** "PF" / "EPF" deducted from you on the payslip. */
  employeePf: number;
  /** Payslip also shows the employer's PF as a deduction from your gross. */
  employerDeducted: boolean;
  /** Member of EPS (pension). */
  epsMember: boolean;
}

export type Level = "ok" | "warn" | "bad" | "info";
export interface Check { id: string; level: Level; title: string; detail: string }

export interface PayslipResult {
  pfWages: number;
  addedBack: number;
  /** The minimum your 12% can legally be (restricted to the ceiling when wages exceed it). */
  minEmployee: number;
  fullEmployee: number;
  vpf: number;
  restricted: boolean;
  employer: { eps: number; epf: number; total: number; edli: number; admin: number };
  /** Total going into your PF account each month (your share incl. VPF + employer EPF). */
  monthlyToPf: number;
  checks: Check[];
}

const r0 = (n: number) => Math.round(n);

export function checkPayslip(i: PayslipInput): PayslipResult {
  const basicDa = Math.max(0, i.basicDa);
  const total = Math.max(basicDa, i.totalPay);
  const pfWages = Math.max(basicDa, total * 0.5);
  const addedBack = pfWages - basicDa;
  const capped = Math.min(pfWages, WAGE_CEILING);
  const fullEmployee = r0(pfWages * 0.12);
  const minEmployee = r0(capped * 0.12);
  const emp = Math.max(0, i.employeePf);
  const restricted = pfWages > WAGE_CEILING && emp < fullEmployee - 2;
  const employerBase = restricted ? capped : pfWages;
  const vpf = Math.max(0, emp - fullEmployee) > 2 ? emp - fullEmployee : 0;

  const eps = i.epsMember ? r0(capped * EPS_RATE) : 0;
  const total12 = r0(employerBase * 0.12);
  const employer = { eps, epf: total12 - eps, total: total12, edli: r0(capped * 0.005), admin: r0(employerBase * 0.005) };
  const checks: Check[] = [];

  if (emp < minEmployee - 2) {
    checks.push({ id: "low", level: "bad", title: `Your PF deduction looks too low by ${"₹" + (minEmployee - emp).toLocaleString("en-IN")} a month`, detail: `12% of your PF wages${pfWages > WAGE_CEILING ? " (or of the ₹25,000 ceiling, if your employer restricts it)" : ""} is ₹${minEmployee.toLocaleString("en-IN")}. Less than that means less is being saved for you and your employer may be underpaying too. Ask HR how it's calculated.` });
  } else if (restricted) {
    checks.push({ id: "restricted", level: "info", title: "PF is calculated on the ₹25,000 ceiling, not your full wages", detail: `That's allowed when both your and your employer's shares are restricted. Full 12% would be ₹${fullEmployee.toLocaleString("en-IN")}. You can ask for PF on full wages, or add VPF, for more tax-free savings.` });
  } else {
    checks.push({ id: "ok12", level: "ok", title: "Your 12% PF deduction is right", detail: `₹${Math.min(emp, fullEmployee).toLocaleString("en-IN")} is 12% of PF wages of ₹${r0(pfWages).toLocaleString("en-IN")}.` });
  }

  if (vpf) checks.push({ id: "vpf", level: "ok", title: `₹${r0(vpf).toLocaleString("en-IN")} a month is voluntary PF (VPF)`, detail: "It earns the EPF rate. Interest on your own contributions above ₹2.5 lakh a year is taxable." });

  if (addedBack > 1) {
    checks.push({ id: "fifty", level: "warn", title: "Basic + DA is under half your pay", detail: `Under the labour codes, allowances above 50% of your pay count as wages. Your PF wages should be about ₹${r0(pfWages).toLocaleString("en-IN")}, not ₹${r0(basicDa).toLocaleString("en-IN")}${pfWages > WAGE_CEILING && basicDa >= WAGE_CEILING ? " (if your employer restricts to the ceiling, the deduction may not change)" : ""}. Ask HR whether your PF uses the new wage definition.` });
  }

  if (i.employerDeducted) {
    checks.push({ id: "employerdeducted", level: "warn", title: "Employer's PF is being taken from your gross pay", detail: "Common in CTC-based salaries, but it means your package, not the company, pays the employer's share. The law says the employer's share must not reduce your wages. Ask HR to explain your CTC; check it before accepting an offer." });
  } else {
    checks.push({ id: "employerok", level: "info", title: "Your employer adds its own 12% on top", detail: `About ₹${employer.total.toLocaleString("en-IN")} a month: ₹${employer.eps.toLocaleString("en-IN")} to your pension (EPS) and ₹${employer.epf.toLocaleString("en-IN")} to your PF. Check your passbook shows both.` });
  }

  if (!i.epsMember && pfWages <= WAGE_CEILING) checks.push({ id: "noeps", level: "warn", title: "You should probably be in EPS", detail: "With PF wages up to ₹25,000, employees are now being brought into the pension scheme. Ask HR why no EPS share is shown." });

  checks.push({ id: "charges", level: "info", title: "Charges you should never pay", detail: `EDLI insurance (about ₹${employer.edli.toLocaleString("en-IN")}) and EPF admin charges (about ₹${employer.admin.toLocaleString("en-IN")}) are paid by the employer. If your payslip deducts them from you, that's wrong.` });

  return { pfWages, addedBack, minEmployee, fullEmployee, vpf, restricted, employer, monthlyToPf: emp + employer.epf, checks };
}
