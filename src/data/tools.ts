export interface ToolLink { to: string; label: string; desc: string; keywords?: string[] }

export const PF_TOOLS: ToolLink[] = [
  { to: "/pf/health-check", label: "PF account check", desc: "Find what will block your next claim" },
  { to: "/pf/claim-rejected", label: "Claim rejected", desc: "Understand the reason and fix it" },
  { to: "/pf/job-change", label: "Job change & transfer", desc: "Move old PF, merge UANs" },
  { to: "/pf/withdraw", label: "Withdrawal estimate", desc: "How much you can take, and the tax" },
  { to: "/pf/pension", label: "EPS pension estimate", desc: "Your monthly pension and when to start" },
  { to: "/pf/calculator", label: "EPF balance at retirement", desc: "Project your PF with the new ₹25,000 ceiling" },
  { to: "/pf/family-claim", label: "Family claim kit", desc: "After a death: PF, EDLI insurance and family pension", keywords: ["death claim", "family pension", "edli", "form 5if", "form 10d", "nominee claim", "passed away", "died", "legal heir", "widow pension"] },
  { to: "/monthly", label: "Monthly PF check-up", desc: "Log your passbook, catch missed deposits" },
  { to: "/pf/grievance", label: "Complaint drafter", desc: "Write an EPFiGMS grievance in a minute" },
  { to: "/reminders", label: "Deadline reminders", desc: "PF and NPS dates in your calendar" },
];
export const NPS_TOOLS: ToolLink[] = [
  { to: "/nps/tax", label: "NPS tax savings", desc: "Old vs new regime, employer contribution" },
  { to: "/nps/retirement", label: "NPS retirement & exit", desc: "Corpus, lump sum, annuity, tax" },
  { to: "/retirement", label: "Retirement income check", desc: "Will EPF + EPS + NPS be enough? Find your gap", keywords: ["enough to retire", "retirement planning", "retirement corpus", "how much do i need", "will my money last", "fire"] },
  { to: "/ppf", label: "PPF planner", desc: "Maturity, loans, withdrawals and extensions", keywords: ["ppf", "public provident fund", "ppf maturity", "ppf extension", "ppf loan", "ppf withdrawal", "15 years"] },
  { to: "/compare", label: "EPF vs VPF vs PPF vs NPS", desc: "Returns, tax and lock-in side by side" },
];
