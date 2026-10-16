import { describe, expect, it } from "vitest";
import { addDaysIso, sortClaims, viewClaim, type TrackedClaim } from "./claims";

const today = new Date(2026, 9, 17); // 17 Oct 2026
const c = (over: Partial<TrackedClaim>): TrackedClaim => ({ key: "k", claimId: "TNMAS260900012345", kind: "advance", filedOn: "2026-10-10", state: "pending", ...over });

describe("Claim tracker (R6: 20 days)", () => {
  it("counts days and the due date", () => {
    const v = viewClaim(c({}), today);
    expect(v.daysPending).toBe(7);
    expect(v.dueOn).toBe("2026-10-30");
    expect(v.stage).toBe("on-track");
  });
  it("is due soon in the last 5 days and overdue after 20", () => {
    expect(viewClaim(c({ filedOn: "2026-09-30" }), today).stage).toBe("due-soon");
    const v = viewClaim(c({ filedOn: "2026-09-20" }), today);
    expect(v.stage).toBe("overdue");
    expect(v.headline).toMatch(/7 days past/);
    expect(v.action!.to).toContain("issue=delayed");
    expect(v.action!.to).toContain("filed=2026-09-20");
  });
  it("uses the transfer complaint for stuck transfers", () => {
    expect(viewClaim(c({ filedOn: "2026-08-01", kind: "transfer" }), today).action!.to).toContain("issue=transferStuck");
  });
  it("flags settled-but-not-credited after 5 days", () => {
    expect(viewClaim(c({ state: "settled", changedOn: "2026-10-14" }), today).stage).toBe("settled-waiting");
    const v = viewClaim(c({ state: "settled", changedOn: "2026-10-05" }), today);
    expect(v.stage).toBe("settled-not-credited");
    expect(v.action!.to).toContain("settledNotCredited");
  });
  it("sends rejected claims to the fixer", () => {
    expect(viewClaim(c({ state: "rejected" }), today).action!.to).toBe("/pf/claim-rejected");
  });
  it("sorts the most urgent first", () => {
    const list = [c({ key: "a" }), c({ key: "b", state: "credited" }), c({ key: "d", filedOn: "2026-09-01" })];
    expect(sortClaims(list, today).map((x) => x.key)).toEqual(["d", "a", "b"]);
  });
  it("adds days across month ends", () => {
    expect(addDaysIso("2026-12-25", 20)).toBe("2027-01-14");
  });
});
