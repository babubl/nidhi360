import { Link, useParams } from "react-router-dom";
import { ArrowRight, ExternalLink, FileText, MessageCircle, Sparkles } from "lucide-react";
import { answerBySlug, CATEGORY_LABELS } from "../data/answers";
import { ruleById } from "../data/rules";
import { config, aiEnabled } from "../config";
import { AreaBadge, ButtonLink, Container, StatusBadge } from "../components/ui";
import { useTitle } from "../components/ToolPage";
import { fmtDate } from "../lib/format";
import NotFound from "./NotFound";

export function StillStuck({ topic }: { topic: string }) {
  const options = [
    { to: "/pf/grievance", icon: FileText, title: "File a complaint with EPFO", body: "We'll draft your EPFiGMS grievance in a minute." },
    ...(aiEnabled ? [{ to: "/ask", icon: Sparkles, title: "Ask your exact question", body: "Answered from the same official rules." }] : []),
  ];
  return (
    <div className="rounded-xl border border-line bg-canvas p-5">
      <p className="font-semibold text-ink">Didn't solve it?</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <Link key={o.to} to={o.to} className="flex gap-3 rounded-lg border border-line bg-white p-4 no-underline hover:border-brand-200">
            <o.icon className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
            <span><span className="block font-semibold text-ink">{o.title}</span><span className="block text-sm text-muted">{o.body}</span></span>
          </Link>
        ))}
        {config.whatsapp && (
          <a href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent("Hi Nidhi360, I need help with: " + topic)}`} target="_blank" rel="noopener noreferrer" className="flex gap-3 rounded-lg border border-line bg-white p-4 no-underline hover:border-brand-200">
            <MessageCircle className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
            <span><span className="block font-semibold text-ink">Talk to a PF expert</span><span className="block text-sm text-muted">On WhatsApp. Never share your password or OTP.</span></span>
          </a>
        )}
      </div>
    </div>
  );
}

export default function AnswerPage() {
  const { slug = "" } = useParams();
  const a = answerBySlug(slug);
  useTitle(a?.question ?? "Not found", a?.short);
  if (!a) return <NotFound />;
  const rules = a.rules.map(ruleById).filter(Boolean);

  return (
    <>
      <section className="border-b border-line bg-canvas">
        <Container className="max-w-3xl py-10">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted">
            <Link to="/answers" className="text-muted no-underline hover:text-ink">Answers</Link> <span aria-hidden>›</span> {CATEGORY_LABELS[a.category]}
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-[36px] sm:leading-tight">{a.question}</h1>
        </Container>
      </section>
      <Container className="max-w-3xl space-y-8 py-10">
        <div className="rounded-xl border-l-4 border-brand-600 bg-brand-50 p-5">
          <p className="text-sm font-semibold text-brand-700">Short answer</p>
          <p className="mt-1.5 text-[17px] leading-relaxed text-ink">{a.short}</p>
        </div>

        {a.steps && (
          <section>
            <h2 className="text-xl font-bold">What to do</h2>
            <ol className="mt-4 space-y-3">
              {a.steps.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                  <p className="pt-0.5 text-body">{s}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {a.tool && (
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-line p-5 sm:flex-row sm:items-center">
            <p className="font-semibold text-ink">Work it out for your own numbers</p>
            <ButtonLink to={a.tool.to}>{a.tool.label} <ArrowRight className="size-4" /></ButtonLink>
          </div>
        )}

        {rules.length > 0 && (
          <section>
            <h2 className="text-xl font-bold">The rules behind this answer</h2>
            <ul className="mt-4 space-y-3">
              {rules.map((r) => (
                <li key={r!.id} className="rounded-xl border border-line p-4">
                  <div className="flex flex-wrap items-center gap-2 text-[13px]"><AreaBadge area={r!.area} /><StatusBadge status={r!.status} /><span className="text-muted">{r!.status === "live" ? "From" : "Checked"} {fmtDate(r!.effective)}</span></div>
                  <p className="mt-2 font-semibold text-ink">{r!.title}</p>
                  <a href={r!.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-brand-700 no-underline hover:underline">{r!.source}<ExternalLink className="size-3" /></a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {a.related && (
          <section>
            <h2 className="text-xl font-bold">Related questions</h2>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {a.related.map(answerBySlug).filter(Boolean).map((r) => (
                <li key={r!.slug}><Link to={`/answers/${r!.slug}`} className="block py-3 font-medium text-ink no-underline hover:text-brand-700">{r!.question}</Link></li>
              ))}
            </ul>
          </section>
        )}

        <StillStuck topic={a.question} />
      </Container>
    </>
  );
}
