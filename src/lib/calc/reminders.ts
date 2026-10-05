/**
 * Personal PF/NPS reminder calendar. Pure functions: build dated events from a few inputs,
 * then serialise to an .ics file the user adds to Google Calendar / Outlook / Apple Calendar.
 * Gives the product a reason to come back without accounts or a backend.
 */
export interface ReminderInput {
  /** ISO date of last working day, if the person has left a job. */
  lastWorkingDay?: string;
  /** ISO date of birth. */
  dob?: string;
  /** Already drawing an EPS pension. */
  pensioner?: boolean;
  /** Has an NPS account. */
  hasNps?: boolean;
  today?: Date;
}

export interface Reminder { date: string; title: string; detail: string; path: string; recurring?: "quarterly" | "yearly" }

const iso = (d: Date) => d.toISOString().slice(0, 10);
function addMonths(isoDate: string, m: number) { const d = new Date(isoDate + "T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() + m); return iso(d); }
function addYears(isoDate: string, y: number) { const d = new Date(isoDate + "T00:00:00Z"); d.setUTCFullYear(d.getUTCFullYear() + y); return iso(d); }
function addDays(isoDate: string, n: number) { const d = new Date(isoDate + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return iso(d); }

export function buildReminders(i: ReminderInput): Reminder[] {
  const today = iso(i.today ?? new Date());
  const r: Reminder[] = [];
  const nextQuarter = addMonths(today, 1).slice(0, 8) + "05";
  r.push({ date: nextQuarter, recurring: "quarterly", title: "Check your PF passbook", detail: "Confirm your employer deposited PF for every month, and that KYC still shows Verified.", path: "/pf/health-check" });

  if (i.lastWorkingDay) {
    const lwd = i.lastWorkingDay;
    r.push({ date: addMonths(lwd, 1), title: "PF: partial withdrawal now possible", detail: "One month after leaving, you can withdraw up to about 75% of your PF. If you've joined a new job, transfer it instead.", path: "/answers/withdraw-after-resigning" });
    r.push({ date: addMonths(lwd, 2), title: "PF: mark your exit date", detail: "Two months after the last contribution you can mark the exit date yourself (Manage › Mark Exit). Transfers and final claims need it.", path: "/answers/employer-not-approving" });
    r.push({ date: addMonths(lwd, 12), title: "PF: full settlement now possible", detail: "After 12 months without a PF-covered job, you can withdraw your full PF balance (Form 19).", path: "/pf/withdraw" });
    r.push({ date: addMonths(lwd, 36), title: "EPS: withdrawal benefit now possible", detail: "36 months after leaving, the EPS withdrawal benefit opens up (service under 10 years). Consider a Scheme Certificate instead if you may work again.", path: "/answers/eps-withdraw-or-certificate" });
  }

  if (i.dob) {
    const at = (y: number) => addYears(i.dob!, y);
    r.push({ date: at(55), title: "PF: retirement settlement unlocked", detail: "From 55 you can take your full PF on retirement, including the 25% that's otherwise locked.", path: "/pf/withdraw" });
    r.push({ date: addDays(at(58), -60), title: "EPS: prepare your pension claim (Form 10D)", detail: "Your EPS pension starts at 58. Check your service history and bank details now so the claim goes through first time.", path: "/pf/pension" });
    r.push({ date: at(58), title: "PF stops earning interest", detail: "PF interest is credited only until 58. Claim or plan your PF now.", path: "/answers/old-account" });
    if (i.hasNps) r.push({ date: addDays(at(60), -15), title: "NPS: decide to exit, continue or defer", detail: "Tell your CRA at least 15 days before 60 whether you'll exit or stay invested (up to 85). Plan the 60% tax-free split first.", path: "/nps/retirement" });
  }

  if (i.pensioner) {
    const y = today.slice(0, 4);
    const nov = `${y}-11-01` >= today ? `${y}-11-01` : `${+y + 1}-11-01`;
    r.push({ date: nov, recurring: "yearly", title: "Submit your life certificate (Jeevan Pramaan)", detail: "EPS pension stops if the yearly life certificate lapses. Submit it digitally via the Jeevan Pramaan app, your bank or a CSC.", path: "/answers/life-certificate" });
  }

  return r.filter((x) => x.recurring || x.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function toIcs(reminders: Reminder[], siteUrl: string, now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nidhi360//PF and NPS reminders//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:PF & NPS reminders"];
  reminders.forEach((r, n) => {
    const d = r.date.replace(/-/g, "");
    const end = addDays(r.date, 1).replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${d}-${n}@nidhi360`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${esc(r.title)}`,
      `DESCRIPTION:${esc(r.detail + "\n" + siteUrl.replace(/\/$/, "") + r.path)}`,
      ...(r.recurring === "quarterly" ? ["RRULE:FREQ=MONTHLY;INTERVAL=3"] : r.recurring === "yearly" ? ["RRULE:FREQ=YEARLY"] : []),
      "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(r.title)}`, "TRIGGER:PT9H", "END:VALARM",
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
