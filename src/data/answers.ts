export type AnswerCategory = "claims" | "withdraw" | "account" | "pension" | "nps" | "tax";

export const CATEGORY_LABELS: Record<AnswerCategory, string> = {
  claims: "Claims and complaints",
  withdraw: "Withdrawing PF",
  account: "Your PF account",
  pension: "EPS pension and family claims",
  nps: "NPS",
  tax: "Tax",
};

export interface Answer {
  slug: string;
  question: string;
  category: AnswerCategory;
  /** The direct answer, in one or two sentences. */
  short: string;
  steps?: string[];
  tool?: { to: string; label: string };
  rules: string[];
  /** Extra words people use for this problem; used by search. */
  keywords: string[];
  related?: string[];
}

export const ANSWERS: Answer[] = [
  // ---- Claims and complaints
  {
    slug: "claim-pending-too-long", category: "claims",
    question: "My PF claim has been pending for weeks. What can I do?",
    short: "EPFO must settle a complete claim within 20 days. If yours has crossed that, file a grievance on EPFiGMS and quote the deadline. Most delays are caused by KYC, bank or exit-date issues, so check those first.",
    steps: [
      "Check Online Services › Track Claim Status on the EPFO member portal and note the claim ID and filing date.",
      "If the status says it's with the employer, ask HR to approve it. Aadhaar-verified claims usually don't need them.",
      "Check that Aadhaar, PAN and bank all show Verified under Manage › KYC.",
      "Past 20 days, file a grievance on epfigms.gov.in. Our grievance drafter writes it for you.",
    ],
    tool: { to: "/pf/grievance", label: "Draft my grievance" },
    rules: ["R6", "R7"],
    keywords: ["pending", "delay", "delayed", "not received", "stuck", "waiting", "processing", "under process", "no money", "status", "days", "slow", "late"],
    related: ["claim-rejected", "employer-not-approving"],
  },
  {
    slug: "claim-rejected", category: "claims",
    question: "My PF claim was rejected. How do I fix it?",
    short: "Copy the exact rejection reason from Track Claim Status and paste it into our rejection decoder. It tells you what the reason means and the steps to fix it. Then file a fresh claim; there's no penalty for refiling.",
    tool: { to: "/pf/claim-rejected", label: "Decode my rejection" },
    rules: ["R7", "R9"],
    keywords: ["rejected", "rejection", "returned", "denied", "failed", "reason", "not approved"],
    related: ["claim-pending-too-long", "change-name-dob"],
  },
  {
    slug: "employer-not-depositing", category: "claims",
    question: "My employer deducts PF from salary but isn't depositing it.",
    short: "This is a serious violation and EPFO takes it up. Collect proof (payslips showing the deduction and your passbook showing missing months), ask HR in writing, and if it isn't fixed, file a grievance against the employer on EPFiGMS.",
    steps: [
      "Download your passbook and list the months with no employer deposit.",
      "Match them with payslips that show PF deducted.",
      "Email HR the list and ask for a date by which it will be deposited.",
      "If there's no fix, file on EPFiGMS against the establishment. Our grievance drafter writes it.",
    ],
    tool: { to: "/pf/grievance", label: "Draft my grievance" },
    rules: ["R6"],
    keywords: ["employer", "company", "not deposited", "not paying", "deducted", "missing months", "passbook empty", "contribution missing", "fraud", "default"],
    related: ["employer-closed", "check-balance"],
  },
  {
    slug: "employer-not-approving", category: "claims",
    question: "My employer won't approve my KYC, transfer or exit date.",
    short: "With an Aadhaar-verified UAN, you can do most things without your employer: mark your own exit date after two months, correct basic details, and transfer PF online. If your Aadhaar isn't verified yet, escalate to EPFO.",
    steps: [
      "Mark exit yourself: Manage › Mark Exit, two months after the last contribution.",
      "Correct name, date of birth and similar details yourself under Manage › Modify basic details.",
      "File transfers under One Member – One EPF Account with an Aadhaar OTP.",
      "If the employer must act (for example, Aadhaar KYC approval), file an EPFiGMS grievance against the establishment.",
    ],
    tool: { to: "/pf/grievance", label: "Draft my grievance" },
    rules: ["R8", "R9"],
    keywords: ["hr", "employer", "approve", "approval", "not responding", "ignoring", "attest", "kyc pending", "exit date"],
    related: ["employer-closed", "change-name-dob"],
  },
  {
    slug: "employer-closed", category: "claims",
    question: "My old company has shut down. How do I get my PF?",
    short: "Your PF is safe with EPFO even if the company closed. If your UAN is Aadhaar-verified, mark the exit date yourself and claim or transfer online. If not, submit a Joint Declaration at your EPFO regional office with Aadhaar and old payslips.",
    tool: { to: "/pf/job-change", label: "Get my transfer steps" },
    rules: ["R9", "R8"],
    keywords: ["closed", "shut", "shutdown", "company closed", "bankrupt", "no hr", "old company", "liquidation"],
    related: ["employer-not-approving", "old-account"],
  },

  {
    slug: "settled-not-credited", category: "claims",
    question: "My claim shows settled but the money isn't in my bank.",
    short: "Allow a few working days after settlement. If it still hasn't arrived, the transfer was most likely returned by your bank, usually because of an old IFSC, a closed account or a name mismatch. Fix the bank details and raise a grievance so EPFO re-sends it.",
    steps: [
      "Check the settlement date and amount in Track Claim Status and in your passbook.",
      "Confirm with your bank whether a credit came in and bounced back.",
      "Update the bank account under Manage › KYC so it shows Verified with the current IFSC.",
      "File an EPFiGMS grievance with the claim ID asking EPFO to re-credit the returned amount.",
    ],
    tool: { to: "/pf/grievance", label: "Draft my grievance" },
    rules: ["R6"],
    keywords: ["settled", "not credited", "not received in bank", "money not in bank", "bank", "bounced", "returned", "credited but", "where is my money"],
    related: ["claim-pending-too-long", "claim-rejected"],
  },
  // ---- Withdrawing PF
  {
    slug: "withdraw-after-resigning", category: "withdraw",
    question: "Can I withdraw my full PF after resigning?",
    short: "Not straight away. From 1 July 2026, full settlement needs 12 months without a PF-covered job. One month after leaving you can take up to about 75%. If you join a new job, transfer the PF instead.",
    tool: { to: "/pf/withdraw", label: "See how much I can take" },
    rules: ["R4", "R3"],
    keywords: ["resign", "resigned", "quit", "left job", "leaving job", "lost job", "unemployed", "laid off", "job loss", "full pf", "full amount", "final settlement", "form 19"],
    related: ["withdraw-tax", "eps-withdraw-or-certificate"],
  },
  {
    slug: "withdraw-while-working", category: "withdraw",
    question: "Can I withdraw PF while I'm still working?",
    short: "Yes, after 12 months of membership, for medical treatment, education, marriage, housing or other needs. You can take up to about 75% of your balance; 25% must stay in the account. Most claims need no documents when KYC is complete.",
    tool: { to: "/pf/withdraw", label: "Estimate my withdrawal" },
    rules: ["R2", "R3", "R7"],
    keywords: ["advance", "partial", "medical", "hospital", "education", "fees", "marriage", "wedding", "house", "home loan", "renovation", "emergency", "form 31", "need money"],
    related: ["withdraw-time", "withdraw-upi"],
  },
  {
    slug: "withdraw-tax", category: "withdraw",
    question: "Is PF withdrawal taxable?",
    short: "Only if you take your full balance before 5 years of continuous service. Then EPFO deducts 10% TDS on amounts over ₹50,000 (much more without PAN). Partial withdrawals while you're a member, and any withdrawal after 5 years, are tax-free.",
    steps: [
      "Earlier jobs count towards 5 years only if you transferred their PF.",
      "If your total income is below the taxable limit, submit Form 15G (or 15H if 60+) to avoid TDS.",
    ],
    tool: { to: "/pf/withdraw", label: "Check my tax" },
    rules: ["R13"],
    keywords: ["tax", "tds", "taxable", "5 years", "five years", "15g", "15h", "income tax", "192a"],
    related: ["interest-tax", "withdraw-after-resigning"],
  },
  {
    slug: "withdraw-time", category: "withdraw",
    question: "How long does a PF withdrawal take?",
    short: "Claims up to ₹5 lakh are settled automatically, often within a few days, when your Aadhaar, PAN and bank are verified. By law EPFO must settle any complete claim within 20 days.",
    tool: { to: "/pf/health-check", label: "Check my account is claim-ready" },
    rules: ["R7", "R6"],
    keywords: ["how long", "how many days", "time", "when will i get", "credited", "auto settlement", "fast", "quick"],
    related: ["claim-pending-too-long", "withdraw-while-working"],
  },
  {
    slug: "withdraw-upi", category: "withdraw",
    question: "Can I withdraw PF through UPI or an ATM?",
    short: "Not yet. EPFO has announced UPI and ATM withdrawals and tested them, but as of our last check they haven't launched for the public. Use only the EPFO portal or the UMANG app, and ignore anyone offering 'instant PF by UPI'.",
    rules: ["R12"],
    keywords: ["upi", "atm", "card", "gpay", "phonepe", "instant", "epfo 3.0"],
    related: ["withdraw-while-working"],
  },

  // ---- Your PF account
  {
    slug: "check-balance", category: "account",
    question: "How do I check my PF balance?",
    short: "Give a missed call to 9966044425 from your registered mobile, or SMS \"EPFOHO UAN ENG\" to 7738299899. For the full passbook, log in at passbook.epfindia.gov.in or use the UMANG app.",
    steps: [
      "Missed call 9966044425 from the mobile registered with your UAN. You'll get an SMS with your balance.",
      "Or SMS EPFOHO UAN ENG to 7738299899. Replace ENG with TAM, HIN, TEL, KAN, MAL and so on for other languages.",
      "For month-by-month detail, open the passbook at passbook.epfindia.gov.in or in UMANG under EPFO › View Passbook.",
    ],
    rules: [],
    keywords: ["balance", "check", "passbook", "how much", "missed call", "sms", "umang", "statement"],
    related: ["interest-rate", "employer-not-depositing"],
  },
  {
    slug: "forgot-uan", category: "account",
    question: "I don't know my UAN or forgot my password.",
    short: "Find your UAN on your payslip, ask HR, or use Know Your UAN on the EPFO member portal with your Aadhaar-linked mobile. To reset the password, use Forgot Password on the portal and verify with an Aadhaar OTP.",
    rules: [],
    keywords: ["uan", "forgot", "password", "reset", "login", "know your uan", "activate", "locked"],
    related: ["two-uans", "check-balance"],
  },
  {
    slug: "transfer-pf", category: "account",
    question: "How do I transfer PF from my old job to my new job?",
    short: "File it online under Online Services › One Member – One EPF Account on the EPFO member portal, and confirm with an Aadhaar OTP. With Aadhaar-verified KYC you usually don't need either employer's approval, and the money moves automatically once the old office approves.",
    steps: [
      "Make sure the old job has an exit date and your Aadhaar is verified.",
      "Go to Online Services › One Member – One EPF Account (Transfer Request).",
      "Choose your previous member ID and submit with the Aadhaar OTP.",
      "Track it under Track Claim Status. If it's stuck beyond 20 days, file a grievance.",
    ],
    tool: { to: "/pf/job-change", label: "Get my exact steps" },
    rules: ["R8", "R6"],
    keywords: ["transfer", "move pf", "new job", "job change", "switch job", "changed job", "form 13", "old employer", "one member one epf"],
    related: ["two-uans", "employer-not-approving"],
  },
  {
    slug: "two-uans", category: "account",
    question: "I have two UANs. What should I do?",
    short: "Keep the UAN linked to Aadhaar, transfer the other UAN's accounts into it, and ask EPFO to deactivate the extra one. Two UANs split your service, which can make withdrawals taxable and affect your pension.",
    tool: { to: "/pf/job-change", label: "Get my merge steps" },
    rules: ["R8"],
    keywords: ["two uan", "2 uan", "multiple uan", "duplicate uan", "second uan", "merge", "new uan"],
    related: ["forgot-uan", "old-account"],
  },
  {
    slug: "change-name-dob", category: "account",
    question: "My name or date of birth is wrong in PF. How do I correct it?",
    short: "If your UAN is Aadhaar-verified, correct it yourself online under Manage › Modify basic details. No employer approval is needed. For UANs from before October 2017 or without Aadhaar, your employer submits a Joint Declaration.",
    rules: ["R9"],
    keywords: ["name", "dob", "date of birth", "wrong", "correction", "mismatch", "spelling", "father name", "joint declaration", "gender"],
    related: ["employer-not-approving", "claim-rejected"],
  },
  {
    slug: "add-nominee", category: "account",
    question: "How do I add a nominee to my PF?",
    short: "Log in to the EPFO member portal, go to Manage › E-Nomination, add family members with their Aadhaar, and e-sign with your Aadhaar OTP. It takes about five minutes and saves your family months of paperwork.",
    rules: ["R26"],
    keywords: ["nominee", "nomination", "e-nomination", "family", "wife", "husband", "spouse", "children"],
    related: ["family-member-died"],
  },
  {
    slug: "interest-rate", category: "account",
    question: "What interest does PF pay, and when is it credited?",
    short: "8.25% for FY 2025-26, the same as the previous two years. It's credited once the government notifies the rate, usually a few months after the year ends. Interest keeps accruing until you turn 58, even if you stop working.",
    rules: ["R11", "R27"],
    keywords: ["interest", "rate", "8.25", "credited", "when interest", "returns"],
    related: ["interest-tax", "old-account"],
  },
  {
    slug: "old-account", category: "account",
    question: "I have an old PF account I haven't touched in years.",
    short: "It still earns interest until you turn 58, so you haven't lost anything. The best move is to transfer it into your current account. If you're not working, claim it, expecting extra verification on accounts with no transactions for 3 years.",
    tool: { to: "/pf/job-change", label: "Get my transfer steps" },
    rules: ["R27", "R8"],
    keywords: ["old", "inactive", "inoperative", "dormant", "forgotten", "unclaimed", "years ago"],
    related: ["two-uans", "employer-closed"],
  },
  {
    slug: "wage-ceiling-25000", category: "account",
    question: "What does the new ₹25,000 PF wage ceiling mean for me?",
    short: "From 17 September 2026, compulsory PF and EPS are calculated on salary up to ₹25,000 instead of ₹15,000. If your employer contributed only on ₹15,000, your PF deduction may rise slightly, more goes to your EPS pension, and the EDLI life cover can reach ₹7 lakh.",
    tool: { to: "/pf/pension", label: "Estimate my pension" },
    rules: ["R10", "R26"],
    keywords: ["25000", "25,000", "wage ceiling", "15000", "salary limit", "take home", "deduction increased"],
    related: ["eps-how-much"],
  },

  // ---- Pension and family
  {
    slug: "eps-withdraw-or-certificate", category: "pension",
    question: "Should I withdraw my EPS or take a Scheme Certificate?",
    short: "If you're likely to work in a PF-covered job again, take the Scheme Certificate, because pension service only adds up if you keep it. With 10 years of service you get a monthly pension for life from 58, and a lump sum is no longer allowed.",
    tool: { to: "/pf/pension", label: "Estimate my pension" },
    rules: ["R14", "R4"],
    keywords: ["eps", "pension", "scheme certificate", "10c", "form 10c", "withdraw pension", "withdrawal benefit"],
    related: ["eps-how-much", "withdraw-after-resigning"],
  },
  {
    slug: "eps-how-much", category: "pension",
    question: "How much EPS pension will I get?",
    short: "Pension = pensionable salary (capped at the wage ceiling) × years of service ÷ 70, from age 58, with at least 10 years of service. Starting at 50 cuts it 4% a year; deferring to 60 adds 4% a year.",
    tool: { to: "/pf/pension", label: "Calculate my pension" },
    rules: ["R14", "R24", "R10"],
    keywords: ["pension amount", "how much pension", "eps calculation", "monthly pension", "retirement pension", "form 10d", "58"],
    related: ["eps-withdraw-or-certificate", "life-certificate"],
  },
  {
    slug: "life-certificate", category: "pension",
    question: "My EPS pension stopped. Why?",
    short: "The most common reason is a missed annual life certificate. Submit a digital life certificate (Jeevan Pramaan) through the Jeevan Pramaan app, your bank, or a Common Service Centre, and the pension resumes.",
    rules: ["R24"],
    keywords: ["pension stopped", "life certificate", "jeevan pramaan", "pensioner", "not credited", "pension not received"],
    related: ["eps-how-much"],
  },
  {
    slug: "family-member-died", category: "pension",
    question: "A family member who had PF has died. What can we claim?",
    short: "Three things: the PF balance (Form 20), a monthly family pension from EPS (Form 10D), and EDLI life insurance of up to ₹7 lakh if they died while employed (Form 5IF). Nominees can file all three online once their Aadhaar e-KYC is complete.",
    steps: [
      "Collect the death certificate, the deceased's UAN, the claimant's Aadhaar and bank details.",
      "If a nominee is registered, file online on the EPFO portal using the nominee's Aadhaar. Without a nominee, legal heirs claim with a legal heir certificate.",
      "File Form 20 (PF), Form 10D (family pension) and Form 5IF (EDLI) together. The employer certifies EDLI where needed.",
      "For minor children, EPFO no longer insists on a guardianship certificate when money goes directly to the child's bank account.",
    ],
    rules: ["R26", "R6"],
    keywords: ["death", "died", "passed away", "deceased", "expired", "father", "mother", "husband", "wife", "edli", "insurance", "form 20", "5if", "family pension", "nominee claim", "legal heir"],
    related: ["add-nominee"],
  },

  // ---- NPS
  {
    slug: "nps-at-60", category: "nps",
    question: "How much NPS can I take as cash at 60?",
    short: "Private-sector subscribers can take up to 80% as a lump sum and must use at least 20% for an annuity (government employees: 60/40). With ₹8 lakh or less you can take it all. Only 60% of the corpus is tax-free.",
    tool: { to: "/nps/retirement", label: "See my exit split" },
    rules: ["R15", "R16", "R21"],
    keywords: ["nps 60", "lump sum", "maturity", "retirement", "annuity", "80%", "60%", "exit", "corpus"],
    related: ["nps-exit-process", "nps-before-60"],
  },
  {
    slug: "nps-exit-process", category: "nps",
    question: "How do I actually withdraw my NPS at retirement?",
    short: "Log in to the website of your CRA (Protean, KFintech or CAMS, whichever holds your PRAN), choose Exit from NPS, upload your documents, pick an annuity provider if needed, and e-sign with an Aadhaar OTP. Decide whether to continue or defer at least 15 days before you turn 60.",
    steps: [
      "Keep your PRAN, bank proof and Aadhaar ready, and make sure your bank details in NPS are current.",
      "Log in to your CRA and start Exit from NPS. Smaller corpuses can be self-authorised; larger ones are verified through your bank or point of presence.",
      "Choose the lump sum and annuity split, and an annuity provider if an annuity is needed.",
      "E-sign with Aadhaar OTP and track the request on the CRA site.",
    ],
    tool: { to: "/nps/retirement", label: "Plan my exit split first" },
    rules: ["R16", "R17"],
    keywords: ["how to withdraw nps", "nps exit", "cra", "protean", "nsdl", "kfintech", "cams", "pran", "nps claim", "close nps"],
    related: ["nps-at-60"],
  },
  {
    slug: "nps-before-60", category: "nps",
    question: "Can I take money out of NPS before 60?",
    short: "Yes, two ways. A partial withdrawal of up to 25% of your own contributions after 3 years, tax-free, up to 4 times before 60. Or a full premature exit, but above ₹5 lakh, 80% must then buy an annuity. Private subscribers can make a normal exit after 15 years.",
    tool: { to: "/nps/retirement", label: "Compare my options" },
    rules: ["R19", "R18", "R17"],
    keywords: ["before 60", "partial", "early", "premature", "emergency", "nps withdraw", "25%"],
    related: ["nps-loan", "nps-at-60"],
  },
  {
    slug: "nps-loan", category: "nps",
    question: "Can I take a loan against my NPS?",
    short: "Yes. Since the December 2025 rules, a regulated lender can lend against up to 25% of your own NPS contributions, and your corpus stays invested. NPS partial withdrawals can also be used to repay such a loan.",
    rules: ["R20", "R19"],
    keywords: ["loan", "borrow", "lien", "pledge", "collateral"],
    related: ["nps-before-60"],
  },
  {
    slug: "nps-new-regime", category: "nps",
    question: "Is NPS still worth it in the new tax regime?",
    short: "Your own contributions get no deduction in the new regime, but your employer's contribution of up to 14% of basic + DA is deductible. If your employer offers corporate NPS, routing part of your CTC there is often the best tax move left.",
    tool: { to: "/nps/tax", label: "Calculate my saving" },
    rules: ["R22"],
    keywords: ["new regime", "tax saving", "80ccd", "worth it", "deduction", "employer nps", "corporate nps", "50000"],
    related: ["nps-at-60"],
  },
  {
    slug: "nps-tier-2", category: "nps",
    question: "What is NPS Tier II and can I withdraw from it?",
    short: "Tier II is an optional, flexible NPS account. You can withdraw any time, but it generally gets no tax deduction. Tier I is the locked-in pension account with the tax benefits and the exit rules.",
    rules: ["R22"],
    keywords: ["tier 2", "tier ii", "tier 1", "tier i", "voluntary nps", "flexible"],
    related: ["nps-before-60"],
  },

  // ---- Tax
  {
    slug: "interest-tax", category: "tax",
    question: "Is my PF interest taxable? What about VPF?",
    short: "Only interest on your own contributions above ₹2.5 lakh a year, including VPF, is taxable (₹5 lakh where the employer doesn't contribute). For most people paying normal PF, interest stays tax-free.",
    rules: ["R25"],
    keywords: ["interest tax", "vpf", "voluntary", "2.5 lakh", "250000", "high contribution", "taxable interest"],
    related: ["withdraw-tax", "interest-rate"],
  },
];

export const answerBySlug = (slug: string) => ANSWERS.find((a) => a.slug === slug);
