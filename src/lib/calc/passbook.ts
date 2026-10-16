/**
 * Passbook doctor: reads the text of an EPFO member passbook (from the PDF or pasted) and checks it.
 * Everything runs on the device. The parser is deliberately tolerant: passbook PDFs come out of
 * text extraction with columns in a line but spacing, separators and wording vary.
 *
 * A monthly contribution row looks like:
 *   Apr-2025  15-05-2025  CR  Cont. For Due-Month 052025  25,000  15,000  3,000  1,750  1,250
 *   wage month, date credited, type, particulars, EPF wages, EPS wages, employee share, employer share, pension
 *
 * Checks (EPF Scheme 2026, EPS, R10):
 *  - missing wage months between the first and last month shown
 *  - deposits after the 15th of the following month (late)
 *  - employee share below 12% of EPF wages
 *  - employer share + pension not equal to 12% of EPF wages
 *  - pension above 8.33% of the wage ceiling (₹15,000 before Sep 2026, ₹25,000 from then)
 *  - no pension contribution at all
 */
export interface ContributionRow {
  /** Wage month, YYYY-MM. */
  month: string;
  /** Date credited, YYYY-MM-DD, when shown. */
  credited?: string;
  epfWages?: number;
  epsWages?: number;
  employee: number;
  employer: number;
  pension: number;
  arrear: boolean;
}

export type EventKind = "withdrawal" | "transfer-in" | "transfer-out" | "interest";
export interface PassbookEvent { kind: EventKind; date?: string; amount: number; text: string }

export interface ParsedPassbook {
  rows: ContributionRow[];
  events: PassbookEvent[];
  /** Latest balance line found (employee + employer), if any. */
  balance?: { amount: number; asOn?: string; pension?: number };
  establishment?: string;
  lines: number;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const pad = (n: number) => String(n).padStart(2, "0");
const ym = (y: number, m: number) => `${y}-${pad(m)}`;
export const prevMonth = (m: string) => { const [y, mo] = m.split("-").map(Number); return mo === 1 ? ym(y - 1, 12) : ym(y, mo - 1); };
export const nextMonth = (m: string) => { const [y, mo] = m.split("-").map(Number); return mo === 12 ? ym(y + 1, 1) : ym(y, mo + 1); };
export const monthName = (m: string) => { const [y, mo] = m.split("-").map(Number); return `${MONTHS[mo - 1][0].toUpperCase()}${MONTHS[mo - 1].slice(1)} ${y}`; };

const RE_WAGE_MONTH = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\-/.']*((?:19|20)\d{2})\b/i;
const RE_DUE = /due[\s-]*month\s*[:\-]?\s*(\d{2})[\s\-/]?((?:19|20)\d{2})/i;
const RE_DATE = /\b(\d{1,2})[-/.](\d{1,2})[-/.]((?:19|20)\d{2})\b/;
const RE_NUM = /(?<![\w.])-?(?:\d{1,3}(?:,\d{2,3})+|\d+)(?:\.\d+)?(?![\w])/g;

function numbers(s: string): number[] {
  return (s.match(RE_NUM) ?? []).map((t) => Number(t.replace(/,/g, ""))).filter((n) => Number.isFinite(n));
}

/** Remove dates, month tokens and codes so only amounts remain. */
function strip(line: string) {
  return line
    .replace(new RegExp(RE_DUE.source, "gi"), " ")
    .replace(new RegExp(RE_DATE.source, "g"), " ")
    .replace(new RegExp(RE_WAGE_MONTH.source, "gi"), " ")
    .replace(/\b[A-Z]{5}\d{7,}\d*\b/g, " ") // member / establishment IDs like TNMAS0012345000
    .replace(/\b(?:para|section|form)\s*[\d()a-z]+/gi, " ")
    .replace(/\[\s*\d{4}\s*\]/g, " ");
}

const isoDate = (m: RegExpMatchArray) => `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`;

export function parsePassbook(text: string): ParsedPassbook {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  const rows: ContributionRow[] = [];
  const events: PassbookEvent[] = [];
  let balance: ParsedPassbook["balance"];
  let establishment: string | undefined;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (!establishment) {
      const est = line.match(/establishment\s*(?:id\s*\/\s*)?name\s*[:\-]?\s*(?:[A-Z]{5}\d+\s*\/\s*)?(.+)/i);
      if (est && est[1].trim().length > 2) establishment = est[1].trim().slice(0, 80);
    }

    const date = line.match(RE_DATE);
    const nums = numbers(strip(line));

    if (/closing\s*balance|ob\s*int|opening\s*balance|balance\s*as\s*on/i.test(lower)) {
      if (nums.length >= 2) {
        const pension = nums.length >= 3 ? nums[nums.length - 1] : undefined;
        const pair = nums.length >= 3 ? nums.slice(-3, -1) : nums.slice(-2);
        // Closing lines override opening lines; later lines override earlier ones.
        if (!balance || /closing|as\s*on/i.test(lower)) balance = { amount: pair[0] + pair[1], asOn: date ? isoDate(date) : undefined, pension };
      }
      continue;
    }

    if (/int(?:erest)?\.?\s*updated|interest\s*credited/i.test(lower)) {
      if (nums.length) events.push({ kind: "interest", date: date ? isoDate(date) : undefined, amount: nums.slice(-3).reduce((a, b) => a + b, 0), text: line });
      continue;
    }

    const due = line.match(RE_DUE);
    const wm = line.match(RE_WAGE_MONTH);
    const isCont = /cont(?:ribution)?\.?\b|\bcont\s*for/i.test(lower) || (!!due && nums.length >= 3);

    if (isCont && (due || wm) && nums.length >= 3) {
      let month: string;
      if (wm) month = ym(Number(wm[2]), MONTHS.indexOf(wm[1].toLowerCase().slice(0, 3)) + 1);
      else month = prevMonth(ym(Number(due![2]), Number(due![1])));
      const [employee, employer, pension] = nums.slice(-3);
      const row: ContributionRow = { month, employee, employer, pension, arrear: /arrear/i.test(lower) };
      if (date) row.credited = isoDate(date);
      if (nums.length >= 5) { row.epfWages = nums[nums.length - 5]; row.epsWages = nums[nums.length - 4]; }
      rows.push(row);
      continue;
    }

    if (nums.length && /\b(claim|withdraw|final\s*settle|advance|settlement)\b/i.test(lower) && !/\bcr\b/i.test(lower.replace(/\bcredit/g, ""))) {
      events.push({ kind: "withdrawal", date: date ? isoDate(date) : undefined, amount: nums.slice(-3).reduce((a, b) => a + b, 0), text: line });
      continue;
    }
    if (nums.length && /transfer|\btrf\b|\btr\b/i.test(lower)) {
      const out = /\bout\b|\bdr\b|debit/i.test(lower) && !/\bin\b/i.test(lower);
      events.push({ kind: out ? "transfer-out" : "transfer-in", date: date ? isoDate(date) : undefined, amount: nums.slice(-3).reduce((a, b) => a + b, 0), text: line });
    }
  }

  rows.sort((a, b) => a.month.localeCompare(b.month));
  return { rows, events, balance, establishment, lines: lines.length };
}

export type Severity = "high" | "medium" | "info";
export interface Finding { id: string; severity: Severity; title: string; detail: string; months?: string[] }
export type MonthState = "ok" | "late" | "short" | "missing" | "arrear";
export interface MonthCell { month: string; state: MonthState; row?: ContributionRow }

export interface PassbookReport {
  months: MonthCell[];
  first?: string;
  last?: string;
  contributed: { employee: number; employer: number; pension: number };
  epsMonths: number;
  missing: string[];
  late: string[];
  short: string[];
  findings: Finding[];
  /** 0–100: share of months in the range that are on time and correct. */
  score: number;
}

/** Wage ceiling for a wage month (R10: ₹25,000 from 17 Sep 2026). */
export const ceilingFor = (month: string) => (month >= "2026-09" ? 25000 : 15000);

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

export function analysePassbook(p: ParsedPassbook, today = new Date()): PassbookReport {
  const regular = p.rows.filter((r) => !r.arrear);
  const byMonth = new Map<string, ContributionRow[]>();
  for (const r of p.rows) byMonth.set(r.month, [...(byMonth.get(r.month) ?? []), r]);

  const findings: Finding[] = [];
  const contributed = p.rows.reduce((t, r) => ({ employee: t.employee + r.employee, employer: t.employer + r.employer, pension: t.pension + r.pension }), { employee: 0, employer: 0, pension: 0 });
  if (!p.rows.length) return { months: [], contributed, epsMonths: 0, missing: [], late: [], short: [], findings, score: 0 };

  const first = p.rows[0].month;
  const last = p.rows[p.rows.length - 1].month;

  const missing: string[] = [], late: string[] = [], short: string[] = [], splitOff: string[] = [], epsOver: string[] = [];
  const months: MonthCell[] = [];
  for (let m = first; m <= last; m = nextMonth(m)) {
    const rs = byMonth.get(m);
    if (!rs) { missing.push(m); months.push({ month: m, state: "missing" }); continue; }
    const r = rs.find((x) => !x.arrear) ?? rs[0];
    let state: MonthState = r.arrear ? "arrear" : "ok";

    // Due by the 15th of the following month.
    const dueBy = `${nextMonth(m)}-15`;
    if (r.credited && r.credited > dueBy) { late.push(m); state = "late"; }

    if (r.epfWages && r.epfWages > 0) {
      const twelve = r.epfWages * 0.12;
      if (r.employee < twelve - Math.max(2, twelve * 0.01)) { short.push(m); state = "short"; }
      if (!near(r.employer + r.pension, twelve, Math.max(2, twelve * 0.02))) splitOff.push(m);
    }
    const cap = Math.round(ceilingFor(m) * 0.0833);
    if (r.pension > cap + 1) epsOver.push(m);
    months.push({ month: m, state, row: r });
  }

  // Has the employer stopped depositing? Only flag if the last month is recent enough to matter.
  const nowKey = ym(today.getFullYear(), today.getMonth() + 1);
  let gapToNow = 0;
  for (let m = nextMonth(last); m < prevMonth(nowKey) && gapToNow < 240; m = nextMonth(m)) gapToNow++;

  const fmtList = (ms: string[]) => (ms.length <= 4 ? ms.map(monthName).join(", ") : `${ms.slice(0, 3).map(monthName).join(", ")} and ${ms.length - 3} more`);

  if (missing.length) findings.push({ id: "missing", severity: "high", months: missing, title: `${missing.length} ${missing.length === 1 ? "month" : "months"} with no PF deposit`, detail: `No contribution for ${fmtList(missing)}. If you were working and PF was deducted from your salary, your employer owes it with interest. Check your payslips for those months, then complain.` });
  if (late.length) findings.push({ id: "late", severity: "medium", months: late, title: `${late.length} late ${late.length === 1 ? "deposit" : "deposits"}`, detail: `Deposited after the 15th of the following month for ${fmtList(late)}. The money is there, but repeated delays are a warning sign about the employer's finances; the employer owes interest and damages to EPFO.` });
  if (short.length) findings.push({ id: "short", severity: "high", months: short, title: "Your share is below 12% of PF wages", detail: `For ${fmtList(short)}, the employee share is less than 12% of the EPF wages shown. Compare with the PF deducted on your payslip.` });
  if (splitOff.length) findings.push({ id: "split", severity: "medium", months: splitOff, title: "Employer share doesn't add up to 12%", detail: `For ${fmtList(splitOff)}, the employer's EPF share plus pension isn't 12% of the EPF wages shown. Some employers contribute on a lower wage; ask HR how they calculate it.` });
  if (epsOver.length) findings.push({ id: "epsover", severity: "info", months: epsOver, title: "Pension contribution above the usual cap", detail: `For ${fmtList(epsOver)}, the pension share is above 8.33% of the wage ceiling. That's normal only if you opted for higher pension; otherwise ask HR.` });
  if (contributed.pension === 0 && regular.length >= 3) findings.push({ id: "noeps", severity: "medium", title: "No pension (EPS) contribution", detail: "Nothing went to EPS in these months. That's correct only if you joined after Sep 2014 earning above the old ₹15,000 ceiling. Members earning up to ₹25,000 are now being brought into EPS, so check with HR." });
  if (gapToNow >= 2 && today.getTime() - new Date(last + "-01").getTime() < 5 * 365 * 86400000) findings.push({ id: "stopped", severity: "info", title: `No deposits shown after ${monthName(last)}`, detail: "If you still work at this company, download the latest passbook. If it's current, your employer may have stopped depositing: check your payslips." });

  const withdrawals = p.events.filter((e) => e.kind === "withdrawal");
  if (withdrawals.length) findings.push({ id: "withdrawals", severity: "info", title: `${withdrawals.length} ${withdrawals.length === 1 ? "withdrawal" : "withdrawals"} in this passbook`, detail: "Make sure you recognise each one. A withdrawal you didn't make is fraud: report it on EPFiGMS and to your bank immediately." });

  const good = months.filter((c) => c.state === "ok" || c.state === "arrear").length;
  const epsMonths = p.rows.filter((r) => !r.arrear && r.pension > 0).length;
  if (!findings.some((f) => f.severity !== "info")) findings.unshift({ id: "clean", severity: "info", title: "Every month is in, on time and correct", detail: `${months.length} months checked from ${monthName(first)} to ${monthName(last)}. Keep checking once a quarter.` });

  return { months, first, last, contributed, epsMonths, missing, late, short, findings, score: months.length ? Math.round((good / months.length) * 100) : 0 };
}

/** A realistic sample passbook with a few problems planted, for "try it" without your own file. */
export const SAMPLE_PASSBOOK = `Employees' Provident Fund Organisation
Member Passbook
Establishment ID/Name TNMAS0012345000 / ACME SOFTWARE SERVICES PRIVATE LIMITED
Member ID/Name TNMAS00123450000012345 / SAMPLE MEMBER
Wage Month Transaction Date Transaction Type Particulars EPF Wages EPS Wages Employee Share Employer Share Pension
OB Int. Updated upto 31/03/2025 2,10,400 74,560 61,250
Apr-2025 14-05-2025 CR Cont. For Due-Month 052025 22,000 15,000 2,640 1,390 1,250
May-2025 13-06-2025 CR Cont. For Due-Month 062025 22,000 15,000 2,640 1,390 1,250
Jun-2025 15-07-2025 CR Cont. For Due-Month 072025 22,000 15,000 2,640 1,390 1,250
Jul-2025 26-08-2025 CR Cont. For Due-Month 082025 22,000 15,000 2,640 1,390 1,250
Aug-2025 12-09-2025 CR Cont. For Due-Month 092025 22,000 15,000 2,640 1,390 1,250
Oct-2025 14-11-2025 CR Cont. For Due-Month 112025 22,000 15,000 2,640 1,390 1,250
Nov-2025 15-12-2025 CR Cont. For Due-Month 122025 22,000 15,000 2,640 1,390 1,250
Dec-2025 12-01-2026 CR Cont. For Due-Month 012026 22,000 15,000 2,200 1,390 1,250
Jan-2026 14-02-2026 CR Cont. For Due-Month 022026 22,000 15,000 2,640 1,390 1,250
Feb-2026 13-03-2026 CR Cont. For Due-Month 032026 22,000 15,000 2,640 1,390 1,250
Mar-2026 09-04-2026 CR Cont. For Due-Month 042026 22,000 15,000 2,640 1,390 1,250
Total Contributions for the year [ 2025 ] 28,600 15,290 13,750
Int. Updated upto 31/03/2026 21,860 7,240 0
Closing Balance as on 31/03/2026 2,60,860 96,890 75,000`;
