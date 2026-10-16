import { useState } from "react";
import { Check, Copy, Printer } from "lucide-react";
import { familyClaim, type DeathStatus } from "../../lib/calc/familyClaim";
import { inr } from "../../lib/format";
import { Button, Callout, Card, Field, NumberInput, Row, Segmented, Stat, cx } from "../../components/ui";
import { ExpertHelp, PageHero, RulesUsed, ToolGrid } from "../../components/ToolPage";

const yesNo = [{ value: "yes" as const, label: "Yes" }, { value: "no" as const, label: "No" }];

export default function FamilyClaim() {
  const [status, setStatus] = useState<DeathStatus>("in-service");
  const [wage, setWage] = useState(25000);
  const [avgBal, setAvgBal] = useState(300000);
  const [cont, setCont] = useState<"yes" | "no">("yes");
  const [months, setMonths] = useState(2);
  const [onRolls, setOnRolls] = useState<"yes" | "no">("no");
  const [epsYears, setEpsYears] = useState(8);
  const [cert, setCert] = useState<"yes" | "no">("no");
  const [spouse, setSpouse] = useState<"yes" | "no">("yes");
  const [kids, setKids] = useState(1);
  const [nominee, setNominee] = useState<"yes" | "no">("yes");
  const [copied, setCopied] = useState(false);

  const r = familyClaim({
    status, avgWage: wage, avgPfBalance: avgBal, continuous12: cont === "yes", monthsSinceLastContribution: months,
    onRolls: onRolls === "yes", epsYears, hadSchemeCertificate: cert === "yes", spouseAlive: spouse === "yes", childrenUnder25: kids, nomineeRegistered: nominee === "yes",
  });

  const checklist = [
    "FAMILY CLAIM CHECKLIST (EPFO)",
    "",
    "Claims to file:",
    ...r.claims.filter((c) => c.applies).map((c) => `[ ] ${c.form}: ${c.what}. ${c.amount}`),
    "",
    "Documents:",
    ...r.documents.map((d) => `[ ] ${d}`),
    "",
    "Steps:",
    ...r.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "Prepared with Nidhi360. General information, not legal advice. Filing with EPFO is free.",
  ].join("\n");

  const copy = async () => {
    try { await navigator.clipboard.writeText(checklist); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* clipboard blocked */ }
  };

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="A family member with PF has died. What can we claim?"
        intro="We're sorry for your loss. Answer a few questions and get the claims your family is owed, an estimate of the EDLI insurance, the family pension, the documents to collect and the order to file in. Nothing you enter leaves this page." />
      <ToolGrid
        summary={r.edliEligible ? { label: "EDLI insurance, about", value: inr(r.edliAmount) } : { label: "Claims to file", value: `${r.claims.filter((c) => c.applies).length}` }}
        form={
          <Card className="space-y-6">
            <Field label="When they died, they were…">
              <Segmented label="Member status" value={status} onChange={setStatus} options={[
                { value: "in-service", label: "Working in a PF job" },
                { value: "left", label: "Had left the job" },
                { value: "pensioner", label: "Drawing EPS pension" },
              ]} />
            </Field>

            {status !== "pensioner" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Average basic + DA, last 12 months" htmlFor="wage" hint="From payslips. Counted up to ₹25,000.">
                  <NumberInput id="wage" prefix="₹" value={wage} onChange={setWage} min={0} step={1000} />
                </Field>
                <Field label="Average PF balance, last 12 months" htmlFor="bal" hint="From the passbook. A rough figure is fine.">
                  <NumberInput id="bal" prefix="₹" value={avgBal} onChange={setAvgBal} min={0} step={10000} />
                </Field>
              </div>
            )}

            {status !== "pensioner" && (
              <Field label="Had they worked 12 months in a row before this?" hint="Across employers counts, if the gap between jobs was 60 days or less.">
                <Segmented label="Continuous service" value={cont} onChange={setCont} options={yesNo} size="sm" />
              </Field>
            )}

            {status === "left" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Months since the last PF deposit" htmlFor="months">
                  <NumberInput id="months" value={months} onChange={setMonths} min={0} suffix="months" />
                </Field>
                <Field label="Still on the employer's rolls?" hint="On leave, notice period or suspension.">
                  <Segmented label="On rolls" value={onRolls} onChange={setOnRolls} options={yesNo} size="sm" />
                </Field>
                <Field label="Years of EPS (pension) service" htmlFor="eps" hint="Total across all PF jobs">
                  <NumberInput id="eps" value={epsYears} onChange={setEpsYears} min={0} step={0.5} suffix="years" />
                </Field>
                <Field label="Did they take a Scheme Certificate?" hint="Instead of withdrawing EPS when they left">
                  <Segmented label="Scheme certificate" value={cert} onChange={setCert} options={yesNo} size="sm" />
                </Field>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Is their spouse alive?">
                <Segmented label="Spouse alive" value={spouse} onChange={setSpouse} options={yesNo} size="sm" />
              </Field>
              <Field label="Children under 25" htmlFor="kids">
                <NumberInput id="kids" value={kids} onChange={(n) => setKids(Math.max(0, Math.round(n)))} min={0} max={10} />
              </Field>
              <Field label="Was a nominee registered on the EPFO portal?" hint="Check the member's e-Nomination status, or ask the employer.">
                <Segmented label="Nominee registered" value={nominee} onChange={setNominee} options={yesNo} size="sm" />
              </Field>
            </div>
            <p className="text-[13px] text-muted">Nothing on this page is saved or sent anywhere.</p>
          </Card>
        }
        result={
          <Card className="space-y-6">
            {r.edliEligible
              ? <Stat label="EDLI life insurance, estimated" value={inr(r.edliAmount)} sub={r.edliAmount >= 700000 ? "The maximum EDLI pays" : r.edliAmount === r.edliFloor ? `The minimum applies (formula gives ${inr(r.edliFormula)})` : "35 × wage + half the average balance"} />
              : <Stat label="Claims your family can file" value={`${r.claims.filter((c) => c.applies).length}`} sub="EDLI insurance doesn't apply in this case" />}

            <div>
              <p className="text-sm font-semibold text-ink">What to claim</p>
              <ul className="mt-3 space-y-3">
                {r.claims.map((c) => (
                  <li key={c.form} className={cx("rounded-xl border p-4", c.applies ? "border-line" : "border-dashed border-line opacity-70")}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-semibold text-ink">{c.what}</span>
                      <span className={cx("shrink-0 rounded-md px-2 py-0.5 text-xs font-bold", c.applies ? "bg-brand-50 text-brand-700" : "bg-canvas text-muted")}>{c.form}</span>
                    </div>
                    <p className="num mt-1 text-[15px] text-body">{c.amount}</p>
                    {c.note && <p className="mt-1 text-[13px] text-muted">{c.note}</p>}
                  </li>
                ))}
              </ul>
            </div>

            {r.familyPension && (r.spousePensionMin > 0 || r.childPensionMin > 0) && (
              <dl>
                {r.spousePensionMin > 0 && <Row label="Spouse, for life (minimum)" value={`${inr(r.spousePensionMin)} / month`} />}
                {r.childPensionMin > 0 && <Row label={`Each of ${r.childrenPaid} ${r.childrenPaid === 1 ? "child" : "children"}, until 25 (minimum)`} value={`${inr(r.childPensionMin)} / month`} />}
              </dl>
            )}

            <div>
              <p className="text-sm font-semibold text-ink">Documents to collect</p>
              <ul className="mt-2 space-y-1.5 text-[15px] text-body">
                {r.documents.map((d) => <li key={d} className="flex gap-2"><Check className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden />{d}</li>)}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink">In this order</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[15px] text-body">
                {r.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
            </div>

            {r.warnings.map((w) => <Callout key={w} tone="warn">{w}</Callout>)}

            <div className="no-print flex flex-wrap gap-2">
              <Button variant="secondary" onClick={copy}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Copied" : "Copy checklist"}</Button>
              <Button variant="secondary" onClick={() => window.print()}><Printer className="size-4" />Print</Button>
            </div>
            <ExpertHelp context="a family death claim" />
          </Card>
        }
      />
      <RulesUsed ids={r.rules} />
    </>
  );
}
