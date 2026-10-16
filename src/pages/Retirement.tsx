import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { retirementCheck } from "../lib/calc/retirement";
import type { Sector } from "../lib/calc/nps";
import { inr, inrShort } from "../lib/format";
import { useMe, useStoredState } from "../lib/storage";
import { Callout, Card, Field, NumberInput, Row, Segmented, cx } from "../components/ui";
import { PageHero, RulesUsed, SavedNote, ToolGrid } from "../components/ToolPage";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t border-line pt-5 first:border-0 first:pt-0">
      <legend className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-muted">{title}</legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/** Corpus over retirement: one bar per year, red once it has run out. */
function DrawdownChart({ path, lifeTo }: { path: { age: number; corpus: number }[]; lifeTo: number }) {
  if (!path.length) return null;
  const max = Math.max(...path.map((p) => p.corpus), 1);
  const W = 560, H = 150, bw = W / path.length;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full" role="img" aria-label="Savings left each year of retirement">
        {path.map((p, k) => {
          const h = (p.corpus / max) * H;
          return <rect key={p.age} x={k * bw + 1} y={H - h} width={Math.max(1, bw - 2)} height={Math.max(h, p.corpus > 0 ? 1 : 0)} rx={1.5} fill={p.corpus > 0 ? "#1A4FC4" : "#D92D20"} opacity={p.corpus > 0 ? 0.85 : 1} />;
        })}
        {path.map((p, k) => p.corpus <= 0 && (k === 0 || path[k - 1].corpus > 0) ? <rect key={"x" + p.age} x={k * bw} y={H - 3} width={(path.length - k) * bw} height={3} fill="#D92D20" /> : null)}
        <text x={0} y={H + 15} fontSize="11" fill="currentColor" className="text-muted">Age {path[0].age}</text>
        <text x={W} y={H + 15} fontSize="11" textAnchor="end" fill="currentColor" className="text-muted">{lifeTo}</text>
      </svg>
      <figcaption className="mt-1 text-[13px] text-muted">Savings left at each age, in that year's rupees</figcaption>
    </figure>
  );
}

export default function Retirement() {
  const [age, setAge] = useMe("age", 35);
  const [basic, setBasic] = useMe("salary", 50000);
  const [pfBalance, setPfBalance] = useMe("pfBalance", 500000);
  const [epsYears, setEpsYears] = useMe("epsYears", 8);
  const [npsCorpus, setNpsCorpus] = useMe("npsCorpus", 0);
  const [npsYears] = useMe("npsYears", 0);
  const [retireAge, setRetireAge] = useStoredState("retire.age", 58);
  const [lifeTo, setLifeTo] = useStoredState("retire.lifeTo", 85);
  const [expense, setExpense] = useStoredState("retire.expense", 50000);
  const [npsMonthly, setNpsMonthly] = useStoredState("retire.npsMonthly", 0);
  const [otherCorpus, setOtherCorpus] = useStoredState("retire.otherCorpus", 0);
  const [otherMonthly, setOtherMonthly] = useStoredState("retire.otherMonthly", 0);
  const [vpf, setVpf] = useStoredState("retire.vpf", 0);
  const [sector, setSector] = useState<Sector>("private");
  const [inflation, setInflation] = useState(6);
  const [postReturn, setPostReturn] = useState(7);
  const [growth, setGrowth] = useState(7);
  const [npsReturn, setNpsReturn] = useState(10);
  const [otherReturn, setOtherReturn] = useState(11);
  const [showAssumptions, setShowAssumptions] = useState(false);

  const retire = Math.max(age, Math.min(70, retireAge));
  const life = Math.max(retire + 1, Math.min(100, lifeTo));
  const r = retirementCheck({
    age, retireAge: retire, lifeTo: life, monthlyExpense: expense, inflationPct: inflation, postReturnPct: postReturn,
    basic, pfBalance, salaryGrowthPct: growth, epfRatePct: 8.25, vpfPct: vpf, epsYears,
    npsCorpus, npsMonthly, npsYears, npsReturnPct: npsReturn, sector, annuityRatePct: 6.5,
    otherCorpus, otherMonthly, otherReturnPct: otherReturn,
  });
  const today = (n: number) => n / Math.pow(1 + inflation / 100, r.years);
  const tone = r.lasts ? "text-emerald-700" : r.lastsTo - retire >= (life - retire) * 0.75 ? "text-amber-700" : "text-red-700";

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "Planning" }} title="Will my PF, pension and NPS be enough to retire?"
        intro="One answer from everything you already have: EPF, EPS pension, NPS and other savings, against what your life will cost after retirement. See how long the money lasts, and what closes the gap." />
      <ToolGrid
        summary={{ label: "Your money lasts until", value: r.lasts ? `${life}+ (on track)` : `Age ${r.lastsTo}` }}
        form={
          <Card className="space-y-6">
            <Group title="You">
              <Field label="Your age" htmlFor="age"><NumberInput id="age" value={age} onChange={setAge} min={18} max={69} suffix="years" /></Field>
              <Field label="Retire at" htmlFor="ret"><NumberInput id="ret" value={retireAge} onChange={setRetireAge} min={age} max={70} suffix="years" /></Field>
              <Field label="Household spending a month, today" htmlFor="exp" hint="What you'd spend in retirement at today's prices. Leave out EMIs that end before then.">
                <NumberInput id="exp" prefix="₹" value={expense} onChange={setExpense} min={0} step={5000} />
              </Field>
              <Field label="Plan for money to last until" htmlFor="life" hint="Planning to 85 or 90 is safer than average life expectancy.">
                <NumberInput id="life" value={lifeTo} onChange={setLifeTo} min={retire + 1} max={100} suffix="age" />
              </Field>
            </Group>
            <Group title="PF and EPS">
              <Field label="Basic + DA a month" htmlFor="basic"><NumberInput id="basic" prefix="₹" value={basic} onChange={setBasic} min={0} step={1000} /></Field>
              <Field label="PF balance today" htmlFor="pfb" hint="Employee + employer share in your passbook"><NumberInput id="pfb" prefix="₹" value={pfBalance} onChange={setPfBalance} min={0} step={10000} /></Field>
              <Field label="EPS service so far" htmlFor="eps"><NumberInput id="eps" value={epsYears} onChange={setEpsYears} min={0} step={0.5} suffix="years" /></Field>
              <Field label="VPF on top of 12%" htmlFor="vpf"><NumberInput id="vpf" value={vpf} onChange={setVpf} min={0} max={88} suffix="% of basic" /></Field>
            </Group>
            <Group title="NPS">
              <Field label="NPS balance today" htmlFor="npsc"><NumberInput id="npsc" prefix="₹" value={npsCorpus} onChange={setNpsCorpus} min={0} step={10000} /></Field>
              <Field label="Going in each month" htmlFor="npsm" hint="Yours + employer's"><NumberInput id="npsm" prefix="₹" value={npsMonthly} onChange={setNpsMonthly} min={0} step={500} /></Field>
              <div className="sm:col-span-2"><Field label="Sector">
                <Segmented label="Sector" size="sm" value={sector} onChange={setSector} options={[{ value: "private", label: "Private / All citizen" }, { value: "government", label: "Government" }]} />
              </Field></div>
            </Group>
            <Group title="Other retirement savings">
              <Field label="Mutual funds, PPF, FDs set aside" htmlFor="oc"><NumberInput id="oc" prefix="₹" value={otherCorpus} onChange={setOtherCorpus} min={0} step={50000} /></Field>
              <Field label="Added each month (SIPs etc.)" htmlFor="om" hint="Assumed to rise 5% a year"><NumberInput id="om" prefix="₹" value={otherMonthly} onChange={setOtherMonthly} min={0} step={1000} /></Field>
            </Group>
            <div>
              <button type="button" onClick={() => setShowAssumptions((s) => !s)} aria-expanded={showAssumptions} className="text-sm font-semibold text-brand-600 hover:underline">
                {showAssumptions ? "Hide assumptions" : "Change assumptions"} (inflation {inflation}%, returns)
              </button>
              {showAssumptions && (
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <Field label="Inflation" htmlFor="inf"><NumberInput id="inf" value={inflation} onChange={setInflation} min={0} max={15} step={0.5} suffix="% a year" /></Field>
                  <Field label="Salary growth" htmlFor="gr"><NumberInput id="gr" value={growth} onChange={setGrowth} min={0} max={20} step={0.5} suffix="% a year" /></Field>
                  <Field label="NPS return" htmlFor="nr"><NumberInput id="nr" value={npsReturn} onChange={setNpsReturn} min={0} max={15} step={0.5} suffix="% a year" /></Field>
                  <Field label="Other savings return" htmlFor="or"><NumberInput id="or" value={otherReturn} onChange={setOtherReturn} min={0} max={18} step={0.5} suffix="% a year" /></Field>
                  <Field label="Return after retirement" htmlFor="pr" hint="A mix of debt and some equity"><NumberInput id="pr" value={postReturn} onChange={setPostReturn} min={0} max={12} step={0.5} suffix="% a year" /></Field>
                </div>
              )}
            </div>
            <SavedNote />
          </Card>
        }
        result={
          <Card className="space-y-6">
            <div>
              <p className="text-sm text-muted">Your money lasts until</p>
              <p className={cx("num text-[2.6rem] font-bold leading-tight tracking-tight", tone)}>{r.lasts ? `${life} and beyond` : `Age ${r.lastsTo}`}</p>
              <p className="text-sm text-muted">{r.lasts ? "You're on track for the plan you set." : `That's ${life - r.lastsTo} years short of ${life}.`}</p>
            </div>

            <div>
              <div className="flex items-baseline justify-between text-sm"><span className="font-semibold text-ink">Retirement readiness</span><span className="num font-bold text-ink">{Math.round(r.readinessPct)}%</span></div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-canvas" role="progressbar" aria-valuenow={Math.round(r.readinessPct)} aria-valuemin={0} aria-valuemax={100} aria-label="Retirement readiness">
                <div className={cx("h-full rounded-full", r.readinessPct >= 100 ? "bg-emerald-600" : r.readinessPct >= 70 ? "bg-amber-500" : "bg-red-600")} style={{ width: `${Math.max(3, r.readinessPct)}%` }} />
              </div>
              <p className="mt-1.5 text-[13px] text-muted">You'll have {inrShort(r.corpusAtRetirement)} of the {inrShort(r.corpusNeeded)} you need at {retire}.</p>
            </div>

            <dl>
              <Row label={`Spending at ${retire}, a month`} value={`${inr(r.monthlyExpenseAtRetirement)}`} />
              <Row label="EPF at retirement" value={inrShort(r.epf)} />
              {r.npsCorpus > 0 && <Row label="NPS lump sum you can take" value={inrShort(r.npsLump)} />}
              {r.other > 0 && <Row label="Other savings" value={inrShort(r.other)} />}
              <Row label="Total savings at retirement" value={inrShort(r.corpusAtRetirement)} strong />
              <Row label={`EPS pension from ${r.epsAge}, a month`} value={r.epsMonthly ? inr(r.epsMonthly) : "None (under 10 years)"} />
              {r.npsAnnuityMonthly > 0 && <Row label="NPS annuity, a month" value={inr(r.npsAnnuityMonthly)} />}
            </dl>

            <DrawdownChart path={r.path} lifeTo={life} />

            {!r.lasts && Number.isFinite(r.extraMonthlyNeeded) && r.extraMonthlyNeeded > 0 && (
              <Callout tone="warn" title={`Save about ${inr(Math.ceil(r.extraMonthlyNeeded / 500) * 500)} more a month to close the gap`}>
                <p>Invested at {otherReturn}% and raised 5% a year until {retire}. Other levers: retire a few years later, spend less, or add VPF (guaranteed {8.25}%, tax-free within limits).</p>
              </Callout>
            )}
            {!r.lasts && !Number.isFinite(r.extraMonthlyNeeded) && <Callout tone="danger">You're retiring now, so there's no time to save more. Look at spending, part-time work, or a later start for the money you draw.</Callout>}
            {r.lasts && <Callout tone="success" title="On track">Keep contributions going and recheck every year, or when your salary or expenses change.</Callout>}

            <Callout title="Why pensions alone fall short">
              <p>EPS and NPS annuity pay a fixed amount that doesn't rise with prices. At {inflation}% inflation, {r.epsMonthly ? inr(r.epsMonthly) : "a fixed pension"} buys about half as much after 12 years. Your savings have to cover that growing gap.</p>
            </Callout>
            <p className="text-[13px] text-muted">In today's money, you'll have about {inrShort(today(r.corpusAtRetirement))} at retirement. Estimates use the assumptions shown; returns aren't guaranteed. Details: <Link to="/pf/calculator">EPF</Link>, <Link to="/pf/pension">EPS</Link>, <Link to="/nps/retirement">NPS</Link>.</p>
          </Card>
        }
      />
      <RulesUsed ids={["R11", "R10", "R14", "R15", "R16", "R21"]} />
    </>
  );
}
