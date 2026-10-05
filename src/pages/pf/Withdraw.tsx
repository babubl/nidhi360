import { useState } from "react";
import { Link } from "react-router-dom";
import { estimateWithdrawal, PURPOSE_LABELS, type Purpose } from "../../lib/calc/pfWithdrawal";
import { inr, inrShort } from "../../lib/format";
import { Callout, Card, Cites, Field, NumberInput, Row, Segmented, Select, Stat } from "../../components/ui";
import { ExpertHelp, PageHero, RulesUsed, ToolGrid, useTitle } from "../../components/ToolPage";

export default function Withdraw() {
  useTitle("How much PF can I withdraw?", "Estimate your PF withdrawal under the EPF Scheme 2026: medical, education, marriage, housing, job loss, retirement. Includes TDS.");
  const [purpose, setPurpose] = useState<Purpose>("illness");
  const [balance, setBalance] = useState(400000);
  const [years, setYears] = useState(4);
  const [transferred, setTransferred] = useState<"yes" | "no" | "none">("none");
  const [currentJobYears, setCurrentJobYears] = useState(2);
  const [age, setAge] = useState(32);
  const [monthsUnemployed, setMonthsUnemployed] = useState(3);
  const [pan, setPan] = useState<"yes" | "no">("yes");

  const continuous = transferred === "no" ? currentJobYears : years;
  const r = estimateWithdrawal({ purpose, balance, membershipMonths: Math.round(years * 12), continuousServiceYears: continuous, age, monthsUnemployed, panLinked: pan === "yes" });
  const pct = balance > 0 ? Math.round((r.amount / balance) * 100) : 0;

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="How much PF can I withdraw?"
        intro="Based on the EPF Scheme 2026, which applies from 1 July 2026. You'll see the exact eligible amount on the EPFO portal when you file. This tells you what to expect, and what it costs you." />
      <ToolGrid
        summary={r.eligible ? { label: "You can withdraw", value: inr(r.amount) } : { label: "Withdrawal", value: "Not eligible yet" }}
        form={
          <Card className="space-y-5">
            <Field label="What do you need the money for?" htmlFor="purpose">
              <Select id="purpose" value={purpose} onChange={(v) => setPurpose(v as Purpose)} options={Object.entries(PURPOSE_LABELS).map(([value, label]) => ({ value, label }))} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Current PF balance" htmlFor="bal" hint="Employee + employer share, from your passbook">
                <NumberInput id="bal" prefix="₹" value={balance} onChange={setBalance} min={0} step={10000} />
              </Field>
              <Field label="Your age" htmlFor="age">
                <NumberInput id="age" value={age} onChange={setAge} min={18} max={75} suffix="years" />
              </Field>
              <Field label="Total years as a PF member" htmlFor="yrs" hint="Across all jobs">
                <NumberInput id="yrs" value={years} onChange={setYears} min={0} step={0.5} suffix="years" />
              </Field>
              {purpose === "unemployed" && (
                <Field label="Months since your last working day" htmlFor="unemp">
                  <NumberInput id="unemp" value={monthsUnemployed} onChange={setMonthsUnemployed} min={0} suffix="months" />
                </Field>
              )}
            </div>
            <Field label="Did you transfer PF from your earlier jobs?">
              <Segmented label="Transferred earlier PF" value={transferred} onChange={setTransferred}
                options={[{ value: "none", label: "No earlier jobs" }, { value: "yes", label: "Yes, all of it" }, { value: "no", label: "No" }]} />
            </Field>
            {transferred === "no" && (
              <Field label="Years at your current employer" htmlFor="cur" hint="Only transferred service counts as continuous for tax">
                <NumberInput id="cur" value={currentJobYears} onChange={setCurrentJobYears} min={0} step={0.5} suffix="years" />
              </Field>
            )}
            <Field label="Is your PAN linked to your UAN?">
              <Segmented label="PAN linked" value={pan} onChange={setPan} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
            </Field>
          </Card>
        }
        result={
          <Card className="space-y-5">
            {r.eligible ? (
              <>
                <Stat label="You can withdraw" value={inr(r.amount)} sub={`${pct}% of your balance`} />
                <div className="h-2.5 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} /></div>
                <dl>
                  <Row label="Stays in your account" value={inr(r.remains)} />
                  {r.tds > 0 && <Row label="Estimated TDS" value={`− ${inr(r.tds)}`} tone="danger" />}
                  {r.tds > 0 && <Row label="Approx. credited to your bank" value={inr(r.netAmount)} strong />}
                  <Row label="Form" value={`${r.form}, online`} />
                </dl>
              </>
            ) : (
              <Callout tone="danger" title="Not eligible yet"><p>{r.notes[0]}</p></Callout>
            )}
            {r.notes.slice(r.eligible ? 0 : 1).map((n) => <Callout key={n}>{n}</Callout>)}
            {r.eligible && r.amount > 0 && r.yearsTo58 > 0 && (
              <Callout tone="warn" title="What this withdrawal really costs">
                <p>Left in PF at 8.25% tax-free, {inr(r.amount)} would grow to about <strong>{inrShort(r.foregoneAt58)}</strong> by age 58.</p>
              </Callout>
            )}
            <div className="rounded-lg bg-canvas p-4 text-[14.5px] text-body">
              <p className="font-semibold text-ink">Your pension (EPS) money is separate</p>
              <p className="mt-1">Under 10 years of service you can take a withdrawal benefit, or keep a Scheme Certificate to protect your pension. At 10 years or more you get a monthly pension from 58. <Link to="/pf/pension" className="font-semibold text-brand-600">Estimate your pension</Link> <Cites ids={["R14"]} /></p>
            </div>
            <p className="text-[13px] text-muted">Estimate only. Rules used: <Cites ids={r.rules} /></p>
            <ExpertHelp context="withdrawing my PF" />
          </Card>
        }
      />
      <RulesUsed ids={["R2", "R3", "R4", "R5", "R13", "R14", "R7"]} />
    </>
  );
}
