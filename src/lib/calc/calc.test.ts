import { describe, expect, it } from "vitest";
import { estimateWithdrawal } from "./pfWithdrawal";
import { averagePensionableSalary, estimateEpsPension } from "./epsPension";
import { exitSplit, npsTaxSaving, projectCorpus } from "./nps";
import { healthScore, fixList } from "./health";
import { matchRejection, containsSensitive } from "./rejection";

const base = { purpose: "illness" as const, balance: 400000, membershipMonths: 36, continuousServiceYears: 3, age: 30, monthsUnemployed: 0, panLinked: true };

describe("PF withdrawal (EPF Scheme 2026)", () => {
  it("keeps 25% in the account on a partial withdrawal", () => {
    const r = estimateWithdrawal(base);
    expect(r.amount).toBe(300000);
    expect(r.remains).toBe(100000);
    expect(r.form).toBe("Form 31");
    expect(r.tds).toBe(0);
  });
  it("needs 12 months of membership for partial withdrawals", () => {
    expect(estimateWithdrawal({ ...base, membershipMonths: 11 }).eligible).toBe(false);
  });
  it("allows only 75% before 12 months of unemployment", () => {
    const r = estimateWithdrawal({ ...base, purpose: "unemployed", monthsUnemployed: 6 });
    expect(r.amount).toBe(300000);
    expect(r.isFinalSettlement).toBe(false);
  });
  it("allows full settlement after 12 months of unemployment, with 10% TDS under 5 years", () => {
    const r = estimateWithdrawal({ ...base, purpose: "unemployed", monthsUnemployed: 12 });
    expect(r.amount).toBe(400000);
    expect(r.form).toBe("Form 19");
    expect(r.tds).toBe(40000);
  });
  it("no TDS after 5 years of continuous service", () => {
    expect(estimateWithdrawal({ ...base, purpose: "unemployed", monthsUnemployed: 13, continuousServiceYears: 5 }).tds).toBe(0);
  });
  it("no TDS at or below ₹50,000", () => {
    expect(estimateWithdrawal({ ...base, purpose: "abroad", balance: 50000 }).tds).toBe(0);
  });
  it("retirement settlement only from 55", () => {
    expect(estimateWithdrawal({ ...base, purpose: "retire", age: 54 }).eligible).toBe(false);
    expect(estimateWithdrawal({ ...base, purpose: "retire", age: 56 }).amount).toBe(400000);
  });
  it("computes interest given up to age 58 at 8.25%", () => {
    const r = estimateWithdrawal({ ...base, age: 57 });
    expect(r.foregoneAt58).toBeCloseTo(300000 * 1.0825, 0);
  });
});

describe("EPS pension", () => {
  const today = new Date("2026-10-05T00:00:00");
  it("no pension under 10 years of service", () => {
    expect(estimateEpsPension({ salary: 30000, serviceSoFar: 3, currentAge: 50, leaveAge: 55, startAge: 58, today }).eligible).toBe(false);
  });
  it("uses ₹15,000 cap for months before 17 Sep 2026", () => {
    expect(averagePensionableSalary(40000, new Date("2026-09-01T00:00:00"))).toBe(15000);
  });
  it("uses ₹25,000 cap for months after the change", () => {
    expect(averagePensionableSalary(40000, new Date("2032-01-01T00:00:00"))).toBe(25000);
  });
  it("applies formula with 2-year weightage at 58 for 20+ years", () => {
    // Leaves in 6 years (2032): all last 60 months after the ceiling change → ₹25,000.
    const r = estimateEpsPension({ salary: 50000, serviceSoFar: 24, currentAge: 52, leaveAge: 58, startAge: 58, today });
    expect(r.totalService).toBe(30);
    expect(r.weightage).toBe(2);
    expect(r.monthlyPension).toBeCloseTo((25000 * 32) / 70, 0);
  });
  it("reduces 4% a year for early pension and has no weightage", () => {
    const r = estimateEpsPension({ salary: 15000, serviceSoFar: 20, currentAge: 55, leaveAge: 55, startAge: 55, today });
    expect(r.weightage).toBe(0);
    expect(r.adjustmentPct).toBe(-12);
    expect(r.monthlyPension).toBeCloseTo(((15000 * 20) / 70) * 0.88, 0);
  });
  it("applies the ₹1,000 minimum", () => {
    expect(estimateEpsPension({ salary: 3000, serviceSoFar: 10, currentAge: 58, leaveAge: 58, startAge: 58, today }).monthlyPension).toBe(1000);
  });
});

describe("NPS exit (Dec 2025 rules)", () => {
  it("private, >₹12L: 80/20 with only 60% tax-free", () => {
    const s = exitSplit("private", 5000000, true);
    expect(s.lumpSumMax).toBe(4000000);
    expect(s.annuityMin).toBe(1000000);
    expect(s.taxFreeLump).toBe(3000000);
    expect(s.taxableLump).toBe(1000000);
  });
  it("government stays at 60/40", () => {
    const s = exitSplit("government", 5000000, true);
    expect(s.lumpSumMax).toBe(3000000);
    expect(s.annuityMin).toBe(2000000);
  });
  it("up to ₹8L: 100% lump sum", () => {
    expect(exitSplit("private", 800000, true).lumpSumMax).toBe(800000);
  });
  it("premature above ₹5L: 20/80", () => {
    const s = exitSplit("private", 1000000, false);
    expect(s.lumpSumMax).toBe(200000);
    expect(s.annuityMin).toBe(800000);
  });
  it("private subscriber with 15 years gets normal exit before 60", () => {
    const p = projectCorpus({ age: 45, yearsInNps: 5, corpus: 1000000, monthlyContribution: 10000, annualStepUpPct: 0, expectedReturnPct: 8, exitAge: 55, sector: "private" });
    expect(p.isNormalExit).toBe(true);
  });
  it("projection with zero return equals contributions", () => {
    const p = projectCorpus({ age: 30, yearsInNps: 0, corpus: 0, monthlyContribution: 1000, annualStepUpPct: 0, expectedReturnPct: 0, exitAge: 31, sector: "private" });
    expect(p.corpusAtExit).toBeCloseTo(12000, 6);
  });
});

describe("NPS tax", () => {
  it("new regime: employer up to 14% only", () => {
    const t = npsTaxSaving({ regime: "new", basic: 1000000, employerPct: 10, ownContribution: 50000, used80C: 0, slabPct: 30 });
    expect(t.employerDeduction).toBe(100000);
    expect(t.own80C + t.own1B).toBe(0);
    expect(t.taxSaved).toBeCloseTo(31200, 0);
  });
  it("old regime: employer capped at 10%, own split across 80C and 1B", () => {
    const t = npsTaxSaving({ regime: "old", basic: 1000000, employerPct: 14, ownContribution: 100000, used80C: 120000, slabPct: 30 });
    expect(t.employerDeduction).toBe(100000);
    expect(t.employerOverCap).toBe(true);
    expect(t.own80C).toBe(30000);
    expect(t.own1B).toBe(50000);
  });
});

describe("Health check and rejection decoder", () => {
  it("perfect answers score 100", () => {
    const all = Object.fromEntries(["uan","aadhaar","pan","bank","match","oneuan","merged","doe","nominee","deposits","mobile"].map((k) => [k, "yes" as const]));
    expect(healthScore(all)).toBe(100);
    expect(fixList(all)).toHaveLength(0);
  });
  it("matches a bank rejection message", () => {
    expect(matchRejection("Claim rejected: cheque image not legible, bank account details not verified")[0].reason.id).toBe("bank");
  });
  it("matches date of exit", () => {
    expect(matchRejection("DATE OF EXIT NOT AVAILABLE")[0].reason.id).toBe("doe");
  });
  it("flags Aadhaar and PAN", () => {
    expect(containsSensitive("my aadhaar 1234 5678 9012")).toBe(true);
    expect(containsSensitive("PAN ABCDE1234F")).toBe(true);
    expect(containsSensitive("Can I withdraw after 5 years?")).toBe(false);
  });
});

import { draftGrievance } from "./grievance";
describe("Grievance drafter", () => {
  const today = new Date("2026-10-06T00:00:00");
  it("flags claims past the 20-day deadline", () => {
    const g = draftGrievance({ issue: "delayed", claimId: "ABC1", filedOn: "2026-09-01", today });
    expect(g.daysPending).toBe(35);
    expect(g.overDeadline).toBe(true);
    expect(g.body).toContain("ABC1");
    expect(g.body).toContain("20 days");
  });
  it("is within the deadline before day 21", () => {
    expect(draftGrievance({ issue: "transferStuck", filedOn: "2026-09-20", today }).overDeadline).toBe(false);
  });
  it("uses placeholders instead of asking for IDs", () => {
    const g = draftGrievance({ issue: "notDeposited", today });
    expect(g.body).toContain("[establishment name]");
    expect(g.body).not.toMatch(/\d{12}/);
  });
});

import { buildReminders, toIcs } from "./reminders";
describe("Reminder calendar", () => {
  const today = new Date("2026-10-06T00:00:00Z");
  it("builds job-leaver milestones from the last working day", () => {
    const r = buildReminders({ lastWorkingDay: "2026-09-15", today });
    const dates = Object.fromEntries(r.map((x) => [x.title, x.date]));
    expect(dates["PF: partial withdrawal now possible"]).toBe("2026-10-15");
    expect(dates["PF: mark your exit date"]).toBe("2026-11-15");
    expect(dates["PF: full settlement now possible"]).toBe("2027-09-15");
    expect(dates["EPS: withdrawal benefit now possible"]).toBe("2029-09-15");
  });
  it("drops past milestones but keeps recurring ones", () => {
    const r = buildReminders({ lastWorkingDay: "2024-01-01", today });
    expect(r.some((x) => x.title.startsWith("PF: partial"))).toBe(false);
    expect(r.some((x) => x.recurring === "quarterly")).toBe(true);
  });
  it("adds NPS decision 15 days before 60", () => {
    const r = buildReminders({ dob: "1970-03-10", hasNps: true, today });
    expect(r.find((x) => x.title.startsWith("NPS"))?.date).toBe("2030-02-23");
  });
  it("produces a valid calendar file", () => {
    const ics = toIcs(buildReminders({ pensioner: true, today }), "https://x.test/nidhi360/", today);
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(ics).toContain("RRULE:FREQ=YEARLY");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261101");
    expect(ics.trim().endsWith("END:VCALENDAR")).toBe(true);
  });
});
