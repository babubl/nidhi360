import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CalendarPlus, CheckCircle2, Flame, Sparkles } from "lucide-react";
import { Button, Callout, Card, Container, Field, NumberInput, Segmented, StatusBadge } from "../components/ui";
import { PageHero } from "../components/ToolPage";
import { RULES, RULES_CHECKED_ON } from "../data/rules";
import { useMe, usePreviousVisit, useStoredState } from "../lib/storage";
import { analyse, changesSince, expectedMonthlyCredit, monthKey, monthLabel, monthTasks, streak, type LogEntry } from "../lib/calc/monthly";
import { monthlyCheckReminder, toIcs } from "../lib/calc/reminders";
import { inr, inrShort, fmtDate } from "../lib/format";
import { track } from "../lib/track";

export default function Monthly() {
  const now = new Date();
  const thisMonth = monthKey(now);
  const [basic, setBasic] = useMe("salary", 40000);
  const [vpf, setVpf] = useStoredState("monthly.vpf", 0);
  const [full, setFull] = useStoredState<"full" | "ceiling">("monthly.base", "full");
  const [log, setLog] = useStoredState<LogEntry[]>("monthly.log", []);
  const [balance, setBalance] = useMe("pfBalance", 300000);
  const [day, setDay] = useStoredState("monthly.day", 20);
  const prev = usePreviousVisit();
  const [saved, setSaved] = useState(false);

  const expected = expectedMonthlyCredit(basic, vpf, full === "full");
  const readings = analyse(log, expected);
  const latest = readings[readings.length - 1];
  const changes = changesSince(prev, RULES);
  const tasks = monthTasks(now.getMonth() + 1);
  const run = streak(log, now);
  const maxBal = Math.max(1, ...readings.map((r) => r.balance));

  const save = () => {
    setLog((l) => [...l.filter((e) => e.month !== thisMonth), { month: thisMonth, balance }].sort((a, b) => a.month.localeCompare(b.month)).slice(-36));
    setSaved(true);
    track("Monthly logged");
  };
  const remove = (m: string) => setLog((l) => l.filter((e) => e.month !== m));
  const download = () => {
    const site = location.origin + import.meta.env.BASE_URL;
    const blob = new Blob([toIcs([monthlyCheckReminder(day)], site)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nidhi360-monthly-check.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    track("Calendar downloaded", { events: 1 });
  };

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="Your monthly PF check-up"
        intro="Two minutes, once a month. Log your passbook balance, catch a missed employer deposit early, and see what changed in the rules since you were last here." />
      <Container className="grid gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {changes.length > 0 && (
            <Card className="border-brand-200 bg-brand-50">
              <p className="flex items-center gap-2 font-bold text-ink"><Sparkles className="size-4 text-brand-600" aria-hidden />{changes.length} rule {changes.length === 1 ? "change" : "changes"} since your last visit on {fmtDate(prev!)}</p>
              <ul className="mt-3 space-y-2 text-[14.5px]">
                {changes.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex items-start gap-2"><StatusBadge status={r.status} /><span><Link to={`/rules#${r.id}`} className="font-semibold">{r.title}</Link> <span className="text-muted">· {fmtDate(r.effective)}</span></span></li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-ink">Log {monthLabel(thisMonth)}</h2>
              <p className="mt-1 text-[14.5px] text-body">Open your EPF passbook and note the total balance. We never ask for your UAN or password; type the number yourself.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Basic + DA per month" htmlFor="m-basic" hint="Used to work out what should be credited"><NumberInput id="m-basic" prefix="₹" value={basic} onChange={setBasic} min={0} step={1000} /></Field>
              <Field label="Total PF balance in passbook" htmlFor="m-bal"><NumberInput id="m-bal" prefix="₹" value={balance} onChange={(v) => { setBalance(v); setSaved(false); }} min={0} step={1000} /></Field>
              <Field label="VPF (optional)" htmlFor="m-vpf" hint="% of basic on top of 12%"><NumberInput id="m-vpf" value={vpf} onChange={setVpf} min={0} max={88} suffix="%" /></Field>
              <Field label="Employer contributes on">
                <Segmented label="Employer contribution base" value={full} onChange={setFull} options={[{ value: "full", label: "Full basic" }, { value: "ceiling", label: "Up to ₹25,000" }]} />
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={save}>Save this month</Button>
              <span className="text-sm text-muted">Expected monthly credit: <strong className="num text-ink">{inr(expected)}</strong></span>
              {saved && <span role="status" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700"><CheckCircle2 className="size-4" aria-hidden />Saved on this device</span>}
            </div>

            {latest && latest.verdict === "baseline" && <Callout title="Baseline saved">Come back next month and log again. We'll compare the two and tell you if a deposit is missing.</Callout>}
            {latest?.verdict === "ok" && <Callout tone="success" title="Looks right">Your balance rose by {inr(latest.delta!)} against about {inr(latest.expected!)} expected. Your employer's deposit appears to have arrived.</Callout>}
            {latest?.verdict === "low" && (
              <Callout tone="warn" title="Possible missed or short deposit">
                Your balance rose by {inr(latest.delta!)}, but about {inr(latest.expected!)} was expected. Check the passbook for the missing month, compare with your payslip, and ask HR. If it stays unpaid,{" "}
                <Link to="/pf/grievance">draft a complaint</Link>.
              </Callout>
            )}
            {latest?.verdict === "fell" && <Callout tone="warn" title="Your balance went down">That happens after a withdrawal or a transfer out. If you did neither, <Link to="/pf/health-check">run the account check</Link> and look at the passbook entries.</Callout>}
          </Card>

          {readings.length > 0 && (
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">Your history</h2>
                {run > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800"><Flame className="size-4" aria-hidden />{run} {run === 1 ? "month" : "months"} in a row</span>}
              </div>
              <ul className="mt-4 space-y-2">
                {[...readings].reverse().map((r) => (
                  <li key={r.month} className="flex items-center gap-3 text-sm">
                    <span className="w-20 shrink-0 text-muted">{monthLabel(r.month)}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded bg-canvas"><div className="h-full rounded bg-brand-600" style={{ width: `${Math.max(4, (r.balance / maxBal) * 100)}%` }} /></div>
                    <span className="num w-20 shrink-0 text-right font-semibold text-ink">{inrShort(r.balance)}</span>
                    <span className="w-6 shrink-0" title={r.verdict === "ok" ? "Deposit looks right" : r.verdict === "baseline" ? "Starting point" : "Check this month"}>
                      {r.verdict === "ok" && <CheckCircle2 className="size-4 text-brand-600" aria-label="Deposit looks right" />}
                      {(r.verdict === "low" || r.verdict === "fell") && <AlertTriangle className="size-4 text-amber-600" aria-label="Check this month" />}
                    </span>
                    <button type="button" onClick={() => remove(r.month)} className="text-xs text-muted underline" aria-label={`Remove ${monthLabel(r.month)}`}>Remove</button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-ink">This month</h2>
            <ul className="mt-3 divide-y divide-line">
              {tasks.map((t) => (
                <li key={t.title} className="py-3 first:pt-0 last:pb-0">
                  <Link to={t.path} className="font-semibold text-ink no-underline hover:text-brand-700">{t.title}</Link>
                  <p className="mt-0.5 text-[14px] text-body">{t.detail}</p>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-3">
            <h2 className="text-lg font-bold text-ink">Never forget it</h2>
            <p className="text-[14.5px] text-body">Add a repeating monthly reminder to your calendar. It opens straight to this page.</p>
            <Field label="Remind me on day" htmlFor="m-day" hint="1 to 28 of every month"><NumberInput id="m-day" value={day} onChange={setDay} min={1} max={28} /></Field>
            <Button variant="secondary" onClick={download}><CalendarPlus className="size-4" />Add monthly reminder</Button>
            <p className="text-[13px] text-muted">Your log is saved only in this browser. <Link to="/legal">Clear it any time</Link>.</p>
          </Card>
          <p className="text-[13px] text-muted">Rules last verified on {fmtDate(RULES_CHECKED_ON)}. Interest is credited yearly, so a month with interest may rise by more than expected.</p>
        </div>
      </Container>
    </>
  );
}
