export type YN = "yes" | "no" | "unsure";
export interface TransferAnswers { sameUan?: YN; kyc?: YN; exitDate?: YN; employerActive?: "yes" | "no"; trust?: YN }
export interface TransferStep { title: string; body: string; rules: string[] }

export const TRANSFER_QUESTIONS: { id: keyof TransferAnswers; q: string; opts: { value: string; label: string }[] }[] = [
  { id: "sameUan", q: "Do your old and new jobs both appear under the same UAN?", opts: [{ value: "yes", label: "Yes" }, { value: "no", label: "No, I have two UANs" }, { value: "unsure", label: "Not sure" }] },
  { id: "kyc", q: "Is Aadhaar verified on your UAN, with your name and date of birth matching?", opts: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unsure", label: "Not sure" }] },
  { id: "exitDate", q: "Is an exit date recorded for your old job?", opts: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unsure", label: "Not sure" }] },
  { id: "employerActive", q: "Is your old employer still operating?", opts: [{ value: "yes", label: "Yes" }, { value: "no", label: "Closed or not responding" }] },
  { id: "trust", q: "Was your old PF managed by a company trust instead of EPFO?", opts: [{ value: "no", label: "No, EPFO" }, { value: "yes", label: "Yes, a company trust" }, { value: "unsure", label: "Not sure" }] },
];

export function transferPlan(a: TransferAnswers): TransferStep[] {
  const s: TransferStep[] = [];
  if (a.sameUan === "unsure") s.push({ title: "Check your service history", body: "Log in and open View › Service History. If both jobs are listed, they're under one UAN. If the old job is missing, look for a different UAN on your old payslips.", rules: [] });
  if (a.sameUan === "no") s.push({ title: "Merge your two UANs", body: "Keep the UAN that's linked to Aadhaar. Transfer the old UAN's member ID into it using One Member – One EPF Account, then ask EPFO to deactivate the old UAN through EPFiGMS or the helpdesk.", rules: ["R8"] });
  if (a.kyc && a.kyc !== "yes") s.push({ title: "Fix your KYC first", body: "Aadhaar must show Verified under Manage › KYC, and your name, date of birth and gender must match Aadhaar exactly. With an Aadhaar-verified UAN you can correct details yourself.", rules: ["R9"] });
  if (a.exitDate && a.exitDate !== "yes") s.push({ title: "Mark the exit date for the old job", body: "Go to Manage › Mark Exit. It's allowed two months after the last contribution. Use your real last working day.", rules: [] });
  if (a.trust && a.trust !== "no") s.push({ title: "Ask the company trust to transfer", body: "Company-run PF trusts don't always support online Form 13. Ask your old HR to have the trust transfer your balance and service details to EPFO.", rules: [] });
  if (a.employerActive === "no" && a.kyc !== "yes") s.push({ title: "Go through the EPFO regional office", body: "If the employer has closed and your KYC isn't verified, submit a Joint Declaration and the transfer request at your EPFO regional office, with Aadhaar and old salary slips.", rules: ["R9"] });
  s.push({ title: "File the transfer online", body: "Go to Online Services › One Member – One EPF Account (Transfer Request). Pick your previous member ID and confirm with the Aadhaar OTP. With verified KYC, you usually don't need employer approval.", rules: ["R8"] });
  s.push({ title: "Track it and escalate if it stalls", body: "Check Online Services › Track Claim Status. Once the old office approves, your balance and pension service move automatically. If it's pending beyond 20 days, raise an EPFiGMS grievance and quote the deadline.", rules: ["R6"] });
  s.push({ title: "Confirm it landed", body: "Open your passbook and check that the old balance and service now appear under your current member ID.", rules: [] });
  return s;
}
