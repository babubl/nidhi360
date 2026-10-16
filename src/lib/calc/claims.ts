/**
 * Claim tracker. The EPF Scheme 2026 gives EPFO 20 days to settle a complete claim (R6), with
 * penal interest for delay. Settled claims usually reach the bank in a few working days.
 * Pure functions: given a claim and today's date, say where it stands and what to do next.
 */
export type ClaimKind = "advance" | "final" | "transfer" | "pension" | "death";
export type ClaimState = "pending" | "settled" | "rejected" | "credited";

export const KIND_LABELS: Record<ClaimKind, string> = {
  advance: "Partial withdrawal (Form 31)",
  final: "Full settlement (Form 19)",
  transfer: "Transfer (Form 13)",
  pension: "Pension or EPS withdrawal (10C/10D)",
  death: "Death claim (Form 20 / 5IF / 10D)",
};

export interface TrackedClaim {
  key: string;
  claimId: string;
  kind: ClaimKind;
  /** ISO date filed. */
  filedOn: string;
  state: ClaimState;
  /** ISO date the state last changed (settled or rejected date). */
  changedOn?: string;
}

export type Stage = "on-track" | "due-soon" | "overdue" | "settled-waiting" | "settled-not-credited" | "rejected" | "done";

export interface ClaimView {
  stage: Stage;
  daysPending: number;
  dueOn: string;
  daysLeft: number;
  /** 0–1 share of the 20-day window used, capped at 1. */
  progress: number;
  headline: string;
  next: string;
  action?: { to: string; label: string };
}

export const SETTLEMENT_DAYS = 20;
const DAY = 86_400_000;
const parse = (iso: string) => new Date(iso + "T00:00:00");
export const addDaysIso = (iso: string, n: number) => { const d = parse(iso); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const days = (from: string, to: Date) => Math.max(0, Math.floor((new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime() - parse(from).getTime()) / DAY));

function grievanceLink(c: TrackedClaim, issue: string) {
  const q = new URLSearchParams({ issue, claim: c.claimId, filed: c.filedOn });
  return `/pf/grievance?${q.toString()}`;
}

export function viewClaim(c: TrackedClaim, today = new Date()): ClaimView {
  const daysPending = days(c.filedOn, today);
  const dueOn = addDaysIso(c.filedOn, SETTLEMENT_DAYS);
  const daysLeft = SETTLEMENT_DAYS - daysPending;
  const progress = Math.min(1, daysPending / SETTLEMENT_DAYS);
  const base = { daysPending, dueOn, daysLeft, progress };

  if (c.state === "credited") return { ...base, stage: "done", progress: 1, headline: "Money received", next: "Done. Keep the settlement SMS and passbook entry for your records." };

  if (c.state === "rejected") return {
    ...base, stage: "rejected", progress: 1, headline: "Rejected",
    next: "Find out exactly why and fix it before you file again. Re-filing without fixing the cause gets the same result.",
    action: { to: "/pf/claim-rejected", label: "Fix the rejection" },
  };

  if (c.state === "settled") {
    const since = days(c.changedOn ?? c.filedOn, today);
    if (since > 5) return {
      ...base, stage: "settled-not-credited", progress: 1, headline: `Settled ${since} days ago, money not in bank`,
      next: "Check your bank statement and that the bank account on your UAN is correct. If it bounced, EPFO must re-credit it. Complain with the claim ID.",
      action: { to: grievanceLink(c, "settledNotCredited"), label: "Draft the complaint" },
    };
    return { ...base, stage: "settled-waiting", progress: 1, headline: "Settled, payment on the way", next: "Money usually reaches your bank within 2–3 working days of settlement. Mark it received when it arrives." };
  }

  if (daysPending > SETTLEMENT_DAYS) return {
    ...base, stage: "overdue", headline: `${daysPending - SETTLEMENT_DAYS} ${daysPending - SETTLEMENT_DAYS === 1 ? "day" : "days"} past EPFO's 20-day deadline`,
    next: "EPFO has missed the deadline in the EPF Scheme 2026. Raise a grievance on EPFiGMS quoting the claim ID and the 20-day rule; delays without cause carry penal interest.",
    action: { to: grievanceLink(c, c.kind === "transfer" ? "transferStuck" : "delayed"), label: "Draft the complaint" },
  };
  if (daysLeft <= 5) return { ...base, stage: "due-soon", headline: `Due in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`, next: "Check Track Claim Status. If it shows 'pending at field office' with no deficiency, wait until the deadline before complaining." };
  return { ...base, stage: "on-track", headline: `Day ${daysPending} of 20`, next: c.kind === "advance" ? "Advance claims up to ₹5 lakh with complete KYC are often settled automatically within 3–4 days." : "Nothing to do yet. Check the status once a week." };
}

/** Most urgent first. */
const ORDER: Stage[] = ["overdue", "settled-not-credited", "rejected", "due-soon", "on-track", "settled-waiting", "done"];
export const sortClaims = (cs: TrackedClaim[], today = new Date()) =>
  [...cs].sort((a, b) => ORDER.indexOf(viewClaim(a, today).stage) - ORDER.indexOf(viewClaim(b, today).stage) || b.filedOn.localeCompare(a.filedOn));
