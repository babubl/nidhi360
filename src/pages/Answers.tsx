import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { track } from "../lib/track";
import { ArrowRight, MessageSquareText, Wrench, BookOpen } from "lucide-react";
import { ANSWERS, CATEGORY_LABELS, type AnswerCategory } from "../data/answers";
import { search } from "../lib/search";
import { Container } from "../components/ui";
import { PageHero, useTitle } from "../components/ToolPage";
import SearchBox from "../components/SearchBox";
import { StillStuck } from "./AnswerPage";

const ICON = { answer: MessageSquareText, tool: Wrench, term: BookOpen };

export default function Answers() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  useTitle(q ? `Results for "${q}"` : "PF and NPS answers", "Straight answers to the PF, EPS and NPS questions people ask most, with the official rule behind each.");
  const results = q ? search(q, 12) : [];
  useEffect(() => { if (q && !results.length) track("Search no results"); }, [q, results.length]);
  const cats = Object.keys(CATEGORY_LABELS) as AnswerCategory[];

  return (
    <>
      <PageHero title={q ? "Search results" : "Answers to your PF and NPS questions"} intro={q ? undefined : `${ANSWERS.length} of the questions people ask most, each with a straight answer, the steps, and the official rule behind it.`}>
        <div className="mt-6 max-w-2xl"><SearchBox size="lg" initial={q} autoFocus={!q} /></div>
      </PageHero>
      <Container className="py-10">
        {q ? (
          <div className="max-w-3xl">
            <p className="mb-4 text-sm text-muted">{results.length ? `${results.length} results for "${q}"` : `No direct match for "${q}".`}</p>
            <ul className="space-y-3">
              {results.map((r) => {
                const I = ICON[r.kind];
                return (
                  <li key={r.kind + r.to + r.title}>
                    <Link to={r.to} className="flex gap-4 rounded-xl border border-line p-4 no-underline transition hover:border-brand-200 hover:bg-brand-50/40">
                      <I className="mt-1 size-5 shrink-0 text-brand-600" aria-hidden />
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink">{r.title}</span>
                        <span className="mt-1 line-clamp-2 text-sm text-body">{r.snippet}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8"><StillStuck topic={q} /></div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            {cats.map((c) => (
              <section key={c}>
                <h2 className="text-lg font-bold">{CATEGORY_LABELS[c]}</h2>
                <ul className="mt-3 divide-y divide-line border-y border-line">
                  {ANSWERS.filter((a) => a.category === c).map((a) => (
                    <li key={a.slug}>
                      <Link to={`/answers/${a.slug}`} className="group flex items-center justify-between gap-3 py-3 text-[15px] font-medium text-ink no-underline hover:text-brand-700">
                        {a.question}<ArrowRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
