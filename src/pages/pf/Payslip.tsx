import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { checkPayslip, type Level } from "../../lib/calc/payslip";
import { inr } from "../../lib/format";
import { useMe } from "../../lib/storage";
import { Card, Field, NumberInput, Row, Segmented, cx } from "../../components/ui";
import { ExpertHelp, PageHero, RulesUsed, SavedNote, ToolGrid } from "../../components/ToolPage";

const LEVEL: Record<Level, { icon: typeof Info; cls: string }> = {
  ok: { icon: CheckCircle2, cls: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  warn: { icon: AlertTriangle, cls: "border-amber-200 bg-amber-50 text-amber-900" },
  bad: { icon: XCircle, cls: "border-red-200 bg-red-50 text-red-900" },
  info: { icon: Info, cls: "border-line bg-canvas text-body" },
};
const yesNo = [{ value: "yes" as const, label: "Yes" }, { value: "no" as const, label: "No" }];

export default function Payslip() {
  const [basic, setBasic] = useMe("salary", 25000);
  const [total, setTotal] = useState(50000);
  const [pf, setPf] = useState(3000);
  const [empDed, setEmpDed] = useState<"yes" | "no">("no");
  const [eps, setEps] = useState<"yes" | "no">("yes");

  const r = checkPayslip({ basicDa: basic, totalPay: total, employeePf: pf, employerDeducted: empDed === "yes", epsMember: eps === "yes" });
  const bad = r.checks.filter((c) => c.level === "bad" || c.level === "warn").length;

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="Is the PF on my payslip right?"
        intro="Type four numbers from your payslip. We check the 12%, the new 50% wage rule, your employer's share and pension, and charges that should never come out of your pay. Useful before you accept an offer, too." />
      <ToolGrid
        summary={{ label: "Payslip check", value: bad ? `${bad} to ask HR about` : "Looks right" }}
        form={
          <Card className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Basic + DA a month" htmlFor="basic" hint="Add retaining allowance if you get one">
                <NumberInput id="basic" prefix="₹" value={basic} onChange={setBasic} min={0} step={1000} />
              </Field>
              <Field label="Total pay a month (gross)" htmlFor="total" hint="All earnings before deductions">
                <NumberInput id="total" prefix="₹" value={total} onChange={setTotal} min={0} step={1000} />
              </Field>
              <Field label="PF deducted from you" htmlFor="pf" hint="The 'PF' or 'EPF' line under deductions">
                <NumberInput id="pf" prefix="₹" value={pf} onChange={setPf} min={0} step={100} />
              </Field>
            </div>
            <Field label="Does the payslip also deduct 'Employer PF' from your pay?">
              <Segmented label="Employer PF deducted" size="sm" value={empDed} onChange={setEmpDed} options={yesNo} />
            </Field>
            <Field label="Does your passbook show a pension (EPS) share?" hint="Not sure? Leave Yes.">
              <Segmented label="EPS member" size="sm" value={eps} onChange={setEps} options={yesNo} />
            </Field>
            <SavedNote />
          </Card>
        }
        result={
          <Card className="space-y-6">
            <div>
              <p className="text-sm text-muted">Going into your PF account each month</p>
              <p className="num text-[2.1rem] font-bold leading-tight tracking-tight text-ink">{inr(r.monthlyToPf)}</p>
              <p className="text-sm text-muted">plus {inr(r.employer.eps)} to your pension</p>
            </div>
            <dl>
              <Row label="PF wages" value={inr(r.pfWages)} />
              {r.addedBack > 1 && <Row label="…of which allowances added back (50% rule)" value={inr(r.addedBack)} />}
              <Row label="Your share" value={`${inr(Math.max(0, pf - r.vpf))}${r.vpf ? ` + ${inr(r.vpf)} VPF` : ""}`} />
              <Row label="Employer to your PF" value={inr(r.employer.epf)} />
              <Row label="Employer to your pension (EPS)" value={inr(r.employer.eps)} />
            </dl>
            <div className="space-y-3">
              {r.checks.map((c) => {
                const L = LEVEL[c.level];
                return (
                  <div key={c.id} className={cx("flex gap-3 rounded-xl border p-4", L.cls)}>
                    <L.icon className="mt-0.5 size-5 shrink-0 opacity-80" aria-hidden />
                    <div className="min-w-0"><p className="font-semibold">{c.title}</p><p className="mt-1 text-[14.5px] leading-relaxed">{c.detail}</p></div>
                  </div>
                );
              })}
            </div>
            <ExpertHelp context="the PF on my payslip" />
          </Card>
        }
      />
      <RulesUsed ids={["R35", "R10", "R25", "R14"]} />
    </>
  );
}
