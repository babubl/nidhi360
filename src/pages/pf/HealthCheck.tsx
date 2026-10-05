import { useRef, useState } from "react";
import { Check, Printer, RotateCcw, Share2 } from "lucide-react";
import { HEALTH_QUESTIONS } from "../../data/healthcheck";
import { fixList, healthBand, healthScore, type Answer } from "../../lib/calc/health";
import { useStoredState } from "../../lib/storage";
import { Button, Callout, Card, Segmented, cx } from "../../components/ui";
import { ExpertHelp, PageHero, RulesUsed, ToolGrid, useTitle } from "../../components/ToolPage";
import { ShareWhatsApp } from "../../components/Feedback";

const OPTS: { value: Answer; label: string }[] = [
  { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unsure", label: "Not sure" },
];
const BAND = {
  good: { label: "Claim-ready", cls: "bg-emerald-50 text-emerald-700", ring: "#12795F", msg: "Your account should settle claims smoothly. Re-check once a year and after every job change." },
  fair: { label: "Needs a few fixes", cls: "bg-amber-50 text-amber-800", ring: "#B54708", msg: "Fix the items below before you file a claim. Most take 10 minutes online." },
  poor: { label: "High risk of rejection", cls: "bg-red-50 text-red-700", ring: "#B42318", msg: "A claim filed today is likely to be rejected. Work through the list below in order." },
};

function ScoreRing({ score, color }: { score: number; color: string }) {
  const c = 2 * Math.PI * 34;
  return (
    <svg viewBox="0 0 80 80" className="size-24 shrink-0" role="img" aria-label={`Score ${score} out of 100`}>
      <circle cx="40" cy="40" r="34" fill="none" stroke="#EEF0F3" strokeWidth="8" />
      <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 40 40)" />
      <text x="40" y="46" textAnchor="middle" className="num" fontSize="20" fontWeight="700" fill="#101828">{score}</text>
    </svg>
  );
}

export default function HealthCheck() {
  useTitle("PF account check", "Check your EPFO account in 2 minutes: UAN, KYC, bank, name match, exit dates, nominee. Get a prioritised fix list.");
  const [answers, setAnswers] = useStoredState<Record<string, Answer>>("health", {});
  const resultRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const answered = HEALTH_QUESTIONS.filter((q) => answers[q.id]).length;
  const done = answered === HEALTH_QUESTIONS.length;
  const score = healthScore(answers);
  const band = BAND[healthBand(score)];
  const todo = fixList(answers);

  const set = (id: string, v: Answer) => {
    const next = { ...answers, [id]: v };
    setAnswers(next);
    if (Object.keys(next).length === HEALTH_QUESTIONS.length && !done && window.innerWidth < 1024) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  };

  const share = async () => {
    const text = `My PF account scored ${score}/100 on the Nidhi360 check. Check yours in 2 minutes before a claim gets rejected:`;
    const url = location.origin + import.meta.env.BASE_URL + "pf/health-check";
    try {
      if (navigator.share) await navigator.share({ text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* cancelled */ }
  };

  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="Check your PF account before you need it"
        intro="Most rejected claims come from small problems that sat in the account for years. Answer 11 questions and get a fix list, most important first." />
      <ToolGrid
        form={
          <Card className="p-0 sm:p-0">
            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
              <p className="text-sm font-semibold text-ink">{answered} of {HEALTH_QUESTIONS.length} answered</p>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${(answered / HEALTH_QUESTIONS.length) * 100}%` }} /></div>
            </div>
            <ol>
              {HEALTH_QUESTIONS.map((q, i) => (
                <li key={q.id} className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink"><span className="mr-1.5 text-muted">{i + 1}.</span>{q.question}</p>
                    <p className="mt-0.5 text-[13px] text-muted">{q.why}</p>
                  </div>
                  <Segmented size="sm" label={q.question} value={answers[q.id]} onChange={(v) => set(q.id, v)} options={OPTS} />
                </li>
              ))}
            </ol>
          </Card>
        }
        result={
          <div ref={resultRef} className="scroll-mt-24">
            {!done ? (
              <Card>
                <p className="font-semibold text-ink">Your report</p>
                <p className="mt-1 text-sm text-muted">Answer all {HEALTH_QUESTIONS.length} questions to see your score and fix list. Your answers stay on this device.</p>
              </Card>
            ) : (
              <Card className="space-y-5">
                <div className="flex items-center gap-5">
                  <ScoreRing score={score} color={band.ring} />
                  <div>
                    <span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold", band.cls)}>{band.label}</span>
                    <p className="mt-2 text-[15px] text-body">{band.msg}</p>
                  </div>
                </div>
                {todo.length ? (
                  <div>
                    <p className="text-sm font-semibold text-ink">Fix these, in this order</p>
                    <ol className="mt-3 space-y-3">
                      {todo.map((q, idx) => (
                        <li key={q.id} className="rounded-lg border border-line p-4">
                          <p className="flex items-start gap-2 font-semibold text-ink">
                            <span className={cx("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white", answers[q.id] === "no" ? "bg-red-600" : "bg-amber-500")}>{idx + 1}</span>
                            {q.question}
                          </p>
                          <ul className="mt-2 space-y-1.5 pl-7 text-[14.5px] text-body">
                            {q.fix.map((f) => <li key={f} className="list-disc">{f}</li>)}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <Callout tone="success" title="Nothing to fix"><p>Your account is in good shape.</p></Callout>
                )}
                <div className="no-print flex flex-wrap gap-2 border-t border-line pt-4">
                  <ShareWhatsApp id="tool:health" path="/pf/health-check" text={`My PF account scored ${score}/100 on the Nidhi360 check. 1 in 5 PF claims gets rejected; check yours in 2 minutes:`} />
                  <Button variant="secondary" onClick={share}><Share2 className="size-4" />{copied ? "Link copied" : "Share"}</Button>
                  <Button variant="secondary" onClick={() => window.print()}><Printer className="size-4" />Print</Button>
                  <Button variant="ghost" onClick={() => setAnswers({})}><RotateCcw className="size-4" />Start again</Button>
                </div>
                {score === 100 && <p className="flex items-center gap-2 text-sm text-emerald-700"><Check className="size-4" />Every check passed.</p>}
              </Card>
            )}
            <ExpertHelp context="my PF account check" />
          </div>
        }
      />
      <RulesUsed ids={["R7", "R8", "R9", "R13"]} />
    </>
  );
}
