import { useState } from "react";
import { ExternalLink, ImagePlus, Search, Sparkles } from "lucide-react";
import { ESCALATION, REJECTIONS } from "../../data/rejections";
import { containsSensitive, matchRejection, type RejectionMatch } from "../../lib/calc/rejection";
import { explainRejection } from "../../lib/ask";
import { aiEnabled } from "../../config";
import { Button, Callout, Card, Cites, Field } from "../../components/ui";
import { ExpertHelp, PageHero, RulesUsed, ToolGrid, useTitle } from "../../components/ToolPage";
import Markdown from "../../components/Markdown";

const EXAMPLES = ["Bank account details not verified / cheque image not legible", "Date of exit not available", "Member name mismatch with Aadhaar", "Claim amount exceeds eligible amount"];

function ReasonCard({ m }: { m: RejectionMatch }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold">{m.reason.title}</h3>
        <Cites ids={m.reason.rules} />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">What it means</p>
        <p className="mt-1 text-body">{m.reason.meaning}</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">How to fix it</p>
        <ol className="mt-2 space-y-2">
          {m.reason.fix.map((f, i) => (
            <li key={f} className="flex gap-3 text-[15px] text-body">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>{f}
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}

export default function ClaimRejected() {
  useTitle("PF claim rejected? Fix it", "Paste your EPFO rejection reason and get a plain-English explanation and exact steps to fix it.");
  const [text, setText] = useState("");
  const [matches, setMatches] = useState<RejectionMatch[] | null>(null);
  const [image, setImage] = useState<{ mimeType: string; data: string; name: string } | null>(null);
  const [ai, setAi] = useState<{ busy: boolean; text: string; error: string }>({ busy: false, text: "", error: "" });

  const decode = (t = text) => { setText(t); setMatches(matchRejection(t)); };
  const onImage = (f?: File) => {
    if (!f) return;
    if (f.size > 4_000_000) { setAi((a) => ({ ...a, error: "Please use an image under 4 MB." })); return; }
    const r = new FileReader();
    r.onload = () => setImage({ mimeType: f.type, data: String(r.result).split(",")[1], name: f.name });
    r.readAsDataURL(f);
  };
  const runAi = async () => {
    if (containsSensitive(text)) { setAi({ busy: false, text: "", error: "Your message seems to include an Aadhaar, PAN or OTP. Remove it and try again." }); return; }
    setAi({ busy: true, text: "", error: "" });
    try { setAi({ busy: false, text: await explainRejection(text, image ?? undefined), error: "" }); }
    catch (e) { setAi({ busy: false, text: "", error: (e as Error).message === "rate" ? "Too many requests. Please wait a minute." : "The AI explanation isn't available right now. The matched reasons below still apply." }); }
  };

  const allRules = REJECTIONS.flatMap((r) => r.rules).concat("R6");
  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "PF tools" }} title="Your PF claim was rejected. Here's how to fix it."
        intro="Copy the rejection reason from Track Claim Status on the EPFO portal, the UMANG app or the SMS, and paste it below." />
      <ToolGrid
        form={
          <Card className="space-y-5">
            <Field label="Rejection reason" htmlFor="rej">
              <textarea id="rej" rows={5} value={text} onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Claim rejected: bank account details not verified, cheque image not legible"
                className="w-full rounded-lg border border-line px-3 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
            </Field>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted">Try:</span>
              {EXAMPLES.map((e) => <button key={e} type="button" onClick={() => decode(e)} className="rounded-full border border-line px-3 py-1 text-[13px] text-body hover:border-brand-200 hover:bg-brand-50">{e}</button>)}
            </div>
            {aiEnabled && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line px-4 py-3 text-sm text-body hover:border-brand-200">
                <ImagePlus className="size-5 text-muted" aria-hidden />
                <span>{image ? image.name : "Or attach a screenshot of the rejection (optional)"}</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => onImage(e.target.files?.[0])} />
              </label>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => decode()} disabled={!text.trim()}><Search className="size-4" />Explain this rejection</Button>
              {aiEnabled && <Button variant="secondary" onClick={runAi} disabled={ai.busy || (!text.trim() && !image)}><Sparkles className="size-4" />{ai.busy ? "Reading…" : "Explain with AI"}</Button>}
            </div>
          </Card>
        }
        result={
          <div className="space-y-4">
            {ai.error && <Callout tone="warn">{ai.error}</Callout>}
            {ai.text && <Card><p className="mb-1 flex items-center gap-2 text-sm font-semibold text-brand-700"><Sparkles className="size-4" />AI explanation</p><div className="text-[15px] text-body"><Markdown text={ai.text} /></div></Card>}
            {matches === null ? (
              <Card>
                <p className="font-semibold text-ink">What you'll get</p>
                <p className="mt-1 text-sm text-muted">What the rejection actually means, the exact steps to fix it on the portal, and where to complain if it's still stuck.</p>
              </Card>
            ) : matches.length ? matches.map((m) => <ReasonCard key={m.reason.id} m={m} />) : (
              <Callout tone="warn" title="We couldn't match that reason">
                <p>Paste the exact text from Track Claim Status{aiEnabled ? ", or use Explain with AI" : ""}. The steps below still apply if the claim is stuck.</p>
              </Callout>
            )}
            <Card>
              <p className="font-semibold text-ink">Still stuck after fixing it? Escalate in this order</p>
              <ol className="mt-3 space-y-3">
                {ESCALATION.map((e, i) => (
                  <li key={e.title} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-bold text-ink">{i + 1}</span>
                    <div className="text-[15px]">
                      <a href={e.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-ink">{e.title}<ExternalLink className="size-3.5 text-muted" /></a>
                      <p className="text-body">{e.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-sm text-muted">EPFO must settle a complete claim within 20 days <Cites ids={["R6"]} /></p>
            </Card>
            <ExpertHelp context="a rejected PF claim" />
          </div>
        }
      />
      <RulesUsed ids={allRules} />
    </>
  );
}
