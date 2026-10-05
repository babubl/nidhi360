import { useEffect, useRef, useState } from "react";
import { ArrowUp, ShieldAlert } from "lucide-react";
import { askQuestion, type ChatMessage } from "../lib/ask";
import { containsSensitive } from "../lib/calc/rejection";
import { aiEnabled } from "../config";
import { ButtonLink, Container, cx } from "../components/ui";
import { PageHero, useTitle } from "../components/ToolPage";
import Markdown from "../components/Markdown";

const STARTERS = [
  "Can I withdraw my full PF after resigning?",
  "How much NPS can I take as a lump sum at 60?",
  "Is PF withdrawal taxable before 5 years of service?",
  "Should I withdraw my EPS or take a Scheme Certificate?",
];

export default function Ask() {
  useTitle("Ask about PF or NPS");
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs, busy]);

  const send = async (q: string) => {
    q = q.trim();
    if (!q || busy) return;
    setInput("");
    if (containsSensitive(q)) {
      setMsgs((m) => [...m, { role: "user", text: q.replace(/\d/g, "•") }, { role: "assistant", text: "That looks like an Aadhaar, PAN or OTP, so we didn't send it. Please remove it and ask again." }]);
      return;
    }
    const next = [...msgs, { role: "user" as const, text: q }];
    setMsgs(next);
    setBusy(true);
    try { const a = await askQuestion(next); setMsgs([...next, { role: "assistant", text: a }]); }
    catch (e) { setMsgs([...next, { role: "assistant", text: (e as Error).message === "rate" ? "You've asked a lot of questions in a short time. Please wait a minute and try again." : "The assistant isn't responding right now. Please try again shortly, or use the tools in the menu." }]); }
    setBusy(false);
  };

  if (!aiEnabled) {
    return (
      <>
        <PageHero title="Ask about PF or NPS" intro="The assistant is coming soon. In the meantime, the tools cover the most common questions." />
        <Container className="py-10"><ButtonLink to="/">Browse the tools</ButtonLink></Container>
      </>
    );
  }

  return (
    <>
      <PageHero title="Ask about PF or NPS" intro="Answers come only from our rules register and show which rule they rely on." />
      <Container className="max-w-3xl py-8">
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-canvas px-4 py-3 text-sm text-body">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />Don't type your UAN, Aadhaar, PAN, bank details or any OTP. We never need them.
        </div>
        <div className="min-h-[280px] space-y-4" aria-live="polite">
          {!msgs.length && (
            <div className="grid gap-2 sm:grid-cols-2">
              {STARTERS.map((s) => <button key={s} onClick={() => send(s)} className="rounded-xl border border-line p-4 text-left text-[15px] font-medium text-ink hover:border-brand-200 hover:bg-brand-50">{s}</button>)}
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={cx("flex", m.role === "user" && "justify-end")}>
              <div className={cx("max-w-[88%] rounded-2xl px-4 py-3 text-[15px]", m.role === "user" ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm border border-line bg-white text-body")}>
                {m.role === "user" ? m.text : <Markdown text={m.text} />}
              </div>
            </div>
          ))}
          {busy && <p className="text-sm text-muted">Checking the rules…</p>}
          <div ref={end} />
        </div>
        <form className="sticky bottom-4 mt-6 flex items-end gap-2 rounded-2xl border border-line bg-white p-2 shadow-lg" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <label htmlFor="q" className="sr-only">Your question</label>
          <textarea id="q" rows={1} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about PF, EPS or NPS"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] outline-none" />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-white disabled:opacity-40"><ArrowUp className="size-5" /></button>
        </form>
      </Container>
    </>
  );
}
