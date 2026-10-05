import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle } from "lucide-react";
import { Container, Cites } from "./ui";
import { ruleById } from "../data/rules";

export function PageHero({ crumb, title, intro, children }: { crumb?: { to: string; label: string }; title: string; intro?: string; children?: ReactNode }) {
  return (
    <section className="border-b border-line bg-canvas">
      <Container className="py-10 sm:py-12">
        {crumb && (
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-sm text-muted">
            <Link to="/" className="text-muted no-underline hover:text-ink">Home</Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link to={crumb.to} className="text-muted no-underline hover:text-ink">{crumb.label}</Link>
          </nav>
        )}
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-[40px] sm:leading-[1.15]">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-[17px] text-body">{intro}</p>}
        {children}
      </Container>
    </section>
  );
}

/** Two-column tool layout: inputs left, live result right. On mobile, a bottom bar shows the headline result until the full result scrolls into view. */
export function ToolGrid({ form, result, summary }: { form: ReactNode; result: ReactNode; summary?: { label: string; value: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const [resultVisible, setResultVisible] = useState(false);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setResultVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <Container className="grid items-start gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-8">
        <div className="min-w-0">{form}</div>
        <div ref={ref} className="min-w-0 scroll-mt-20 lg:sticky lg:top-24" aria-live="polite">{result}</div>
      </Container>
      {summary && !resultVisible && (
        <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(16,24,40,0.2)] backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0"><p className="text-xs text-muted">{summary.label}</p><p className="num truncate text-lg font-bold text-ink">{summary.value}</p></div>
            <button type="button" onClick={() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">See details</button>
          </div>
        </div>
      )}
    </>
  );
}

export function RulesUsed({ ids }: { ids: string[] }) {
  const rules = [...new Set(ids)].map(ruleById).filter(Boolean);
  if (!rules.length) return null;
  return (
    <Container className="pb-4">
      <div className="rounded-xl border border-line p-5">
        <p className="text-sm font-semibold text-ink">Rules this tool uses</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {rules.map((r) => (
            <li key={r!.id} className="flex items-start gap-2 text-sm">
              <Cites ids={[r!.id]} />
              <span className="text-body">{r!.title} <span className="text-muted">· {r!.source}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

export function ExpertHelp({ context }: { context: string }) {
  return (
    <Link to={`/help?topic=${encodeURIComponent(context)}`}
      className="no-print mt-4 flex items-center gap-3 rounded-xl border border-line p-4 no-underline hover:border-brand-200 hover:bg-brand-50">
      <MessageCircle className="size-5 shrink-0 text-brand-600" aria-hidden />
      <span className="text-[15px]"><span className="font-semibold text-ink">Still stuck? Get an expert on your case.</span><span className="block text-sm text-muted">Pay only after we confirm we can help. We never ask for your password or OTP.</span></span>
    </Link>
  );
}

export function SavedNote() {
  return <p className="text-[13px] text-muted">Your entries are saved only on this device and prefill the other tools. <Link to="/legal#privacy" className="text-muted underline">Clear them</Link></p>;
}
