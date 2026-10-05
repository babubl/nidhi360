import { Link } from "react-router-dom";
import { Container } from "../components/ui";
import { PageHero } from "../components/ToolPage";
import { RULES, RULES_CHECKED_ON } from "../data/rules";
import { FOUNDER, REPO_URL } from "../data/team";
import { fmtDate } from "../lib/format";

const SECTIONS = [
  { h: "Where our answers come from", p: `Every tool is built on a register of ${RULES.length} rules: EPFO schemes and circulars, PFRDA regulations, gazette notifications and the Income-tax Act. Each rule records its source and the date it applies from, and every tool and answer shows which rules it used. The register was last verified on ${fmtDate(RULES_CHECKED_ON)}.` },
  { h: "When rules are announced but not live", p: "Some changes are announced long before they work on the portal, such as PF withdrawal by UPI. We label these clearly and don't build them into calculations until they're in force." },
  { h: "When we get something wrong", p: "Every answer and rule has a Report an error link. Reports are public, so anyone can see what was flagged and when it was fixed. We correct confirmed errors and update the checked date." },
  { h: "Your data", p: "There's no sign-up. Numbers you enter (age, balance, dates) are saved only on your device so you don't have to retype them, and you can clear them any time. We never ask for your UAN password, OTP, PRAN login, Aadhaar, PAN or bank details." },
  { h: "How we make money", p: "The tools and answers are free. We charge for expert help on hard cases, and employers pay to offer Nidhi360 to their staff. We don't take commissions on any financial product, and we don't show ads." },
  { h: "What we are not", p: "Nidhi360 is independent and is not affiliated with EPFO, PFRDA or any government body. We are not a SEBI-registered investment adviser and don't give personalised investment, tax or legal advice. Always confirm on the official portal before filing." },
];

export default function About() {
  return (
    <>
      <PageHero title="Who's behind Nidhi360" intro="Nidhi360 exists because PF and NPS rules change often, and most people find out the hard way, when a claim is rejected." />
      <Container className="max-w-3xl py-10">
        <section className="flex flex-col gap-5 rounded-2xl border border-line p-6 sm:flex-row">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white" aria-hidden>
            {FOUNDER.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{FOUNDER.name}</h2>
            <p className="text-sm text-muted">{FOUNDER.role}, {FOUNDER.location}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FOUNDER.credentials.map((c) => <span key={c} className="rounded-full bg-brand-50 px-3 py-1 text-[13px] font-semibold text-brand-700">{c}</span>)}
            </div>
            <p className="mt-3 text-body">{FOUNDER.bio}</p>
          </div>
        </section>
        {SECTIONS.map((s) => (
          <section key={s.h} className="border-b border-line py-6">
            <h2 className="text-xl font-bold">{s.h}</h2>
            <p className="mt-2 text-body">{s.p}</p>
          </section>
        ))}
        <p className="mt-8 text-body">
          See the full register on <Link to="/rules" className="font-semibold text-brand-600">Rule updates</Link>, read our <Link to="/legal" className="font-semibold text-brand-600">terms and privacy</Link>, or browse the <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600">source code</a>.
        </p>
      </Container>
    </>
  );
}
