import type { RejectionReason } from "./types";

/** Common EPFO claim rejection reasons, matched by keywords in the rejection message. */
export const REJECTIONS: RejectionReason[] = [
  {
    id: "bank",
    title: "Bank details or cheque image problem",
    keywords: ["bank", "cheque", "check leaf", "passbook", "ifsc", "account number", "not legible", "illegible", "blur", "image", "account details"],
    meaning: "EPFO could not confirm the bank account is yours. Usually the cheque or passbook image was unclear, your name was not printed on it, the IFSC is outdated after a bank merger, or the account is not verified.",
    fix: [
      "Open Manage › KYC › Bank on the EPFO member portal. Check the account number, the current IFSC, and that the status says Verified.",
      "Upload a clear, straight photo of a cancelled cheque or the passbook front page with your name printed on it.",
      "Use an account in your own name, then file the claim again.",
    ],
    rules: ["R7"],
  },
  {
    id: "name",
    title: "Name, date of birth or other details don't match",
    keywords: ["name", "dob", "date of birth", "mismatch", "not matching", "does not match", "gender", "father", "spelling", "demographic"],
    meaning: "Your details in EPFO are different from your Aadhaar, PAN or bank records. Even one initial or a spelling difference stops the claim.",
    fix: [
      "Compare your EPFO profile with Aadhaar, PAN and your bank record, letter by letter.",
      "If your UAN is Aadhaar-verified, correct it yourself under Manage › Modify basic details.",
      "If your UAN is older than October 2017 or Aadhaar isn't linked, your employer submits a Joint Declaration. File the claim again once it is approved.",
    ],
    rules: ["R9"],
  },
  {
    id: "doe",
    title: "Date of exit not marked",
    keywords: ["date of exit", "doe", "exit date", "date of leaving", "dol", "not left", "still in service", "service not ceased", "member is in service"],
    meaning: "EPFO still thinks you work at that company, so it won't release a final settlement or transfer.",
    fix: [
      "Two months after the last contribution, mark it yourself: Manage › Mark Exit, confirmed with an Aadhaar OTP.",
      "Enter your actual last working day, not today's date.",
      "Or ask your old employer to update it. Then file again.",
    ],
    rules: ["R5"],
  },
  {
    id: "service",
    title: "Not eligible for this withdrawal yet",
    keywords: ["service", "not eligible", "ineligible", "minimum", "membership", "para", "not admissible", "months of service", "eligibility"],
    meaning: "The claim did not meet the time condition for that purpose. Under the EPF Scheme 2026, partial withdrawals need 12 months of membership, and a full settlement after leaving a job needs 12 months without a job.",
    fix: [
      "Use the Withdraw PF tool to see what you can take today.",
      "If you left your job less than 12 months ago, apply for a partial withdrawal (up to about 75%) instead of a final settlement.",
      "Transfer PF from earlier jobs so all of your membership counts.",
    ],
    rules: ["R2", "R4"],
  },
  {
    id: "transfer",
    title: "Old PF accounts must be transferred first",
    keywords: ["previous", "transfer", "multiple member", "other member id", "old account", "pending transfer", "member id", "not transferred", "merge"],
    meaning: "You have more than one member ID. EPFO wants them combined before it settles this claim.",
    fix: [
      "File a transfer under Online Services › One Member – One EPF Account.",
      "Wait for it to complete. EPFO has to settle within 20 days.",
      "Then file the withdrawal from your current member ID.",
    ],
    rules: ["R8", "R6"],
  },
  {
    id: "kyc",
    title: "KYC not complete",
    keywords: ["kyc", "aadhaar not", "uan not", "not seeded", "seeding", "not linked", "verification", "authenticat", "e-kyc"],
    meaning: "Aadhaar, PAN or your bank account is not verified against your UAN, so EPFO can't authenticate the claim.",
    fix: [
      "Open Manage › KYC. Aadhaar, PAN and bank should all show Verified.",
      "Ask your current employer to approve any KYC that's pending.",
      "If the employer has shut down, submit a Joint Declaration at your EPFO regional office.",
    ],
    rules: ["R7"],
  },
  {
    id: "pan",
    title: "PAN or Form 15G/15H issue",
    keywords: ["pan", "15g", "15h", "tds", "tax"],
    meaning: "For withdrawals above ₹50,000 before 5 years of service, EPFO needs your PAN (or a valid Form 15G/15H) to deduct the right TDS.",
    fix: [
      "Link and verify PAN under Manage › KYC.",
      "Upload Form 15G (under 60) or 15H (60 and above) only if your total income is below the taxable limit.",
      "File the claim again.",
    ],
    rules: ["R13"],
  },
  {
    id: "amount",
    title: "Claimed more than the eligible amount",
    keywords: ["amount", "exceed", "more than", "eligible amount", "limit", "balance insufficient"],
    meaning: "You asked for more than the rules allow. Under the 2026 rules, 25% of your contributions must stay in the account.",
    fix: [
      "Look at the eligible amount the portal shows while you file.",
      "Ask for that amount or less. The Withdraw PF tool gives you an estimate in advance.",
    ],
    rules: ["R3"],
  },
  {
    id: "contrib",
    title: "Employer contributions missing",
    keywords: ["contribution not", "not received", "no contribution", "ecr", "not remitted", "dues", "employer has not"],
    meaning: "Your employer didn't file or pay contributions for some months, so your balance or service record is incomplete.",
    fix: [
      "Download your passbook and list the missing months.",
      "Send that list to HR in writing.",
      "If it isn't fixed, file a grievance on EPFiGMS against the employer.",
    ],
    rules: ["R6"],
  },
  {
    id: "duplicate",
    title: "Claim already settled or duplicate",
    keywords: ["already settled", "duplicate", "already paid", "already claimed", "claim exists"],
    meaning: "A similar claim has already been processed or is still pending.",
    fix: [
      "Check Online Services › Track Claim Status for earlier claims.",
      "Check your bank statement for the credit.",
      "If the money never arrived, raise it on EPFiGMS with the claim ID.",
    ],
    rules: [],
  },
  {
    id: "eps",
    title: "Pension (EPS) claim issue",
    keywords: ["pension", "eps", "10c", "10d", "scheme certificate", "withdrawal benefit", "service more than 10", "ten years"],
    meaning: "EPS has its own rules. With 10 or more years of service you cannot take it as a lump sum, and an EPS withdrawal after leaving a job now needs 36 months.",
    fix: [
      "10 years or more: apply for a Scheme Certificate (Form 10C) and claim your pension from 58 (Form 10D).",
      "Under 10 years: take the withdrawal benefit after 36 months, or keep a Scheme Certificate to carry the service to your next job.",
    ],
    rules: ["R14", "R4"],
  },
  {
    id: "signature",
    title: "Signature or attestation problem",
    keywords: ["signature", "attest", "attestation", "employer approval", "not attested", "digital signature"],
    meaning: "The claim needed your employer's attestation, or your signature didn't match. This usually happens with offline claims or claims without Aadhaar.",
    fix: [
      "Get Aadhaar verified on your UAN so you can claim online without attestation.",
      "If you must file offline, sign exactly as in your records and get the form attested by the employer or an authorised official.",
    ],
    rules: ["R8"],
  },
];

export const ESCALATION = [
  { title: "EPFiGMS grievance", body: "File at epfigms.gov.in. Choose PF Member, enter your UAN and claim ID, and mention the 20-day settlement deadline.", href: "https://epfigms.gov.in" },
  { title: "Nidhi Aapke Nikat camp or regional office", body: "EPFO holds district camps on the 27th of every month. You can also visit your EPFO regional office.", href: "https://www.epfindia.gov.in" },
  { title: "CPGRAMS", body: "If EPFiGMS doesn't resolve it within 30 days, escalate on the central grievance portal.", href: "https://pgportal.gov.in" },
];
