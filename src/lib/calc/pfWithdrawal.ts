/**
 * PF withdrawal estimate under the EPF Scheme, 2026.
 * - Partial withdrawals: 12 months' membership; 25% of contributions stays in the account (R2, R3).
 * - Unemployment: partial after 1 month; full settlement after 12 continuous months (R4).
 * - Retirement at 55+, migration abroad: full settlement (R5).
 * - TDS: final settlement before 5 years' continuous service and above ₹50,000 (R13).
 */
export type Purpose =
  | "illness" | "education" | "marriage" | "housing" | "special"
  | "unemployed" | "retire" | "abroad";

export const PURPOSE_LABELS: Record<Purpose, string> = {
  illness: "Medical treatment (self or family)",
  education: "Education",
  marriage: "Marriage (self, children, siblings)",
  housing: "House: buy, build, repay a home loan, renovate",
  special: "Other need (special circumstances)",
  unemployed: "I left or lost my job",
  retire: "Retirement (age 55 or above)",
  abroad: "Moving abroad permanently",
};

export interface WithdrawalInput {
  purpose: Purpose;
  balance: number;
  membershipMonths: number;
  continuousServiceYears: number;
  age: number;
  monthsUnemployed: number;
  panLinked: boolean;
}

export interface WithdrawalResult {
  eligible: boolean;
  amount: number;
  remains: number;
  isFinalSettlement: boolean;
  form: "Form 31" | "Form 19";
  tds: number;
  netAmount: number;
  /** What `amount` would grow to if left in PF until 58, at the current EPF rate. */
  foregoneAt58: number;
  yearsTo58: number;
  notes: string[];
  rules: string[];
}

export const EPF_RATE = 0.0825;
export const MIN_BALANCE_SHARE = 0.25;
const PARTIAL: Purpose[] = ["illness", "education", "marriage", "housing", "special"];

const PURPOSE_NOTES: Partial<Record<Purpose, string>> = {
  education: "Education can be claimed up to 10 times during your membership.",
  marriage: "Marriage can be claimed up to 5 times during your membership.",
  special: "You don't have to give a reason or documents, but the number of these claims is limited.",
  illness: "Most medical claims settle automatically without documents if your KYC is complete.",
  housing: "Housing covers buying or building a house, repaying a home loan and renovation, with limits on how often.",
};

export function estimateWithdrawal(i: WithdrawalInput): WithdrawalResult {
  const balance = Math.max(0, i.balance || 0);
  const notes: string[] = [];
  let rules = ["R2", "R3"];
  let eligible = true;
  let amount = 0;
  let isFinal = false;

  if (PARTIAL.includes(i.purpose)) {
    if (i.membershipMonths < 12) {
      eligible = false;
      notes.push(`You need 12 months of PF membership; you have ${i.membershipMonths}. Membership from earlier jobs counts once you transfer it.`);
    } else {
      amount = balance * (1 - MIN_BALANCE_SHARE);
    }
    const n = PURPOSE_NOTES[i.purpose];
    if (n) notes.push(n);
  } else if (i.purpose === "unemployed") {
    rules = ["R4", "R3"];
    if (i.monthsUnemployed < 1) {
      eligible = false;
      notes.push("Wait at least one month after your last working day. Then you can take up to about 75% as a partial withdrawal.");
    } else if (i.monthsUnemployed < 12) {
      amount = balance * (1 - MIN_BALANCE_SHARE);
      notes.push(`Full settlement needs 12 months without a job; you're at ${i.monthsUnemployed}. Until then you can take up to about 75%. If you join a new job, transfer the account instead.`);
    } else {
      amount = balance;
      isFinal = true;
      notes.push("You can take your full balance as a final settlement.");
    }
  } else if (i.purpose === "retire") {
    rules = ["R5"];
    if (i.age < 55) {
      eligible = false;
      notes.push("Retirement settlement starts at 55. Pick another purpose for now.");
    } else {
      amount = balance;
      isFinal = true;
    }
  } else {
    rules = ["R5"];
    amount = balance;
    isFinal = true;
    notes.push("You'll need proof of permanent migration or overseas employment.");
  }

  let tds = 0;
  if (isFinal && i.continuousServiceYears < 5 && amount > 50000) {
    tds = amount * (i.panLinked ? 0.1 : 0.3);
    rules = [...rules, "R13"];
    notes.push(
      i.panLinked
        ? "10% TDS applies because your continuous service is under 5 years and the amount is over ₹50,000. If your total income is below the taxable limit, submit Form 15G/15H."
        : "Without PAN, TDS is charged at the maximum rate (estimated here at 30%). Link PAN before you file.",
    );
  }

  const yearsTo58 = Math.max(0, 58 - i.age);
  return {
    eligible,
    amount,
    remains: balance - amount,
    isFinalSettlement: isFinal,
    form: isFinal ? "Form 19" : "Form 31",
    tds,
    netAmount: amount - tds,
    foregoneAt58: amount * Math.pow(1 + EPF_RATE, yearsTo58),
    yearsTo58,
    notes,
    rules,
  };
}
