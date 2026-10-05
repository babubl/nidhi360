/** EPFiGMS grievance drafter. Produces paste-ready text; never asks for UAN or other IDs (the portal collects those). */
export type IssueType = "delayed" | "settledNotCredited" | "rejectedWrongly" | "notDeposited" | "employerBlocking" | "transferStuck";

export const ISSUE_LABELS: Record<IssueType, string> = {
  delayed: "My claim is pending for too long",
  settledNotCredited: "Claim settled but money not received",
  rejectedWrongly: "Claim rejected though my details are correct",
  transferStuck: "My PF transfer is stuck",
  notDeposited: "Employer deducted PF but didn't deposit it",
  employerBlocking: "Employer not approving KYC, exit date or transfer",
};

export interface GrievanceInput {
  issue: IssueType;
  claimId?: string;
  filedOn?: string; // ISO date
  employer?: string;
  missingMonths?: string;
  rejectionReason?: string;
  pendingItem?: string;
  today?: Date;
}

export interface Grievance { subject: string; body: string; daysPending?: number; overDeadline?: boolean; attach: string[] }

const daysBetween = (iso: string, today: Date) => Math.floor((today.getTime() - new Date(iso + "T00:00:00").getTime()) / 86_400_000);
const fmt = (iso?: string) => (iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "[date]");

export function draftGrievance(i: GrievanceInput): Grievance {
  const today = i.today ?? new Date();
  const claim = i.claimId?.trim() || "[claim ID]";
  const emp = i.employer?.trim() || "[establishment name]";
  const days = i.filedOn ? daysBetween(i.filedOn, today) : undefined;
  const over = days !== undefined ? days > 20 : undefined;
  const deadline = "Under the Employees' Provident Fund Scheme, 2026, a complete claim must be settled within 20 days, with penal interest for delay without sufficient cause.";
  const close = "I request you to resolve this at the earliest and inform me of the action taken.";

  switch (i.issue) {
    case "delayed":
      return {
        subject: `Claim ${claim} pending beyond the 20-day settlement period`,
        body: `I filed claim ${claim} on ${fmt(i.filedOn)}${days !== undefined ? `, ${days} days ago` : ""}. It has not been settled and no deficiency has been communicated to me. My KYC (Aadhaar, PAN and bank account) is verified on my UAN. ${deadline} ${close}`,
        daysPending: days, overDeadline: over,
        attach: ["Screenshot of Track Claim Status"],
      };
    case "settledNotCredited":
      return {
        subject: `Claim ${claim} shown as settled but amount not credited`,
        body: `My claim ${claim} is shown as settled${i.filedOn ? ` on ${fmt(i.filedOn)}` : ""}, but the amount has not been credited to my bank account. My bank has confirmed no credit was received. I have verified and updated my bank account details on the member portal. Please trace the payment and re-credit it if it was returned. ${close}`,
        daysPending: days, overDeadline: over,
        attach: ["Screenshot of claim status showing Settled", "Bank statement for the period", "Cancelled cheque or passbook front page"],
      };
    case "rejectedWrongly":
      return {
        subject: `Claim ${claim} rejected; details are correct`,
        body: `My claim ${claim}${i.filedOn ? ` filed on ${fmt(i.filedOn)}` : ""} was rejected with the reason: "${i.rejectionReason?.trim() || "[rejection reason]"}". I have checked my records: my name, date of birth, bank account and KYC are correct and verified on my UAN. Please review the rejection and settle the claim, or tell me exactly what document is needed. ${close}`,
        attach: ["Screenshot of the rejection reason", "Screenshot of verified KYC (Manage › KYC)", "Cancelled cheque or passbook front page"],
      };
    case "transferStuck":
      return {
        subject: `Transfer claim ${claim} pending`,
        body: `I filed transfer claim ${claim} on ${fmt(i.filedOn)}${days !== undefined ? ` (${days} days ago)` : ""} to move my PF from my previous employer's account to my current account. It is still pending. My Aadhaar is verified on my UAN and the exit date for the previous employer is recorded. ${deadline} ${close}`,
        daysPending: days, overDeadline: over,
        attach: ["Screenshot of Track Claim Status", "Service history showing both member IDs"],
      };
    case "notDeposited":
      return {
        subject: `PF deducted by ${emp} but not deposited`,
        body: `My employer, ${emp}, deducted PF from my salary for ${i.missingMonths?.trim() || "[months]"}, as shown in my payslips, but the contributions do not appear in my EPF passbook. I raised this with the employer and it has not been resolved. I request EPFO to take up the matter with the establishment and ensure the dues are deposited with interest. ${close}`,
        attach: ["Payslips showing PF deduction for those months", "EPF passbook showing the missing months", "Your email to HR, if any"],
      };
    case "employerBlocking":
      return {
        subject: `${emp} not approving ${i.pendingItem?.trim() || "my request"}`,
        body: `My request for ${i.pendingItem?.trim() || "[KYC approval / exit date / transfer]"} has been pending with my employer, ${emp}, since ${fmt(i.filedOn)}${days !== undefined ? ` (${days} days)` : ""}. Despite follow-ups, the employer has not acted. I request EPFO to direct the establishment to act, or to process the request directly. ${close}`,
        daysPending: days,
        attach: ["Screenshot showing the pending request", "Your follow-up emails to HR"],
      };
  }
}
