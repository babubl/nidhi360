import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { draftGrievance, ISSUE_LABELS, type IssueType } from "../../lib/calc/grievance";
import { containsSensitive } from "../../lib/calc/rejection";
import { Button, Callout, Card, Field, Select } from "../../components/ui";
import { ExpertHelp, PageHero, RulesUsed, ToolGrid } from "../../components/ToolPage";
import { track } from "../../lib/track";

const inputCls = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export default function Grievance() {
  const [issue, setIssue] = useState<IssueType>("delayed");
  const [claimId, setClaimId] = useState("");
  const [filedOn, setFiledOn] = useState("");
  const [employer, setEmployer] = useState("");
  const [months, setMonths] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState("");
  const [copied, setCopied] = useState(false);

  const g = draftGrievance({ issue, claimId, filedOn: filedOn || undefined, employer, missingMonths: months, rejectionReason: reason, pendingItem: pending });
  const needsClaim = ["delayed", "settledNotCredited", "rejectedWrongly", "transferStuck"].includes(issue);
  const needsEmployer = ["notDeposited", "employerBlocking"].includes(issue);
  const leaked = containsSensitive([claimId, employer, months, reason, pending].join(" "));
  const full = `Subject: ${g.subject}\n\n${g.body}`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(full); track("Grievance copied", { issue }); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="Write your EPFO complaint in a minute"
        intro="A clear, specific grievance gets resolved faster. Pick your problem, add a few details, then paste the text into EPFiGMS, EPFO's official grievance portal." />
      <ToolGrid
        form={
          <Card className="space-y-5">
            <Field label="What's the problem?" htmlFor="issue">
              <Select id="issue" value={issue} onChange={(v) => setIssue(v as IssueType)} options={Object.entries(ISSUE_LABELS).map(([value, label]) => ({ value, label }))} />
            </Field>
            {needsClaim && (
              <Field label="Claim ID" htmlFor="cid" hint="From Track Claim Status. Optional; leave blank to fill in later.">
                <input id="cid" className={inputCls} value={claimId} onChange={(e) => setClaimId(e.target.value)} placeholder="e.g. TNMAS123456789" />
              </Field>
            )}
            {needsEmployer && (
              <Field label="Employer (establishment) name" htmlFor="emp">
                <input id="emp" className={inputCls} value={employer} onChange={(e) => setEmployer(e.target.value)} placeholder="As shown in your passbook" />
              </Field>
            )}
            {issue !== "notDeposited" && (
              <Field label={issue === "settledNotCredited" ? "Date it was settled" : issue === "employerBlocking" ? "Pending since" : "Date you filed it"} htmlFor="date">
                <input id="date" type="date" className={inputCls} value={filedOn} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setFiledOn(e.target.value)} />
              </Field>
            )}
            {issue === "notDeposited" && (
              <Field label="Months missing" htmlFor="months"><input id="months" className={inputCls} value={months} onChange={(e) => setMonths(e.target.value)} placeholder="e.g. January to June 2026" /></Field>
            )}
            {issue === "rejectedWrongly" && (
              <Field label="Rejection reason shown" htmlFor="reason"><input id="reason" className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Copy it from Track Claim Status" /></Field>
            )}
            {issue === "employerBlocking" && (
              <Field label="What's pending with the employer?" htmlFor="pend"><input id="pend" className={inputCls} value={pending} onChange={(e) => setPending(e.target.value)} placeholder="e.g. Aadhaar KYC approval" /></Field>
            )}
            {leaked && <Callout tone="warn">That looks like an Aadhaar, PAN or OTP. Don't include it here; the EPFiGMS portal asks for your UAN separately.</Callout>}
          </Card>
        }
        result={
          <div className="space-y-4">
            {g.overDeadline !== undefined && (
              g.overDeadline
                ? <Callout tone="danger" title={`${g.daysPending} days: past the 20-day deadline`}>You're entitled to escalate now.</Callout>
                : <Callout tone="info" title={`${g.daysPending} days so far`}>EPFO has 20 days to settle a complete claim. You can file now, but a grievance after day 20 carries more weight.</Callout>
            )}
            <Card className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink">Your grievance</p>
                <Button variant="secondary" onClick={copy}>{copied ? <><Check className="size-4" />Copied</> : <><Copy className="size-4" />Copy text</>}</Button>
              </div>
              <div className="rounded-lg bg-canvas p-4 text-[15px] leading-relaxed text-body">
                <p><span className="font-semibold text-ink">Subject:</span> {g.subject}</p>
                <p className="mt-3 whitespace-pre-wrap">{g.body}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Attach</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-body">{g.attach.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </Card>
            <Card>
              <p className="font-semibold text-ink">How to file it</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] text-body">
                <li>Open <a href="https://epfigms.gov.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-700">epfigms.gov.in<ExternalLink className="size-3" /></a> and choose Register Grievance.</li>
                <li>Select PF Member, enter your UAN and verify with the OTP.</li>
                <li>Pick the relevant category, paste the text above, and attach the documents.</li>
                <li>Save the grievance registration number. If there's no resolution in 30 days, escalate on pgportal.gov.in (CPGRAMS) with that number.</li>
              </ol>
            </Card>
            <ExpertHelp context={ISSUE_LABELS[issue]} />
          </div>
        }
      />
      <RulesUsed ids={["R6", "R7", "R8", "R9"]} />
    </>
  );
}
