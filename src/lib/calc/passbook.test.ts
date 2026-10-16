import { describe, expect, it } from "vitest";
import { analysePassbook, parsePassbook, SAMPLE_PASSBOOK } from "./passbook";

const today = new Date("2026-04-20T00:00:00");

describe("Passbook parser", () => {
  const p = parsePassbook(SAMPLE_PASSBOOK);
  it("reads every monthly contribution row with wages and shares", () => {
    expect(p.rows).toHaveLength(11);
    expect(p.rows[0]).toMatchObject({ month: "2025-04", credited: "2025-05-14", epfWages: 22000, epsWages: 15000, employee: 2640, employer: 1390, pension: 1250 });
  });
  it("reads the closing balance (employee + employer) and establishment", () => {
    expect(p.balance).toMatchObject({ amount: 260860 + 96890, asOn: "2026-03-31", pension: 75000 });
    expect(p.establishment).toMatch(/ACME SOFTWARE/);
  });
  it("records interest as an event, not a contribution", () => {
    expect(p.events.filter((e) => e.kind === "interest")).toHaveLength(1);
  });
  it("falls back to the due month when the wage month isn't shown", () => {
    const r = parsePassbook("15/07/2025 CR Cont. For Due-Month 072025 20000 15000 2400 1150 1250");
    expect(r.rows[0]).toMatchObject({ month: "2025-06", credited: "2025-07-15", employee: 2400 });
  });
  it("handles Indian digit grouping and odd spacing", () => {
    const r = parsePassbook("  Mar - 2026   10/04/2026  CR   Cont. For Due-Month 042026   1,25,000   15,000   15,000   13,750   1,250 ");
    expect(r.rows[0]).toMatchObject({ month: "2026-03", epfWages: 125000, employee: 15000, employer: 13750 });
  });
  it("spots withdrawals and transfers", () => {
    const r = parsePassbook("12-08-2025 DR Claim: Against PARA 68(B)(1)(a) 40,000 35,000 0\n02-01-2025 CR Transfer In from TNMAS0099999000 1,20,000 80,000 0");
    expect(r.events.map((e) => e.kind)).toEqual(["withdrawal", "transfer-in"]);
    expect(r.events[0].amount).toBe(75000);
  });
  it("ignores text that isn't a passbook", () => {
    expect(parsePassbook("Hello, this is my salary slip for April 2025. Net pay 45,000").rows).toHaveLength(0);
  });
});

describe("Passbook checks", () => {
  const r = analysePassbook(parsePassbook(SAMPLE_PASSBOOK), today);
  it("finds the missing month", () => {
    expect(r.missing).toEqual(["2025-09"]);
    expect(r.findings[0].id).toBe("missing");
  });
  it("finds the late deposit (after the 15th of the next month)", () => {
    expect(r.late).toEqual(["2025-07"]);
    expect(r.months.find((m) => m.month === "2025-06")!.state).toBe("ok"); // 15th itself is on time
  });
  it("finds a short employee share", () => {
    expect(r.short).toEqual(["2025-12"]);
  });
  it("totals contributions, counts EPS months and scores the account", () => {
    expect(r.contributed.pension).toBe(11 * 1250);
    expect(r.epsMonths).toBe(11);
    expect(r.months).toHaveLength(12);
    expect(r.score).toBe(Math.round((9 / 12) * 100));
  });
  it("flags pension above 8.33% of the ceiling, using ₹25,000 from Sep 2026", () => {
    const a = analysePassbook(parsePassbook("Aug-2026 10-09-2026 CR Cont. For Due-Month 092026 30000 30000 3600 1100 2500"), today);
    expect(a.findings.some((f) => f.id === "epsover")).toBe(true);
    const b = analysePassbook(parsePassbook("Oct-2026 10-11-2026 CR Cont. For Due-Month 112026 30000 25000 3600 1517 2083"), today);
    expect(b.findings.some((f) => f.id === "epsover")).toBe(false);
  });
  it("says so when everything is fine", () => {
    const clean = [1, 2, 3].map((m) => `${["Jan", "Feb", "Mar"][m - 1]}-2026 10-0${m + 1}-2026 CR Cont. For Due-Month 0${m + 1}2026 20000 15000 2400 1150 1250`).join("\n");
    const a = analysePassbook(parsePassbook(clean), today);
    expect(a.findings[0].id).toBe("clean");
    expect(a.score).toBe(100);
  });
});
