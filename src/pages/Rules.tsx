import { useState } from "react";
import { ExternalLink, Flag } from "lucide-react";
import { reportErrorUrl } from "../data/team";
import { rulesByRecency, RULES_CHECKED_ON } from "../data/rules";
import type { Area } from "../data/types";
import { fmtDate } from "../lib/format";
import { AreaBadge, Container, Segmented, StatusBadge } from "../components/ui";
import { PageHero } from "../components/ToolPage";

export default function Rules() {
  const [area, setArea] = useState<"all" | Area>("all");
  const list = rulesByRecency().filter((r) => area === "all" || r.area === area);
  return (
    <>
      <PageHero title="Rule updates" intro={`Every rule our tools use, with its official source and the date it applies from. Last verified on ${fmtDate(RULES_CHECKED_ON)}.`}>
        <div className="mt-6">
          <Segmented label="Filter by area" value={area} onChange={setArea} options={[{ value: "all", label: "All" }, { value: "pf", label: "PF" }, { value: "nps", label: "NPS" }, { value: "tax", label: "Tax" }]} />
        </div>
      </PageHero>
      <Container className="py-10">
        <ol className="relative space-y-4 border-l border-line pl-6 sm:pl-8">
          {list.map((r) => (
            <li key={r.id} id={r.id} className="relative scroll-mt-24 rounded-xl border border-line bg-white p-5 target:border-brand-500 target:ring-4 target:ring-brand-100">
              <span className="absolute -left-[31px] top-6 size-3 rounded-full border-2 border-white bg-brand-600 ring-1 ring-line sm:-left-[39px]" aria-hidden />
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <AreaBadge area={r.area} /><StatusBadge status={r.status} />
                <span className="text-muted">{r.status === "live" ? "From" : "Checked"} {fmtDate(r.effective)}</span>
                <span className="ml-auto font-semibold text-muted">{r.id}</span>
              </div>
              <h2 className="mt-3 text-lg font-bold">{r.title}</h2>
              <p className="mt-1.5 text-body">{r.summary}</p>
              <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 no-underline hover:underline">
                Source: {r.source}<ExternalLink className="size-3.5" />
              </a>
              <a href={reportErrorUrl(`/rules#${r.id}`, `${r.id} ${r.title}`)} target="_blank" rel="noopener noreferrer" className="ml-4 inline-flex items-center gap-1 text-sm text-muted no-underline hover:text-ink">
                <Flag className="size-3.5" aria-hidden />Report an error
              </a>
            </li>
          ))}
        </ol>
      </Container>
    </>
  );
}
