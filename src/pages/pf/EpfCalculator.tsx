import { useState } from "react";
import { Link } from "react-router-dom";
import { projectEpf } from "../../lib/calc/epfCorpus";
import { useMe } from "../../lib/storage";
import { inr, inrShort } from "../../lib/format";
import { Callout, Card, Cites, Field, NumberInput, Row, Segmented, Stat } from "../../components/ui";
import { ExpertHelp, PageHero, RulesUsed, SavedNote, ToolGrid } from "../../components/ToolPage";

export default function EpfCalculator() {
  const [basic, setBasic] = useMe("salary", 40000);
  const [balance, setBalance] = useMe("pfBalance", 300000);
  const [age, setAge] = useMe("age", 30);
  const [retire, setRetire] = useState(58);
  const [growth, setGrowth] = useState(6);
  const [rate, setRate] = useState(8.25);
  const [vpf, setVpf] = useState(0);
  const [full, setFull] = useState<"full" | "ceiling">("full");

  const r = projectEpf({ basicMonthly: basic, currentBalance: balance, age, retireAge: retire, salaryGrowthPct: growth, ratePct: rate, vpfPct: vpf, employerOnFullBasic: full === "full" });
  const todays = r.balanceAtRetirement / Math.pow(1.06, Math.max(0, retire - age));
  const marks = r.years.filter((_, i) => (i + 1) % 5 === 0 || i === r.years.length - 1);
  const max = Math.max(1, ...marks.map((m) => m.balance));
  const total = r.yourContributions + r.employerContributions + r.interestEarned + Math.max(0, balance) || 1;

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="How much PF will I have at retirement?"
        intro="Project your EPF balance using your salary, the current 8.25% rate and the new ₹25,000 wage ceiling. See how much comes from you, your employer and interest." />
      <ToolGrid
        summary={{ label: `PF at ${retire}`, value: inrShort(r.balanceAtRetirement) }}
        form={
          <Card className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Basic + DA per month" htmlFor="basic"><NumberInput id="basic" prefix="₹" value={basic} onChange={setBasic} min={0} step={1000} /></Field>
              <Field label="Current PF balance" htmlFor="bal" hint="From your passbook; employee + employer"><NumberInput id="bal" prefix="₹" value={balance} onChange={setBalance} min={0} step={10000} /></Field>
              <Field label="Your age" htmlFor="age"><NumberInput id="age" value={age} onChange={setAge} min={18} max={57} suffix="years" /></Field>
              <Field label="Project to age" htmlFor="ret" hint="Interest stops at 58"><NumberInput id="ret" value={retire} onChange={(v) => setRetire(Math.min(58, v))} min={age + 1} max={58} suffix="years" /></Field>
              <Field label="Yearly salary growth" htmlFor="g"><NumberInput id="g" value={growth} onChange={setGrowth} min={0} max={20} step={0.5} suffix="%" /></Field>
              <Field label="EPF interest rate" htmlFor="r" hint="8.25% for FY 2025-26"><NumberInput id="r" value={rate} onChange={setRate} min={0} max={12} step={0.05} suffix="%" /></Field>
              <Field label="VPF (extra, optional)" htmlFor="vpf" hint="% of basic + DA on top of 12%"><NumberInput id="vpf" value={vpf} onChange={setVpf} min={0} max={88} suffix="%" /></Field>
            </div>
            <Field label="Your employer contributes on">
              <Segmented label="Employer contribution base" value={full} onChange={setFull} options={[{ value: "full", label: "Full basic + DA" }, { value: "ceiling", label: "Only up to ₹25,000" }]} />
            </Field>
            <SavedNote />
          </Card>
        }
        result={
          <Card className="space-y-5">
            <Stat label={`Estimated PF balance at ${retire}`} value={inrShort(r.balanceAtRetirement)} sub={`≈ ${inrShort(todays)} in today's money (6% inflation)`} />
            <div>
              <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label="Where the balance comes from">
                <div style={{ width: `${(Math.max(0, balance) / total) * 100}%` }} className="bg-brand-900" />
                <div style={{ width: `${(r.yourContributions / total) * 100}%` }} className="bg-brand-600" />
                <div style={{ width: `${(r.employerContributions / total) * 100}%` }} className="bg-brand-500/70" />
                <div style={{ width: `${(r.interestEarned / total) * 100}%` }} className="bg-amber-500" />
              </div>
              <dl className="mt-3">
                <Row label="Today's balance" value={inr(balance)} />
                <Row label="You will put in" value={inr(r.yourContributions)} />
                <Row label="Your employer will put in (EPF share)" value={inr(r.employerContributions)} />
                <Row label="Interest earned" value={inr(r.interestEarned)} strong />
              </dl>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Growth over time</p>
              <div className="mt-3 space-y-2">
                {marks.map((m) => (
                  <div key={m.age} className="flex items-center gap-3 text-sm">
                    <span className="w-14 shrink-0 text-muted">Age {m.age}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded bg-canvas"><div className="h-full rounded bg-brand-600" style={{ width: `${Math.max(3, (m.balance / max) * 100)}%` }} /></div>
                    <span className="num w-20 shrink-0 text-right font-semibold text-ink">{inrShort(m.balance)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-canvas p-4 text-[14.5px] text-body">
              <p className="font-semibold text-ink">Every month right now</p>
              <p className="mt-1">You {inr(r.monthlyNow.employee)}{r.monthlyNow.vpf > 0 && ` + VPF ${inr(r.monthlyNow.vpf)}`}, employer {inr(r.monthlyNow.employerEpf)} to PF and {inr(r.monthlyNow.eps)} to your <Link to="/pf/pension">EPS pension</Link> (not part of this balance).</p>
            </div>
            {r.yourContributions / Math.max(1, retire - age) > 250000 && <Callout tone="warn">Your own contributions exceed ₹2.5 lakh a year, so part of the interest will be taxable. <Cites ids={["R25"]} /></Callout>}
            <p className="text-[13px] text-muted">Assumes today's rate holds; EPFO declares it every year. <Cites ids={["R11", "R10", "R27"]} /></p>
            <ExpertHelp context="my PF balance projection" />
          </Card>
        }
      />
      <RulesUsed ids={["R11", "R10", "R27", "R25", "R14"]} />
    </>
  );
}
