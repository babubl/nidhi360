import { useState } from "react";
import { estimateEpsPension } from "../../lib/calc/epsPension";
import { inr } from "../../lib/format";
import { Callout, Card, Field, NumberInput, Row, Stat, cx } from "../../components/ui";
import { ExpertHelp, PageHero, RulesUsed, SavedNote, ToolGrid, useTitle } from "../../components/ToolPage";
import { useMe } from "../../lib/storage";

export default function Pension() {
  useTitle("EPS pension estimate", "Estimate your EPS monthly pension at 58, early from 50 or deferred to 60, including the ₹25,000 wage ceiling from September 2026.");
  const [salary, setSalary] = useMe("salary", 40000);
  const [service, setService] = useMe("epsYears", 18);
  const [age, setAge] = useMe("age", 48);
  const [leave, setLeave] = useState(58);
  const [start, setStart] = useState(58);

  // Pension can't start before you leave covered employment (or before today), and 58 is the normal age.
  const minStart = Math.min(58, Math.max(50, age, leave));
  const startAge = Math.max(start, minStart);
  const r = estimateEpsPension({ salary, serviceSoFar: service, currentAge: age, leaveAge: leave, startAge });
  const compare = [...new Set([minStart, 55, 58, 60])].filter((a) => a >= minStart).sort((x, y) => x - y).map((a) => ({ a, p: estimateEpsPension({ salary, serviceSoFar: service, currentAge: age, leaveAge: leave, startAge: a }).monthlyPension }));
  const max = Math.max(...compare.map((c) => c.p), 1);

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="How much pension will EPS pay me?"
        intro="Part of your employer's PF contribution goes to the Employees' Pension Scheme. With 10 or more years of service it pays a monthly pension for life. See what yours could be, and what starting early or late does to it." />
      <ToolGrid
        summary={r.eligible ? { label: `Monthly pension from ${startAge}`, value: inr(r.monthlyPension) } : { label: "EPS pension", value: "Below 10 years" }}
        form={
          <Card className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Basic + DA per month" htmlFor="sal" hint="Counted only up to the wage ceiling (₹25,000 from Sep 2026)">
                <NumberInput id="sal" prefix="₹" value={salary} onChange={setSalary} min={0} step={1000} />
              </Field>
              <Field label="Your age" htmlFor="age"><NumberInput id="age" value={age} onChange={setAge} min={18} max={60} suffix="years" /></Field>
              <Field label="EPS service so far" htmlFor="svc" hint="Years in PF-covered jobs, with transfers done">
                <NumberInput id="svc" value={service} onChange={setService} min={0} step={0.5} suffix="years" />
              </Field>
              <Field label="Age you'll stop working" htmlFor="leave" hint="In a PF-covered job">
                <NumberInput id="leave" value={leave} onChange={setLeave} min={age} max={60} suffix="years" />
              </Field>
            </div>
            <Field label={`Start pension at age ${startAge}`} htmlFor="start" hint={minStart > 50 ? `Earliest for you is ${minStart}, after you stop working. 58 is standard, 60 is the latest.` : "50 is the earliest, 58 is standard, 60 is the latest"}>
              <input id="start" type="range" min={minStart} max={60} value={startAge} onChange={(e) => setStart(Number(e.target.value))} className="w-full accent-brand-600" />
              <div className="flex justify-between text-xs text-muted"><span>{minStart}</span><span>60</span></div>
            </Field>
            <Callout>
              <p>Not covered here: members who opted for a higher pension on actual salary, and disability or family pension.</p>
            </Callout>
            <SavedNote />
          </Card>
        }
        result={
          <Card className="space-y-5">
            {r.eligible ? (
              <>
                <Stat label={`Estimated monthly pension from age ${startAge}`} value={inr(r.monthlyPension)} sub={`${inr(r.monthlyPension * 12)} a year, for life`} />
                <dl>
                  <Row label="Total pensionable service" value={`${+r.totalService.toFixed(1)} years${r.weightage ? ` + ${r.weightage} bonus` : ""}`} />
                  <Row label="Pensionable salary (avg. of last 60 months)" value={inr(r.pensionableSalary)} />
                  <Row label="Formula pension at 58" value={inr(r.basePension)} />
                  {r.adjustmentPct !== 0 && <Row label={r.adjustmentPct < 0 ? "Reduction for starting early" : "Increase for deferring"} value={`${r.adjustmentPct > 0 ? "+" : ""}${r.adjustmentPct}%`} tone={r.adjustmentPct < 0 ? "danger" : undefined} />}
                </dl>
                <div>
                  <p className="text-sm font-semibold text-ink">When should you start?</p>
                  <div className="mt-3 space-y-2">
                    {compare.map((c) => (
                      <div key={c.a} className="flex items-center gap-3 text-sm">
                        <span className="w-14 shrink-0 text-muted">Age {c.a}</span>
                        <div className="h-7 flex-1 overflow-hidden rounded bg-canvas">
                          <div className={cx("flex h-full items-center rounded px-2 text-xs font-semibold text-white", c.a === startAge ? "bg-brand-600" : "bg-brand-200 text-brand-900")} style={{ width: `${Math.max(18, (c.p / max) * 100)}%` }}>
                            <span className={c.a === startAge ? "text-white" : "text-brand-900"}>{inr(c.p)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : <Callout tone="warn" title="No monthly pension yet">{r.notes[0]}</Callout>}
            {r.notes.slice(r.eligible ? 0 : 1).map((n) => <Callout key={n}>{n}</Callout>)}
            <Callout title="Once your pension starts">
              <p>Submit a digital life certificate (Jeevan Pramaan) every year, or the pension stops until you do.</p>
            </Callout>
            <ExpertHelp context="my EPS pension" />
          </Card>
        }
      />
      <RulesUsed ids={["R14", "R24", "R10", "R4"]} />
    </>
  );
}
