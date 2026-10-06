/**
 * Monthly PF check-up. Pure functions behind the "once a month" habit:
 * compare each month's passbook balance with what should have been credited,
 * surface rule changes since the last visit, and list what matters this month.
 * All data stays on the device; nothing here needs a login or a UAN.
 */
import { monthlySplit } from "./epfCorpus";
import type { Rule } from "../../data/types";

export interface LogEntry { month: string; balance: number } // month = "YYYY-MM"

export type Verdict = "baseline" | "ok" | "low" | "fell";
export interface Reading { month: string; balance: number; delta?: number; expected?: number; verdict: Verdict }

/** What should land in the passbook each month: your 12% (+ VPF) plus the employer's EPF share. */
export function expectedMonthlyCredit(basic: number, vpfPct: number, employerOnFullBasic: boolean) {
  const s = monthlySplit(Math.max(0, basic), vpfPct, employerOnFullBasic);
  return Math.round(s.employee + s.vpf + s.employerEpf);
}

const monthIndex = (m: string) => { const [y, mo] = m.split("-").map(Number); return y * 12 + (mo - 1); };
export const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export const monthLabel = (m: string) => new Date(m + "-01T00:00:00").toLocaleDateString("en-IN", { month: "short", year: "numeric" });

/** Tolerance: 15% under expected still counts as fine (salary changes, rounding, LOP days). */
export function analyse(entries: LogEntry[], expected: number): Reading[] {
  const sorted = [...entries].sort((a, b) => a.month.localeCompare(b.month));
  return sorted.map((e, i) => {
    if (i === 0) return { month: e.month, balance: e.balance, verdict: "baseline" };
    const prev = sorted[i - 1];
    const gap = Math.max(1, monthIndex(e.month) - monthIndex(prev.month));
    const delta = e.balance - prev.balance;
    const exp = expected * gap;
    const verdict: Verdict = delta < 0 ? "fell" : expected > 0 && delta < exp * 0.85 ? "low" : "ok";
    return { month: e.month, balance: e.balance, delta, expected: exp, verdict };
  });
}

/** Consecutive months logged, ending this month or last month (so the streak survives until the 1st). */
export function streak(entries: LogEntry[], now: Date): number {
  const have = new Set(entries.map((e) => monthIndex(e.month)));
  let cur = monthIndex(monthKey(now));
  if (!have.has(cur)) cur -= 1;
  let n = 0;
  while (have.has(cur)) { n++; cur--; }
  return n;
}

/** Rules that came into force (or were announced) after the person's last visit. */
export function changesSince(lastVisit: string | undefined, rules: Rule[]): Rule[] {
  if (!lastVisit) return [];
  return rules.filter((r) => r.effective > lastVisit).sort((a, b) => b.effective.localeCompare(a.effective));
}

export interface MonthTask { title: string; detail: string; path: string }

/** Things that genuinely matter in a given calendar month (1–12). Always includes the monthly passbook check. */
export function monthTasks(month: number): MonthTask[] {
  const t: MonthTask[] = [{ title: "Check last month's PF credit", detail: "Your employer deposits by the 15th; it usually shows in the passbook a few days later. Confirm the amount matches your payslip.", path: "/monthly" }];
  const by: Record<number, MonthTask[]> = {
    1: [{ title: "Declare tax-saving investments to payroll", detail: "Employers collect proofs now. Check NPS (80CCD(1B)) and VPF before the deadline.", path: "/nps/tax" }],
    2: [{ title: "Watch for the EPF interest rate", detail: "The EPFO board usually proposes the yearly rate around now. Your balance projection depends on it.", path: "/pf/calculator" }],
    3: [{ title: "Last month to save tax this year", detail: "Tax-saving contributions must be made by 31 March to count for this financial year.", path: "/nps/tax" }],
    4: [{ title: "New financial year: reset your plan", detail: "Review your regime choice, NPS contribution and VPF for the year ahead.", path: "/nps/tax" }],
    6: [{ title: "Check last year's interest credit", detail: "Interest for the previous year is credited some months after year-end. See it in the passbook.", path: "/pf/health-check" }],
    7: [{ title: "File your tax return", detail: "The usual due date is 31 July. Taxable PF interest (over ₹2.5 lakh of own contributions) is reported here.", path: "/answers" }],
    9: [{ title: "New ₹25,000 wage ceiling applies", detail: "From 17 September 2026 the PF wage ceiling is ₹25,000. Check how your payslip and pension change.", path: "/pf/pension" }],
    10: [{ title: "Run a full PF account check", detail: "A yearly 2-minute check of KYC, bank and nominee prevents rejected claims later.", path: "/pf/health-check" }],
    11: [{ title: "Pensioners: submit the life certificate", detail: "EPS pension stops if the yearly life certificate lapses. November is the standard window.", path: "/answers/life-certificate" }],
    12: [{ title: "Review your NPS", detail: "Check your allocation, contribution and the new exit rules once a year.", path: "/nps/retirement" }],
  };
  return [...t, ...(by[month] ?? [])];
}
