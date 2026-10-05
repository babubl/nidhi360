import { useState } from "react";
import { Printer, RotateCcw } from "lucide-react";
import { TRANSFER_QUESTIONS, transferPlan, type TransferAnswers } from "../../lib/calc/transfer";
import { Button, Callout, Card, Cites, Segmented } from "../../components/ui";
import { ExpertHelp, PageHero, RulesUsed, ToolGrid, useTitle } from "../../components/ToolPage";

export default function JobChange() {
  useTitle("Changed jobs? Move your PF", "Step-by-step PF transfer after a job change: merge two UANs, mark exit date, transfer without employer approval.");
  const [a, setA] = useState<TransferAnswers>({});
  const done = TRANSFER_QUESTIONS.every((q) => a[q.id]);
  const plan = done ? transferPlan(a) : [];
  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="Changed jobs? Move your PF the right way"
        intro="Transferring keeps your service continuous, so withdrawals stay tax-free after 5 years and your pension years add up. Answer five questions to get your exact steps." />
      <ToolGrid
        form={
          <div className="space-y-4">
            <Card className="p-0 sm:p-0">
              <ol>
                {TRANSFER_QUESTIONS.map((q, i) => (
                  <li key={q.id} className="space-y-3 border-b border-line px-5 py-4 last:border-0 sm:px-6">
                    <p className="font-semibold text-ink"><span className="mr-1.5 text-muted">{i + 1}.</span>{q.q}</p>
                    <Segmented size="sm" label={q.q} value={a[q.id] as string | undefined} options={q.opts} onChange={(v) => setA({ ...a, [q.id]: v })} />
                  </li>
                ))}
              </ol>
            </Card>
            <Callout title="Transfer, don't withdraw">
              <p>Withdrawing on a job change triggers TDS if your continuous service is under 5 years, resets your pension service, and gives up 8.25% tax-free interest. From July 2026 a full withdrawal also needs 12 months without a job. <Cites ids={["R13", "R4", "R14"]} /></p>
            </Callout>
          </div>
        }
        result={
          <Card>
            <p className="text-lg font-bold text-ink">Your steps</p>
            {!done ? <p className="mt-1 text-sm text-muted">Answer all five questions and your personalised steps appear here.</p> : (
              <>
                <ol className="mt-4">
                  {plan.map((s, i) => (
                    <li key={s.title} className="relative flex gap-4 pb-5 last:pb-0">
                      {i < plan.length - 1 && <span className="absolute left-[13px] top-8 h-[calc(100%-2rem)] w-px bg-line" aria-hidden />}
                      <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">{s.title} <Cites ids={s.rules} /></p>
                        <p className="mt-0.5 text-[15px] text-body">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="no-print mt-5 flex gap-2 border-t border-line pt-4">
                  <Button variant="secondary" onClick={() => window.print()}><Printer className="size-4" />Print steps</Button>
                  <Button variant="ghost" onClick={() => setA({})}><RotateCcw className="size-4" />Start again</Button>
                </div>
              </>
            )}
            <ExpertHelp context="transferring my PF after a job change" />
          </Card>
        }
      />
      <RulesUsed ids={["R8", "R9", "R6", "R13", "R4", "R14"]} />
    </>
  );
}
