/**
 * Family claim kit: what a family can claim from EPFO after a member's death.
 *  - EDLI (R26, R33): 35 × average monthly wage of the last 12 months (capped at the wage ceiling)
 *    + 50% of the average PF balance of the last 12 months (that part capped at ₹1.75 lakh).
 *    Minimum ₹2.5 lakh with 12 months' continuous service (gaps of up to 60 days between jobs ignored);
 *    otherwise a minimum of ₹50,000. Maximum ₹7 lakh. Death within 6 months of the last contribution
 *    is covered if the member was still on the employer's rolls.
 *  - PF balance (Form 20): always payable to the nominee or legal heirs.
 *  - EPS (R14): family pension (Form 10D) on death in service, or after leaving with 10+ years of
 *    service or a Scheme Certificate, or on a pensioner's death. Otherwise a withdrawal benefit.
 *    Spouse at least ₹1,000 a month; each of up to two children 25% of it (at least ₹250) until 25;
 *    with no surviving spouse, up to two orphans 75% each (at least ₹750).
 */
import { CEILING_NEW } from "./epsPension";

export type DeathStatus = "in-service" | "left" | "pensioner";

export interface FamilyClaimInput {
  status: DeathStatus;
  /** Average monthly basic + DA over the last 12 months of service. */
  avgWage: number;
  /** Average PF balance over the last 12 months. */
  avgPfBalance: number;
  /** Member had 12 months of continuous service (any employers, gaps ≤ 60 days) before death. */
  continuous12: boolean;
  /** For "left": months between the last PF contribution and death. */
  monthsSinceLastContribution: number;
  /** For "left": still on the employer's rolls (on leave, notice, suspension) when they died. */
  onRolls: boolean;
  epsYears: number;
  hadSchemeCertificate: boolean;
  spouseAlive: boolean;
  childrenUnder25: number;
  nomineeRegistered: boolean;
}

export interface Claim {
  form: string;
  what: string;
  amount: string;
  /** Claims that apply; others are listed as not applicable with the reason. */
  applies: boolean;
  note?: string;
}

export interface FamilyClaimResult {
  edliEligible: boolean;
  edliAmount: number;
  edliFormula: number;
  edliFloor: number;
  familyPension: boolean;
  spousePensionMin: number;
  childPensionMin: number;
  childrenPaid: number;
  claims: Claim[];
  documents: string[];
  steps: string[];
  warnings: string[];
  rules: string[];
}

export const EDLI_MIN = 250000;
export const EDLI_MIN_SHORT = 50000;
export const EDLI_MAX = 700000;
export const EDLI_BALANCE_CAP = 175000;

export function edliAmount(avgWage: number, avgPfBalance: number, continuous12: boolean) {
  const wage = Math.min(Math.max(0, avgWage), CEILING_NEW);
  const formula = 35 * wage + Math.min(Math.max(0, avgPfBalance) * 0.5, EDLI_BALANCE_CAP);
  const floor = continuous12 ? EDLI_MIN : EDLI_MIN_SHORT;
  return { formula, floor, amount: Math.min(EDLI_MAX, Math.max(floor, formula)) };
}

export function familyClaim(i: FamilyClaimInput): FamilyClaimResult {
  const warnings: string[] = [];
  const rules = ["R26", "R33", "R14", "R6"];

  const edliEligible = i.status === "in-service" || (i.status === "left" && i.onRolls && i.monthsSinceLastContribution <= 6);
  const e = edliAmount(i.avgWage, i.avgPfBalance, i.continuous12);

  const familyPension = i.status !== "left" || i.epsYears >= 10 || i.hadSchemeCertificate;
  const children = Math.max(0, Math.min(2, Math.floor(i.childrenUnder25)));
  const spousePensionMin = i.spouseAlive && familyPension ? 1000 : 0;
  const childPensionMin = familyPension && children ? (i.spouseAlive ? 250 : 750) : 0;

  const claims: Claim[] = [
    {
      form: "Form 20", what: "PF balance", applies: true,
      amount: "The full PF balance with interest",
      note: i.status === "pensioner" ? "Only if the PF wasn't already withdrawn at retirement." : undefined,
    },
    edliEligible
      ? { form: "Form 5IF", what: "EDLI life insurance", applies: true, amount: `About ${fmt(e.amount)}`, note: e.amount === EDLI_MAX ? "This is the maximum EDLI pays." : e.amount === e.floor ? `The minimum of ${fmt(e.floor)} applies.` : undefined }
      : { form: "Form 5IF", what: "EDLI life insurance", applies: false, amount: "Not payable", note: i.status === "pensioner" ? "EDLI covers members who die while in service." : "EDLI covers death in service, or within 6 months of the last contribution while still on the employer's rolls." },
    familyPension
      ? {
        form: "Form 10D", what: "Monthly family pension (EPS)", applies: true,
        amount: i.spouseAlive
          ? `Spouse: at least ₹1,000 a month for life${children ? `, plus at least ₹250 a month for each of ${children === 1 ? "1 child" : "2 children"} until 25` : ""}`
          : children ? `At least ₹750 a month for each of ${children === 1 ? "1 child" : "2 children"} until 25` : "Payable to a nominee or dependent parent if there is no spouse or child",
        note: "EPFO computes the exact amount from the member's salary and service.",
      }
      : {
        form: "Form 10C", what: "EPS withdrawal benefit", applies: true,
        amount: "A one-time amount based on EPS service",
        note: `With ${+i.epsYears.toFixed(1)} years of EPS service and no Scheme Certificate, the family gets a one-time withdrawal benefit instead of a monthly pension.`,
      },
  ];

  const documents = [
    "Death certificate (original or attested copy)",
    "The member's UAN, or PF account number and employer name",
    "Claimant's Aadhaar, linked to their mobile number",
    "Claimant's bank account details and a cancelled cheque",
    "Claimant's PAN (avoids TDS on PF)",
  ];
  if (!i.nomineeRegistered) documents.push("Legal heir or succession certificate, or the documents your EPFO office asks for in its place");
  if (familyPension) documents.push("Proof of relationship and each child's date of birth (for family pension)");
  if (!i.spouseAlive && children) documents.push("Guardian details if a child is a minor (not needed when money goes straight to the child's own bank account)");
  if (i.status === "pensioner") documents.push("Pension Payment Order (PPO) number");

  const steps: string[] = [];
  if (i.nomineeRegistered) steps.push("The nominee files online: EPFO member portal → Death claim, using the nominee's Aadhaar e-KYC.");
  else steps.push("No nominee? Legal heirs file at the EPFO regional office or through the employer, with a legal heir or succession certificate.");
  if (i.status === "pensioner") steps.push("Tell the pension-disbursing bank and EPFO about the death so the pension stops, then file Form 10D for the family pension with the PPO number.");
  else steps.push(`File ${claims.filter((c) => c.applies).map((c) => c.form).join(", ")} together. The employer attests where needed; if the company has closed, submit attested by a bank manager or gazetted officer.`);
  steps.push("Note the claim ID. EPFO must settle within 20 days; after that you can raise an EPFiGMS grievance.");
  steps.push("Don't withdraw or close the member's bank account until every amount is credited.");

  if (!i.nomineeRegistered) warnings.push("Without a nominee the claim takes longer. Every living member should add a nominee on the EPFO portal.");
  if (i.status === "left" && i.monthsSinceLastContribution > 6) warnings.push("EDLI isn't payable more than 6 months after the last contribution, but the PF balance and EPS benefits still are.");
  warnings.push("Filing is free. Anyone asking for a fee or a share of the claim to 'speed it up' is not from EPFO.");

  return { edliEligible, edliAmount: edliEligible ? e.amount : 0, edliFormula: e.formula, edliFloor: e.floor, familyPension, spousePensionMin, childPensionMin, childrenPaid: children, claims, documents, steps, warnings, rules };
}

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
