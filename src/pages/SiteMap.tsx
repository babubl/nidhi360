import { Link } from "react-router-dom";
import { Container } from "../components/ui";
import { PageHero } from "../components/ToolPage";
import { ANSWERS, CATEGORY_LABELS } from "../data/answers";
import { LIFE_STAGES } from "../data/lifestages";
import { NPS_TOOLS, PF_TOOLS } from "../data/tools";

const lk = "text-[15px] text-body no-underline hover:text-brand-700 hover:underline";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <ul className="mt-3 space-y-2">{children}</ul>
    </section>
  );
}

export default function SiteMap() {
  const cats = Object.entries(CATEGORY_LABELS);
  return (
    <>
      <PageHero crumb={{ to: "/", label: "Home" }} title="Site map" intro="Every tool, guide and answer on Nidhi360, in one place." />
      <Container className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-3">
        <Group title="PF tools">{PF_TOOLS.map((i) => <li key={i.to}><Link className={lk} to={i.to}>{i.label}</Link></li>)}</Group>
        <Group title="NPS and comparison">{NPS_TOOLS.map((i) => <li key={i.to}><Link className={lk} to={i.to}>{i.label}</Link></li>)}</Group>
        <Group title="By stage of life">{LIFE_STAGES.map((s) => <li key={s.slug}><Link className={lk} to={`/start/${s.slug}`}>PF and NPS in your {s.age}</Link></li>)}</Group>
        <Group title="Learn and stay current">
          {[["/answers", "All answers"], ["/rules", "Rule updates with sources"], ["/glossary", "Glossary"], ["/monthly", "Monthly PF check-up"]].map(([to, l]) => <li key={to}><Link className={lk} to={to}>{l}</Link></li>)}
        </Group>
        <Group title="Company">
          {[["/help", "Expert help"], ["/about", "About Nidhi360"], ["/employers", "For employers"], ["/legal", "Terms, privacy and disclaimer"]].map(([to, l]) => <li key={to}><Link className={lk} to={to}>{l}</Link></li>)}
        </Group>
        {cats.map(([key, label]) => (
          <Group key={key} title={`Answers: ${label}`}>
            {ANSWERS.filter((a) => a.category === key).map((a) => <li key={a.slug}><Link className={lk} to={`/answers/${a.slug}`}>{a.question}</Link></li>)}
          </Group>
        ))}
      </Container>
    </>
  );
}
