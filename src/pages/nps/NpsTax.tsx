import { useState } from "react";
import { npsTaxSaving } from "../../lib/calc/nps";
import { inr } from "../../lib/format";
import { Callout, Card, Cites, Field, NumberInput, Row, Segmented, Stat } from "../../components/ui";
import { PageHero, RulesUsed, ToolGrid } from "../../components/ToolPage";

export default function NpsTax() {
  const [regime, setRegime] = useState<"new" | "old">("new");
  const [basic, setBasic] = useState(900000);
  const [employerPct, setEmployerPct] = useState(10);
  const [own, setOwn] = useState(50000);
  const [used80C, setUsed80C] = useState(150000);
  const [slab, setSlab] = useState(30);
  const r = npsTaxSaving({ regime, basic, employerPct, ownContribution: own, used80C, slabPct: slab });
  const ifFull = npsTaxSaving({ regime, basic, employerPct: regime === "new" ? 14 : 10, ownContribution: own, used80C, slabPct: slab });

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "NPS tools" }} title="How much tax does NPS save me?"
        intro="The answer depends heavily on your tax regime. In the new regime, only your employer's contribution counts, so it's worth knowing what to ask HR for." />
      <ToolGrid
        summary={{ label: "Tax you save this year", value: inr(r.taxSaved) }}
        form={
          <Card className="space-y-5">
            <Field label="Your tax regime"><Segmented label="Tax regime" value={regime} onChange={setRegime} options={[{ value: "new", label: "New regime" }, { value: "old", label: "Old regime" }]} /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Annual basic + DA" htmlFor="basic"><NumberInput id="basic" prefix="₹" value={basic} onChange={setBasic} min={0} step={10000} /></Field>
              <Field label="Employer NPS contribution" htmlFor="emp" hint="As % of basic + DA. 0 if none"><NumberInput id="emp" value={employerPct} onChange={setEmployerPct} min={0} max={20} suffix="%" /></Field>
              {regime === "old" && <>
                <Field label="Your own NPS contribution a year" htmlFor="own"><NumberInput id="own" prefix="₹" value={own} onChange={setOwn} min={0} step={5000} /></Field>
                <Field label="Already used under 80C" htmlFor="c80" hint="EPF, PPF, ELSS, insurance, tuition fees"><NumberInput id="c80" prefix="₹" value={used80C} onChange={setUsed80C} min={0} step={5000} /></Field>
              </>}
            </div>
            <Field label="Your highest tax slab">
              <Segmented label="Tax slab" value={slab} onChange={setSlab} options={[5, 10, 15, 20, 25, 30].map((v) => ({ value: v, label: `${v}%` }))} />
            </Field>
          </Card>
        }
        result={
          <Card className="space-y-5">
            <Stat label="Tax you save this year" value={inr(r.taxSaved)} sub="Including 4% cess" />
            <dl>
              <Row label="Employer contribution" value={inr(r.employerAmount)} />
              <Row label={`Deductible (up to ${regime === "new" ? 14 : 10}% of basic + DA)`} value={inr(r.employerDeduction)} />
              {regime === "old" && <Row label="Your contribution within ₹1.5 lakh (80C)" value={inr(r.own80C)} />}
              {regime === "old" && <Row label="Extra ₹50,000 deduction (80CCD(1B))" value={inr(r.own1B)} />}
              <Row label="Total deduction" value={inr(r.totalDeduction)} strong />
            </dl>
            {r.employerOverCap && <Callout tone="warn">Your employer contributes {inr(r.employerAmount)}, but only {regime === "new" ? 14 : 10}% of basic + DA is deductible. The rest is taxable.</Callout>}
            {regime === "new" && ifFull.taxSaved > r.taxSaved + 1 && (
              <Callout tone="success" title="Ask HR about this">
                <p>If {employerPct === 0 ? "your employer started contributing" : "your employer contributed"} the full 14% from your CTC, you'd save <strong>{inr(ifFull.taxSaved)}</strong> a year instead of {inr(r.taxSaved)}. Your take-home changes, but the tax saved is yours.</p>
              </Callout>
            )}
            {regime === "new" && <Callout>Your own NPS contribution gets no deduction in the new regime.</Callout>}
            <p className="text-[13px] text-muted">Employer contributions to EPF, NPS and superannuation together above ₹7.5 lakh a year are taxable. <Cites ids={["R22"]} /></p>
          </Card>
        }
      />
      <RulesUsed ids={["R22", "R21"]} />
    </>
  );
}
