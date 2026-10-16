import { describe, expect, it } from "vitest";
import { checkPayslip } from "./payslip";

const base = { basicDa: 20000, totalPay: 35000, employeePf: 2400, employerDeducted: false, epsMember: true };
const ids = (r: ReturnType<typeof checkPayslip>) => r.checks.map((c) => c.id);

describe("Payslip PF checker", () => {
  it("accepts a correct 12% with basic above half of pay", () => {
    const r = checkPayslip(base);
    expect(r.pfWages).toBe(20000);
    expect(ids(r)).toContain("ok12");
    expect(ids(r)).not.toContain("fifty");
    expect(r.employer).toMatchObject({ eps: 1666, epf: 2400 - 1666, total: 2400 });
  });
  it("applies the 50% wage rule when basic is under half of pay", () => {
    const r = checkPayslip({ ...base, basicDa: 15000, totalPay: 40000, employeePf: 1800 });
    expect(r.pfWages).toBe(20000);
    expect(r.addedBack).toBe(5000);
    expect(ids(r)).toEqual(expect.arrayContaining(["fifty", "low"]));
  });
  it("treats ₹3,000 on high wages as restricted to the ceiling, not too low", () => {
    const r = checkPayslip({ ...base, basicDa: 60000, totalPay: 100000, employeePf: 3000 });
    expect(r.restricted).toBe(true);
    expect(ids(r)).toContain("restricted");
    expect(r.employer).toMatchObject({ eps: 2083, total: 3000, epf: 917 });
  });
  it("spots VPF above 12%", () => {
    const r = checkPayslip({ ...base, employeePf: 4400 });
    expect(r.vpf).toBe(2000);
    expect(ids(r)).toContain("vpf");
  });
  it("flags employer PF taken from gross, and missing EPS", () => {
    const r = checkPayslip({ ...base, employerDeducted: true, epsMember: false });
    expect(ids(r)).toEqual(expect.arrayContaining(["employerdeducted", "noeps"]));
    expect(r.employer.eps).toBe(0);
  });
  it("caps EDLI at 0.5% of the ceiling", () => {
    expect(checkPayslip({ ...base, basicDa: 90000, totalPay: 120000, employeePf: 10800 }).employer.edli).toBe(125);
  });
});
