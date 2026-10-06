import { Link, useParams } from "react-router-dom";
import { ArrowRight, CircleAlert } from "lucide-react";
import { LIFE_STAGES } from "../data/lifestages";
import { Cites, Container, cx } from "../components/ui";
import { PageHero } from "../components/ToolPage";
import NotFound from "./NotFound";

export default function LifeStagePage() {
  const { slug } = useParams();
  const stage = LIFE_STAGES.find((s) => s.slug === slug);
  if (!stage) return <NotFound />;
  return (
    <>
      <PageHero title={`In your ${stage.age}: ${stage.title.toLowerCase()}`} intro={stage.intro}>
        <div className="mt-6 flex flex-wrap gap-2" role="navigation" aria-label="Other life stages">
          {LIFE_STAGES.map((s) => (
            <Link key={s.slug} to={`/start/${s.slug}`} aria-current={s.slug === stage.slug ? "page" : undefined}
              className={cx("rounded-full border px-3.5 py-1.5 text-sm font-semibold no-underline", s.slug === stage.slug ? "border-gold bg-gold text-night" : "border-white/15 bg-white/5 text-ivory/80 hover:border-gold/60 hover:text-ivory")}>
              {s.age} · {s.title}
            </Link>
          ))}
        </div>
      </PageHero>
      <Container className="grid gap-10 py-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-xl font-bold">Do these three things now</h2>
          <ol className="mt-5 space-y-4">
            {stage.steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-xl border border-line p-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                <div className="min-w-0">
                  <h3 className="text-[17px] font-bold">{s.title}</h3>
                  <p className="mt-1.5 text-body">{s.body} {s.rules && <Cites ids={s.rules} />}</p>
                  {s.to && <Link to={s.to} className="mt-3 inline-flex items-center gap-1 text-[15px] font-semibold text-brand-600 no-underline hover:underline">{s.cta} <ArrowRight className="size-4" /></Link>}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <aside>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-amber-950"><CircleAlert className="size-5" aria-hidden />Mistakes to avoid</h2>
            <ul className="mt-3 space-y-3">
              {stage.avoid.map((a) => <li key={a} className="text-[15px] leading-relaxed text-amber-950">{a}</li>)}
            </ul>
          </div>
        </aside>
      </Container>
    </>
  );
}
