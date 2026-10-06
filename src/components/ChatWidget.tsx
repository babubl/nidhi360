import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUp, MessageCircle, ShieldAlert, X } from "lucide-react";
import { LogoMark } from "./Layout";
import Markdown from "./Markdown";
import { cx } from "./ui";
import { aiEnabled } from "../config";
import { askQuestion, type ChatMessage } from "../lib/ask";
import { localReply, SENSITIVE_REPLY, STARTERS, type BotReply, type ChatLink } from "../lib/assistant";
import { containsSensitive } from "../lib/calc/rejection";
import { track } from "../lib/track";

interface Msg { role: "user" | "bot"; text: string; steps?: string[]; links?: ChatLink[] }

const WELCOME: Msg = { role: "bot", text: "Hi, I'm the Nidhi360 assistant. Tell me your PF or NPS problem and I'll find the answer and the right tool." };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { pathname } = useLocation();

  useEffect(() => { if (open) { inputRef.current?.focus(); end.current?.scrollIntoView({ block: "nearest" }); } }, [open, msgs, busy]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);
  useEffect(() => setOpen(false), [pathname]);

  const send = async (raw: string) => {
    const q = raw.trim();
    if (!q || busy) return;
    setInput("");
    track("Chat question");
    if (containsSensitive(q)) { setMsgs((m) => [...m, { role: "user", text: q.replace(/\d/g, "•") }, { role: "bot", text: SENSITIVE_REPLY }]); return; }
    const history = [...msgs, { role: "user" as const, text: q }];
    setMsgs(history);
    const local: BotReply = localReply(q);
    // A direct match in our library is the most reliable answer, so it always goes first.
    if (!aiEnabled || local.matched) { setMsgs([...history, { role: "bot", text: local.text, steps: local.steps, links: local.links }]); return; }
    setBusy(true);
    try {
      const chat: ChatMessage[] = history.filter((m) => m !== WELCOME).map((m) => ({ role: m.role === "user" ? "user" : "assistant", text: m.text }));
      const text = await askQuestion(chat);
      setMsgs([...history, { role: "bot", text, links: local.links }]);
    } catch (e) {
      const rate = (e as Error).message === "rate";
      setMsgs([...history, { role: "bot", text: rate ? "You've asked a lot in a short time. Please wait a minute and try again." : local.text, steps: rate ? undefined : local.steps, links: rate ? undefined : local.links }]);
    }
    setBusy(false);
  };

  if (pathname === "/ask") return null;
  const onToolPage = pathname.startsWith("/pf/") || pathname.startsWith("/nps/");

  return (
    <div className="no-print">
      {!open && (
        <button type="button" onClick={() => { setOpen(true); track("Chat opened"); }} aria-label="Open chat assistant"
          className={cx("fixed right-4 z-40 flex items-center gap-2 rounded-full bg-brand-600 py-3 pl-4 pr-5 text-[15px] font-bold text-white shadow-[0_12px_28px_-8px_rgba(26,79,196,0.7)] transition hover:bg-brand-700 sm:right-6", onToolPage ? "bottom-24 lg:bottom-6" : "bottom-5 sm:bottom-6")}>
          <MessageCircle className="size-5" aria-hidden />Ask Nidhi
        </button>
      )}
      {open && (
        <section role="dialog" aria-label="Nidhi360 assistant"
          className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden rounded-t-2xl border border-line bg-white shadow-[0_24px_60px_-12px_rgba(10,31,77,0.45)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100dvh-3rem)] sm:w-[400px] sm:rounded-2xl">
          <header className="flex items-center gap-3 bg-brand-900 px-4 py-3 text-white">
            <LogoMark className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold leading-tight">Nidhi assistant</p>
              <p className="text-[12px] text-brand-100">Answers from our sourced rules register</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-md p-2 text-brand-100 hover:bg-white/10 hover:text-white"><X className="size-5" /></button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-canvas px-4 py-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={cx("flex", m.role === "user" && "justify-end")}>
                <div className={cx("max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed", m.role === "user" ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm border border-line bg-white text-body")}>
                  {m.role === "user" ? m.text : <Markdown text={m.text} />}
                  {m.steps && m.steps.length > 0 && (
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-[14px]">{m.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                  )}
                  {m.links && m.links.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.links.map((l) => <Link key={l.to + l.label} to={l.to} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[13px] font-semibold text-brand-700 no-underline hover:bg-brand-100">{l.label}</Link>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {STARTERS.map((s) => <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-line bg-white px-3 py-1.5 text-left text-[13px] font-medium text-ink hover:border-brand-200 hover:bg-brand-50">{s}</button>)}
              </div>
            )}
            {busy && <p className="text-sm text-muted">Checking the rules…</p>}
            <div ref={end} />
          </div>

          <div className="border-t border-line bg-white p-3">
            <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
              <label htmlFor="chat-q" className="sr-only">Your question</label>
              <input id="chat-q" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe your PF or NPS problem" autoComplete="off"
                className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white disabled:opacity-40"><ArrowUp className="size-5" /></button>
            </form>
            <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-snug text-muted"><ShieldAlert className="mt-px size-3.5 shrink-0" aria-hidden />Never share your UAN, Aadhaar, PAN, bank details or OTP. General information, not legal or tax advice.</p>
          </div>
        </section>
      )}
    </div>
  );
}
