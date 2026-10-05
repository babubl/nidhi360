import { useState } from "react";
import { monthlyAnnuity, projectCorpus, type Sector } from "../../lib/calc/nps";
import { inr, inrShort } from "../../lib/format";
import { Callout, Card, Cites, Field, NumberInput, Row, Segmented, Stat } from "../../components/ui";
import { PageHero, RulesUsed, SavedNote, ToolGrid, useTitle } from "../../components/ToolPage";
import { useMe } from "../../lib/storage";

const COLORS = { taxFree: "#0B5D4B", taxable: "#D9A441", annuity: "#5E7CE2", systematic: "#8FB9AA" };

export default function NpsRetirement() {
  useTitle("NPS retirement and exit planner", "Project your NPS corpus and see what you can take as lump sum, what must buy an annuity, and the tax, under PFRDA's December 2025 exit rules.");
  const [sector, setSector] = useState<Sector>("private");
  const [age, setAge] = useMe("age", 35);
  const [yearsIn, setYearsIn] = useMe("npsYears", 5);
  const [corpus, setCorpus] = useMe("npsCorpus", 600000);
  const [monthly, setMonthly] = useState(10000);
  const [stepUp, setStepUp] = useState(5);
  const [ret, setRet] = useState(9);
  const [exitAge, setExitAge] = useState(60);
  const [annRate, setAnnRate] = useState(6.5);

  const p = projectCorpus({ age, yearsInNps: yearsIn, corpus, monthlyContribution: monthly, annualStepUpPct: stepUp, expectedReturnPct: ret, exitAge, sector });
  const pension = monthlyAnnuity(p.annuityMin, annRate);
  const todays = p.corpusAtExit / Math.pow(1.06, Math.max(0, exitAge - age));
  const parts = [
    { k: "taxFree", v: p.taxFreeLump, label: "Lump sum, tax-free" },
    { k: "taxable", v: p.taxableLump, label: "Lump sum, taxed at slab" },
    { k: "systematic", v: p.systematic, label: "Gradual withdrawal" },
    { k: "annuity", v: p.annuityMin, label: "Annuity (pension)" },
  ].filter((x) => x.v > 0.5);
  const total = parts.reduce((s, x) => s + x.v, 0) || 1;

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "NPS tools" }} title="What will I get from NPS when I leave?"
        intro="Project your corpus, then see the split PFRDA's December 2025 rules allow: how much comes as cash, how much must buy a pension, and how much of the cash is taxed." />
      <ToolGrid
        summary={{ label: `Projected corpus at ${exitAge}`, value: inrShort(p.corpusAtExit) }}
        form={
          <Card className="space-y-5">
            <Field label="You are"><Segmented label="Sector" value={sector} onChange={setSector} options={[{ value: "private", label: "Private sector or self-employed" }, { value: "government", label: "Government employee" }]} /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your age" htmlFor="age"><NumberInput id="age" value={age} onChange={setAge} min={18} max={84} suffix="years" /></Field>
              <Field label="Years already in NPS" htmlFor="yin"><NumberInput id="yin" value={yearsIn} onChange={setYearsIn} min={0} suffix="years" /></Field>
              <Field label="Current NPS balance" htmlFor="cor"><NumberInput id="cor" prefix="₹" value={corpus} onChange={setCorpus} min={0} step={10000} /></Field>
              <Field label="Monthly contribution" htmlFor="mon" hint="Yours + employer's"><NumberInput id="mon" prefix="₹" value={monthly} onChange={setMonthly} min={0} step={500} /></Field>
              <Field label="Yearly increase in contribution" htmlFor="stp"><NumberInput id="stp" value={stepUp} onChange={setStepUp} min={0} max={20} suffix="%" /></Field>
              <Field label="Expected return" htmlFor="ret" hint="Equity-heavy: 9–10%, balanced: 8%"><NumberInput id="ret" value={ret} onChange={setRet} min={0} max={14} step={0.5} suffix="% a year" /></Field>
              <Field label="Age at exit" htmlFor="ex" hint="60 is standard; you can stay in until 85"><NumberInput id="ex" value={exitAge} onChange={setExitAge} min={age} max={85} suffix="years" /></Field>
              <Field label="Annuity rate" htmlFor="ann" hint="Life annuity quotes are typically 6–7%"><NumberInput id="ann" value={annRate} onChange={setAnnRate} min={0} max={10} step={0.25} suffix="% a year" /></Field>
            </div>
            <p className="text-[13px] text-muted">Projections assume a steady return. Real returns vary with markets and your scheme choice.</p>
            <SavedNote />
          </Card>
        }
        result={
          <Card className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <Stat label={`Projected corpus at ${exitAge}`} value={inrShort(p.corpusAtExit)} sub={`≈ ${inrShort(todays)} in today's money (6% inflation)`} />
              <span className={p.isNormalExit ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-[13px] font-semibold text-emerald-700" : "rounded-full bg-amber-50 px-2.5 py-0.5 text-[13px] font-semibold text-amber-800"}>{p.isNormalExit ? "Normal exit" : "Premature exit"}</span>
            </div>
            <div>
              <div className="flex h-9 overflow-hidden rounded-lg" role="img" aria-label="How your corpus is split at exit">
                {parts.map((x) => <div key={x.k} style={{ width: `${(x.v / total) * 100}%`, background: COLORS[x.k as keyof typeof COLORS] }} className="flex items-center justify-center text-xs font-bold text-white">{x.v / total > 0.12 ? `${Math.round((x.v / total) * 100)}%` : ""}</div>)}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                {parts.map((x) => <span key={x.k} className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: COLORS[x.k as keyof typeof COLORS] }} />{x.label}</span>)}
              </div>
            </div>
            <dl>
              <Row label="Lump sum, tax-free" value={inrShort(p.taxFreeLump)} />
              {p.taxableLump > 0 && <Row label="Lump sum, taxed at your slab" value={inrShort(p.taxableLump)} />}
              {p.systematic > 0 && <Row label="Withdrawn gradually (6+ years)" value={inrShort(p.systematic)} />}
              {p.annuityMin > 0 && <Row label="Must buy an annuity" value={inrShort(p.annuityMin)} />}
              {p.annuityMin > 0 && <Row label="Estimated pension from annuity" value={`${inr(pension)}/month`} strong />}
            </dl>
            {p.taxableLump > 0 && <Callout title="Watch the tax on the extra 20%">PFRDA lets you take 80%, but only 60% of the corpus is tax-free. Many people take 60% at exit and withdraw the rest gradually to spread the tax. <Cites ids={["R21"]} /></Callout>}
            {!p.isNormalExit && <Callout tone="danger" title="This is a premature exit">Above ₹5 lakh, 80% must buy an annuity. Staying until 60{sector === "private" ? ", or 15 years in NPS," : ""} lets you take up to {sector === "private" ? "80%" : "60%"} as cash. <Cites ids={["R18", "R17"]} /></Callout>}
            {p.notes.map((n) => <Callout key={n}>{n}</Callout>)}
            <p className="text-[13px] text-muted">Rules used: <Cites ids={[...p.rules, "R17", "R21"]} /></p>
          </Card>
        }
      />
      <RulesUsed ids={["R15", "R16", "R17", "R18", "R19", "R21", "R23"]} />
    </>
  );
}
