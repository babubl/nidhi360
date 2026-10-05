export interface Step { title: string; body: string; to?: string; cta?: string; rules?: string[] }
export interface LifeStage {
  slug: string;
  age: string;
  title: string;
  short: string;
  intro: string;
  steps: Step[];
  avoid: string[];
}

export const LIFE_STAGES: LifeStage[] = [
  {
    slug: "starting-out",
    age: "20s",
    title: "Starting out",
    short: "First jobs, first job switch",
    intro: "Your PF is small now, but the habits you set in the first few years decide whether claims later take 3 days or 3 months.",
    steps: [
      { title: "Get your account claim-ready", body: "Activate your UAN and get Aadhaar, PAN and bank verified. This alone decides whether claims settle automatically.", to: "/pf/health-check", cta: "Run the 2-minute check", rules: ["R7"] },
      { title: "Changing jobs? Transfer, don't withdraw", body: "Withdrawing before 5 years of continuous service means TDS and tax, and it resets your pension service. Transferring keeps all of it.", to: "/pf/job-change", cta: "Get your transfer steps", rules: ["R13", "R8"] },
      { title: "Use NPS through your employer", body: "In the new tax regime, your employer's NPS contribution (up to 14% of basic + DA) is the only NPS tax break left. Ask HR whether part of your CTC can go there.", to: "/nps/tax", cta: "See how much tax it saves", rules: ["R22"] },
    ],
    avoid: [
      "Withdrawing your full PF between jobs. From July 2026 you'd have to be jobless for 12 months anyway.",
      "Letting a second UAN get created at a new job. Give HR your existing UAN on day one.",
      "Sharing your UAN password or OTP with any 'PF agent'.",
    ],
  },
  {
    slug: "building",
    age: "30s",
    title: "Switching jobs, buying a home",
    short: "Job moves, home loan, family",
    intro: "This is when people dip into PF for a house, and when old accounts from two or three employers start causing trouble.",
    steps: [
      { title: "Bring old PF accounts together", body: "Each employer creates a member ID. Merge them under one UAN so your service stays continuous and nothing gets stuck.", to: "/pf/job-change", cta: "Fix my old accounts", rules: ["R8"] },
      { title: "Using PF for a house", body: "Housing withdrawals cover buying, building, repaying a home loan and renovation. 25% of your contributions must stay in the account.", to: "/pf/withdraw", cta: "See how much I can take", rules: ["R2", "R3"] },
      { title: "Add your family as nominees", body: "E-nomination takes five minutes with an Aadhaar OTP, and saves your family months of paperwork.", to: "/pf/health-check", cta: "Check what's missing", rules: [] },
    ],
    avoid: [
      "Taking out more than you need. At 8.25% tax-free, PF is among the best returns you'll get on safe money.",
      "Ignoring missing employer deposits in your passbook. They're far harder to recover years later.",
    ],
  },
  {
    slug: "mid-career",
    age: "40s",
    title: "Kids' education, mid-career",
    short: "Education, marriage, the pension line",
    intro: "Children's education and marriages are the big PF withdrawals of this decade, and your pension rights are quietly taking shape.",
    steps: [
      { title: "Plan education and marriage withdrawals", body: "Education can be claimed up to 10 times and marriage up to 5 times during your membership. You need 12 months of membership, and no documents for most auto-settled claims.", to: "/pf/withdraw", cta: "Estimate my withdrawal", rules: ["R2"] },
      { title: "Know where you stand on the EPS 10-year line", body: "With 10 years of pension service you're entitled to a monthly pension for life from 58. Below 10, you only get a one-time withdrawal benefit.", to: "/pf/pension", cta: "Estimate my pension", rules: ["R14"] },
      { title: "Use NPS partial withdrawals instead of loans", body: "After 3 years in NPS you can take up to 25% of your own contributions, tax-free, up to 4 times before 60.", to: "/ask", cta: "Ask about my case", rules: ["R19"] },
    ],
    avoid: [
      "Withdrawing EPS when you're close to 10 years of service. Take a Scheme Certificate instead and protect your pension.",
      "Forgetting that the wage ceiling rose to ₹25,000 in September 2026. Check that your EPS contribution changed.",
    ],
  },
  {
    slug: "retiring",
    age: "50s",
    title: "Retirement in sight",
    short: "Final settlement, pension, NPS exit",
    intro: "The decisions here are big and mostly one-way: when to claim your EPS pension, how to take your PF, and how to exit NPS without overpaying tax.",
    steps: [
      { title: "Estimate your EPS pension and when to start it", body: "Pension from 58 is the default. Start at 50 and it is reduced 4% a year; defer to 60 and it rises 4% a year.", to: "/pf/pension", cta: "Estimate my pension", rules: ["R14", "R24"] },
      { title: "Plan your NPS exit", body: "Private-sector subscribers can take up to 80% as a lump sum, but only 60% is tax-free. The order you take it in changes your tax.", to: "/nps/retirement", cta: "See my exit options", rules: ["R15", "R16", "R21"] },
      { title: "Take your PF in full at retirement", body: "After 55, retirement settlement releases 100% of your PF, including the 25% that's otherwise locked. With 5 or more years of continuous service it's tax-free.", to: "/pf/withdraw", cta: "Check my settlement", rules: ["R5", "R13"] },
    ],
    avoid: [
      "Missing the yearly life certificate (Jeevan Pramaan) once your EPS pension starts. The pension stops until you submit it.",
      "Buying an annuity with your whole NPS corpus by default. The rules now let you take more as cash or withdraw gradually.",
      "Rushing the NPS exit at 60. You can stay invested until 85.",
    ],
  },
];
