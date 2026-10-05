import { useState } from "react";
import { Search } from "lucide-react";
import { GLOSSARY } from "../data/glossary";
import { Container } from "../components/ui";
import { PageHero, useTitle } from "../components/ToolPage";

export default function Glossary() {
  useTitle("PF and NPS glossary", "UAN, EPS, Form 19, Form 10C, PRAN, annuity and more, explained in plain English.");
  const [q, setQ] = useState("");
  const list = GLOSSARY.filter((g) => (g.term + " " + g.meaning).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHero title="PF and NPS jargon, in plain English" intro="The terms you'll see on the EPFO portal, in NPS statements and in rejection messages.">
        <div className="relative mt-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a term, e.g. Form 19" aria-label="Search glossary"
            className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-[15px] outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
        </div>
      </PageHero>
      <Container className="py-10">
        <dl className="grid gap-x-10 md:grid-cols-2">
          {list.map((g) => (
            <div key={g.term} className="border-b border-line py-4">
              <dt className="font-bold text-ink">{g.term}</dt>
              <dd className="mt-1 text-body">{g.meaning}</dd>
            </div>
          ))}
        </dl>
        {!list.length && <p className="text-muted">No match for "{q}".</p>}
      </Container>
    </>
  );
}
