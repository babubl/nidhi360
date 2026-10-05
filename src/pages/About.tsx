import { Link } from "react-router-dom";
import { Container } from "../components/ui";
import { PageHero, useTitle } from "../components/ToolPage";
import { RULES, RULES_CHECKED_ON } from "../data/rules";
import { fmtDate } from "../lib/format";

const SECTIONS = [
  { h: "Where our answers come from", p: `Every tool is built on a register of ${RULES.length} rules: EPFO schemes and circulars, PFRDA regulations, gazette notifications and the Income-tax Act. Each rule records its source and the date it applies from, and tools show which rules they used. The register was last verified on ${fmtDate(RULES_CHECKED_ON)}.` },
  { h: "When rules are announced but not live", p: "Some changes are announced long before they work on the portal, such as PF withdrawal by UPI. We label these clearly and don't build them into calculations until they're in force." },
  { h: "Your data", p: "The tools run in your browser. We don't ask you to sign up, and we never ask for your UAN password, OTP, PRAN login, Aadhaar, PAN or bank details. Answers you give in the PF account check are saved only on your device." },
  { h: "The AI assistant", p: "When available, the assistant answers only from the same rules register and cites the rule it relies on. Messages containing Aadhaar, PAN or OTP numbers are blocked before they're sent." },
  { h: "What we are not", p: "Nidhi360 is independent and is not affiliated with EPFO, PFRDA or any government body. We don't file claims for you and don't give personalised investment, tax or legal advice. Always confirm on the official portal before filing." },
];

export default function About() {
  useTitle("How Nidhi360 works");
  return (
    <>
      <PageHero title="How we work" intro="Nidhi360 exists because PF and NPS rules change often, and most people find out the hard way, when a claim is rejected." />
      <Container className="max-w-3xl py-10">
        {SECTIONS.map((s) => (
          <section key={s.h} className="border-b border-line py-6 first:pt-0">
            <h2 className="text-xl font-bold">{s.h}</h2>
            <p className="mt-2 text-body">{s.p}</p>
          </section>
        ))}
        <p className="mt-8 text-body">See the full register on <Link to="/rules" className="font-semibold text-brand-600">Rule updates</Link>.</p>
      </Container>
    </>
  );
}
