import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Download, Trash2, Upload } from "lucide-react";
import { projectEpf } from "../lib/calc/epfCorpus";
import { estimateEpsPension } from "../lib/calc/epsPension";
import { projectCorpus } from "../lib/calc/nps";
import { buildReminders } from "../lib/calc/reminders";
import { clearSavedData, exportSavedData, importSavedData, useMe } from "../lib/storage";
import { fmtDate, inr, inrShort } from "../lib/format";
import { Button, ButtonLink, Callout, Card, Container, Field, NumberInput } from "../components/ui";
import { PageHero } from "../components/ToolPage";

const dateCls = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

interface Step { title: string; why: string; to: string }

/** A short, personal to-do list from the details the person has given. Most urgent first. */
function nextSteps(age: number, epsYears: number, lwd: string, npsCorpus: number): Step[] {
  const s: Step[] = [];
  if (lwd) s.push({ title: "Transfer or claim your old PF", why: "You've left a job. Move the PF to your new employer, or plan the withdrawal dates.", to: "/pf/job-change" });
  s.push({ title: "Check your account before you need it", why: "KYC, bank, name match and nominee cause most rejected claims. 2 minutes.", to: "/pf/health-check" });
  if (age >= 54) s.push({ title: "Decide when to start your EPS pension", why: "Starting before 58 cuts it 4% a year for life; waiting to 60 raises it.", to: "/pf/pension" });
  if (age >= 55 || (npsCorpus > 0 && age >= 50)) s.push({ title: "Plan your NPS exit", why: "Up to 80% lump sum, but only 60% is tax-free. Decide the split before 60.", to: "/nps/retirement" });
  if (epsYears > 0 && epsYears < 10) s.push({ title: `You're ${+(10 - epsYears).toFixed(1)} years from an EPS pension`, why: "At 10 years of service EPS pays a pension for life. Don't withdraw EPS when you change jobs.", to: "/answers/eps-withdraw-or-certificate" });
  if (age < 45) s.push({ title: "Check if you're on track to retire", why: "One answer from your PF, pension, NPS and savings.", to: "/retirement" });
  s.push({ title: "Log your passbook once a month", why: "Catches a missed employer deposit within weeks, not years.", to: "/monthly" });
  return s.slice(0, 5);
}

export default function MyPlan() {
  const [age, setAge] = useMe("age", 30);
  const [dob, setDob] = useMe("dob", "");
  const [salary, setSalary] = useMe("salary", 40000);
  const [pfBalance, setPfBalance] = useMe("pfBalance", 300000);
  const [epsYears, setEpsYears] = useMe("epsYears", 5);
  const [npsCorpus, setNpsCorpus] = useMe("npsCorpus", 0);
  const [npsYears, setNpsYears] = useMe("npsYears", 0);
  const [lwd, setLwd] = useMe("lastWorkingDay", "");
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [todayIso, setTodayIso] = useState("");
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => setTodayIso(new Date().toISOString().slice(0, 10)), []);

  // Age from date of birth, when given.
  useEffect(() => {
    if (!dob) return;
    const d = new Date(dob + "T00:00:00"), n = new Date();
    const a = n.getFullYear() - d.getFullYear() - (n < new Date(n.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
    if (a >= 15 && a <= 100) setAge(a);
  }, [dob, setAge]);

  const to58 = Math.max(age, 58);
  const epf = projectEpf({ basicMonthly: salary, currentBalance: pfBalance, age, retireAge: to58, salaryGrowthPct: 7, ratePct: 8.25, vpfPct: 0, employerOnFullBasic: false }).balanceAtRetirement;
  const eps = estimateEpsPension({ salary, serviceSoFar: epsYears, currentAge: age, leaveAge: to58, startAge: 58 });
  const nps = npsCorpus > 0 ? projectCorpus({ age, yearsInNps: npsYears, corpus: npsCorpus, monthlyContribution: 0, annualStepUpPct: 0, expectedReturnPct: 10, exitAge: Math.max(age, 60), sector: "private" }) : null;
  const dates = todayIso ? buildReminders({ dob: dob || undefined, lastWorkingDay: lwd || undefined, hasNps: npsCorpus > 0 }).filter((r) => r.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4) : [];
  const steps = nextSteps(age, epsYears, lwd, npsCorpus);

  const doExport = () => {
    const blob = new Blob([exportSavedData()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nidhi360-my-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const doImport = async (f: File) => {
    try {
      const n = importSavedData(await f.text());
      setMsg({ tone: "success", text: `Restored ${n} saved ${n === 1 ? "item" : "items"}. Reloading…` });
      setTimeout(() => location.reload(), 900);
    } catch (e) {
      setMsg({ tone: "danger", text: e instanceof Error ? e.message : "That file couldn't be read." });
    }
  };

  return (
    <>
      <PageHero title="My plan" intro="Your PF, pension and NPS in one place, with the next things to do. Type your details once; every tool on Nidhi360 uses them. Everything stays on this device, with no account." />
      <Container className="grid items-start gap-6 py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
        <Card className="space-y-5">
          <p className="text-sm font-semibold text-ink">Your details</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Date of birth" htmlFor="dob" hint="Optional. Sets your age and age-based dates.">
              <input id="dob" type="date" className={dateCls} value={dob} max={todayIso || undefined} onChange={(e) => setDob(e.target.value)} />
            </Field>
            <Field label="Age" htmlFor="age"><NumberInput id="age" value={age} onChange={setAge} min={18} max={100} suffix="years" /></Field>
            <Field label="Basic + DA a month" htmlFor="sal"><NumberInput id="sal" prefix="₹" value={salary} onChange={setSalary} min={0} step={1000} /></Field>
            <Field label="PF balance" htmlFor="pf"><NumberInput id="pf" prefix="₹" value={pfBalance} onChange={setPfBalance} min={0} step={10000} /></Field>
            <Field label="EPS service so far" htmlFor="eps"><NumberInput id="eps" value={epsYears} onChange={setEpsYears} min={0} step={0.5} suffix="years" /></Field>
            <Field label="Last working day" htmlFor="lwd" hint="Only if you've left a job and not joined another">
              <input id="lwd" type="date" className={dateCls} value={lwd} max={todayIso || undefined} onChange={(e) => setLwd(e.target.value)} />
            </Field>
            <Field label="NPS balance" htmlFor="npsc"><NumberInput id="npsc" prefix="₹" value={npsCorpus} onChange={setNpsCorpus} min={0} step={10000} /></Field>
            <Field label="Years in NPS" htmlFor="npsy"><NumberInput id="npsy" value={npsYears} onChange={setNpsYears} min={0} suffix="years" /></Field>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="text-sm font-semibold text-ink">Your snapshot</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Link to="/pf/calculator" className="rounded-xl border border-line p-4 no-underline hover:border-brand-200 hover:bg-brand-50">
                <span className="block text-[13px] text-muted">PF at {to58}</span>
                <span className="num block text-2xl font-bold text-ink">{inrShort(epf)}</span>
                <span className="block text-[12px] text-muted">at 8.25%, 7% raises</span>
              </Link>
              <Link to="/pf/pension" className="rounded-xl border border-line p-4 no-underline hover:border-brand-200 hover:bg-brand-50">
                <span className="block text-[13px] text-muted">EPS pension at 58</span>
                <span className="num block text-2xl font-bold text-ink">{eps.eligible ? inr(eps.monthlyPension) : "—"}</span>
                <span className="block text-[12px] text-muted">{eps.eligible ? "a month, for life" : "needs 10 years' service"}</span>
              </Link>
              <Link to="/nps/retirement" className="rounded-xl border border-line p-4 no-underline hover:border-brand-200 hover:bg-brand-50">
                <span className="block text-[13px] text-muted">NPS at 60</span>
                <span className="num block text-2xl font-bold text-ink">{nps ? inrShort(nps.corpusAtExit) : "—"}</span>
                <span className="block text-[12px] text-muted">{nps ? "today's balance, 10% growth" : "add your balance"}</span>
              </Link>
            </div>
            <ButtonLink to="/retirement" variant="gold" className="mt-5 w-full sm:w-auto">Will it be enough? Check my retirement <ArrowRight className="size-4" /></ButtonLink>
          </Card>

          <Card>
            <p className="text-sm font-semibold text-ink">Do next</p>
            <ol className="mt-3 space-y-2">
              {steps.map((s, k) => (
                <li key={s.to + k}>
                  <Link to={s.to} className="flex gap-3 rounded-xl border border-line p-3.5 no-underline hover:border-brand-200 hover:bg-brand-50">
                    <span className="num flex size-7 shrink-0 items-center justify-center rounded-full bg-night text-sm font-bold text-ivory">{k + 1}</span>
                    <span><span className="block font-semibold text-ink">{s.title}</span><span className="block text-[14px] text-muted">{s.why}</span></span>
                  </Link>
                </li>
              ))}
            </ol>
          </Card>

          {dates.length > 0 && (
            <Card>
              <div className="flex items-baseline justify-between gap-3"><p className="text-sm font-semibold text-ink">Coming up</p><Link to="/reminders" className="text-sm font-semibold">Add to calendar ›</Link></div>
              <ul className="mt-3">
                {dates.map((d) => (
                  <li key={d.date + d.title} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-0">
                    <Link to={d.path} className="text-[15px] text-ink no-underline hover:underline">{d.title}</Link>
                    <span className="num shrink-0 text-sm text-muted">{fmtDate(d.date)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="space-y-4">
            <p className="text-sm font-semibold text-ink">Move to another phone or computer</p>
            <p className="text-[15px] text-body">Your details live only in this browser. Save a backup file and open it on another device to carry everything over, including your monthly passbook log.</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={doExport}><Download className="size-4" />Save backup</Button>
              <Button variant="secondary" onClick={() => file.current?.click()}><Upload className="size-4" />Restore backup</Button>
              <Button variant="ghost" onClick={() => { if (confirm("Clear everything Nidhi360 saved on this device?")) { clearSavedData(); location.reload(); } }}><Trash2 className="size-4" />Clear all</Button>
              <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ""; }} />
            </div>
            {msg && <Callout tone={msg.tone}>{msg.text}</Callout>}
            <p className="text-[13px] text-muted">The backup holds amounts and dates, never your UAN, PAN or passwords. Keep it private.</p>
          </Card>
        </div>
      </Container>
    </>
  );
}
