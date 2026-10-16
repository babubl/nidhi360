import { describe, expect, it } from "vitest";
import { edliAmount, familyClaim, type FamilyClaimInput } from "./familyClaim";
import { projectPpf } from "./ppf";
import { retirementCheck, type RetirementInput } from "./retirement";

const fam: FamilyClaimInput = { status: "in-service", avgWage: 20000, avgPfBalance: 200000, continuous12: true, monthsSinceLastContribution: 0, onRolls: true, epsYears: 6, hadSchemeCertificate: false, spouseAlive: true, childrenUnder25: 2, nomineeRegistered: true };

describe("EDLI (R26, R33)", () => {
  it("is 35 × wage plus half the average balance", () => {
    expect(edliAmount(20000, 200000, true).amount).toBe(700000); // 7L + 1L, capped
    expect(edliAmount(5000, 40000, true).formula).toBe(175000 + 20000);
  });
  it("caps the balance part at ₹1.75 lakh and the total at ₹7 lakh", () => {
    expect(edliAmount(10000, 1000000, true).formula).toBe(350000 + 175000);
    expect(edliAmount(25000, 1000000, true).amount).toBe(700000);
  });
  it("pays at least ₹2.5 lakh with 12 months' service, ₹50,000 otherwise", () => {
    expect(edliAmount(3000, 10000, true).amount).toBe(250000);
    expect(edliAmount(1000, 10000, false).amount).toBe(50000);
  });
  it("caps the wage at the ₹25,000 ceiling", () => {
    expect(edliAmount(60000, 0, true).formula).toBe(35 * 25000);
  });
});

describe("Family claim kit", () => {
  it("in-service death: PF, EDLI and family pension regardless of service", () => {
    const r = familyClaim(fam);
    expect(r.edliEligible).toBe(true);
    expect(r.familyPension).toBe(true);
    expect(r.claims.filter((c) => c.applies).map((c) => c.form)).toEqual(["Form 20", "Form 5IF", "Form 10D"]);
    expect(r.spousePensionMin).toBe(1000);
    expect(r.childPensionMin).toBe(250);
  });
  it("after leaving: EDLI only within 6 months and still on rolls", () => {
    expect(familyClaim({ ...fam, status: "left", monthsSinceLastContribution: 4, onRolls: true }).edliEligible).toBe(true);
    expect(familyClaim({ ...fam, status: "left", monthsSinceLastContribution: 4, onRolls: false }).edliEligible).toBe(false);
    expect(familyClaim({ ...fam, status: "left", monthsSinceLastContribution: 9, onRolls: true }).edliEligible).toBe(false);
  });
  it("after leaving with under 10 years and no certificate: withdrawal benefit, not pension", () => {
    const r = familyClaim({ ...fam, status: "left", monthsSinceLastContribution: 12 });
    expect(r.familyPension).toBe(false);
    expect(r.claims.some((c) => c.form === "Form 10C")).toBe(true);
    expect(familyClaim({ ...fam, status: "left", monthsSinceLastContribution: 12, hadSchemeCertificate: true }).familyPension).toBe(true);
  });
  it("orphans get the higher 75% share, at most two children", () => {
    const r = familyClaim({ ...fam, spouseAlive: false, childrenUnder25: 3 });
    expect(r.childPensionMin).toBe(750);
    expect(r.childrenPaid).toBe(2);
  });
  it("pensioner death: no EDLI, PPO needed", () => {
    const r = familyClaim({ ...fam, status: "pensioner" });
    expect(r.edliEligible).toBe(false);
    expect(r.documents.join(" ")).toMatch(/PPO/);
  });
  it("no nominee: legal heir route", () => {
    expect(familyClaim({ ...fam, nomineeRegistered: false }).documents.join(" ")).toMatch(/legal heir/i);
  });
});

describe("PPF planner", () => {
  const base = { openedFy: 2026, currentFy: 2026, balance: 0, yearly: 150000, ratePct: 7.1, earlyInYear: true, extensions: 0, extendWithDeposits: true };
  it("matures after 16 deposits at about ₹43.6 lakh with ₹1.5 lakh a year at 7.1%", () => {
    const r = projectPpf(base);
    expect(r.years).toHaveLength(16);
    expect(r.maturityFy).toBe(2041);
    expect(r.totalDeposits).toBe(2400000);
    // Annuity-due: 1.5L × ((1.071^16 − 1)/0.071) × 1.071
    const expected = 150000 * ((Math.pow(1.071, 16) - 1) / 0.071) * 1.071;
    expect(r.maturityBalance).toBeCloseTo(expected, 0);
  });
  it("loans from FY 3 to 6, withdrawals from FY 7", () => {
    const r = projectPpf(base);
    expect(r.years[1].loanLimit).toBe(0);
    expect(r.years[2].loanLimit).toBeCloseTo(0.25 * r.years[0].balance, 0);
    expect(r.years[6].loanLimit).toBe(0);
    expect(r.years[5].withdrawLimit).toBe(0);
    expect(r.years[6].withdrawLimit).toBeCloseTo(0.5 * Math.min(r.years[2].balance, r.years[5].balance), 0);
  });
  it("caps deposits at ₹1.5 lakh and adds 5-year extensions", () => {
    const r = projectPpf({ ...base, yearly: 300000, extensions: 1, extendWithDeposits: false });
    expect(r.depositCapped).toBe(true);
    expect(r.years).toHaveLength(21);
    expect(r.years[20].deposit).toBe(0);
    expect(r.finalBalance).toBeGreaterThan(r.maturityBalance);
  });
  it("starts from today's balance for an older account", () => {
    const r = projectPpf({ ...base, openedFy: 2020, balance: 1000000 });
    expect(r.years[0].n).toBe(7);
    expect(r.years[0].withdrawLimit).toBeGreaterThan(0);
  });
});

describe("Retirement income check", () => {
  const ri: RetirementInput = { age: 35, retireAge: 58, lifeTo: 85, monthlyExpense: 50000, inflationPct: 6, postReturnPct: 7, basic: 50000, pfBalance: 500000, salaryGrowthPct: 7, epfRatePct: 8.25, vpfPct: 0, epsYears: 10, npsCorpus: 300000, npsMonthly: 5000, npsYears: 5, npsReturnPct: 10, sector: "private", annuityRatePct: 6.5, otherCorpus: 0, otherMonthly: 0, otherReturnPct: 11 };
  it("adds EPF, NPS lump sum and other savings into the corpus", () => {
    const r = retirementCheck(ri);
    expect(r.corpusAtRetirement).toBeCloseTo(r.epf + r.npsLump + r.other, 0);
    expect(r.epsMonthly).toBeGreaterThan(1000);
    expect(r.npsAnnuityMonthly).toBeGreaterThan(0);
  });
  it("needs more corpus with higher expenses and says how much extra to save", () => {
    const low = retirementCheck({ ...ri, monthlyExpense: 20000 });
    const high = retirementCheck({ ...ri, monthlyExpense: 150000 });
    expect(high.corpusNeeded).toBeGreaterThan(low.corpusNeeded);
    expect(high.lasts).toBe(false);
    expect(high.lastsTo).toBeLessThan(85);
    expect(high.extraMonthlyNeeded).toBeGreaterThan(0);
  });
  it("money lasts when the corpus exceeds the need", () => {
    const r = retirementCheck({ ...ri, monthlyExpense: 10000, otherCorpus: 5000000 });
    expect(r.lasts).toBe(true);
    expect(r.readinessPct).toBe(100);
    expect(r.extraMonthlyNeeded).toBe(0);
  });
  it("closing the gap with the suggested saving makes the money last", () => {
    const r = retirementCheck({ ...ri, monthlyExpense: 120000 });
    const fixed = retirementCheck({ ...ri, monthlyExpense: 120000, otherMonthly: r.extraMonthlyNeeded * 1.01 });
    expect(fixed.lasts).toBe(true);
  });
});
