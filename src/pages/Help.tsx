import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { config } from "../config";
import { FOUNDER } from "../data/team";
import { containsSensitive } from "../lib/calc/rejection";
import { track } from "../lib/track";
import { Callout, Card, Container, Field, Select, SectionTitle, cx } from "../components/ui";
import { PageHero } from "../components/ToolPage";

/** Edit prices and scope here. */
export const PLANS = [
  { id: "free", name: "Self-serve", price: "Free", for: "Most questions", points: ["Answers library and all tools", "Complaint drafter for EPFiGMS", "Deadline reminders"], cta: { to: "/answers", label: "Find your answer" } },
  { id: "review", name: "Case review", price: "₹499", for: "Rejected or stuck claims, transfers, KYC and name fixes", points: ["An expert reviews your claim status and records", "Exactly what's wrong and what to file, in writing", "One follow-up within 14 days"], highlight: true },
  { id: "full", name: "Full case support", price: "₹999", for: "Death claims, employer defaults, EPS pension, closed companies, old accounts", points: ["Step-by-step guidance until the claim settles", "Grievance and escalation drafted for you (EPFiGMS, CPGRAMS)", "Follow-ups for up to 90 days"] },
];

const CASE_TYPES = [
  "PF claim rejected or pending",
  "PF transfer stuck",
  "Name, date of birth or KYC correction",
  "Employer not depositing PF or closed",
  "Family member died: PF, pension, EDLI claim",
  "EPS pension: starting, stopped or wrong amount",
  "Old or forgotten PF account",
  "NPS withdrawal or exit",
  "Something else",
];

export default function Help() {
  const [params] = useSearchParams();
  const [plan, setPlan] = useState("review");
  const [type, setType] = useState(CASE_TYPES[0]);
  const [desc, setDesc] = useState(params.get("topic") ? `About: ${params.get("topic")}\n\n` : "");
  const [contact, setContact] = useState<"whatsapp" | "email">(config.whatsapp ? "whatsapp" : "email");
  const leaked = containsSensitive(desc);
  const open = Boolean(config.whatsapp || config.contactEmail);
  const message = `Nidhi360 expert help request\nPlan: ${PLANS.find((p) => p.id === plan)?.name}\nCase: ${type}\n\n${desc.trim()}`;

  const send = () => {
    track("Expert contact", { plan, type });
    if (contact === "whatsapp" && config.whatsapp) window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    else if (config.contactEmail) location.href = `mailto:${config.contactEmail}?subject=${encodeURIComponent("Expert help: " + type)}&body=${encodeURIComponent(message)}`;
  };

  return (
    <>
      <PageHero title="Get an expert on your PF or NPS case" intro="When the tools aren't enough, such as a claim stuck for months, a family member's death claim, an employer who won't cooperate or a pension that stopped, a person who knows the rules works through it with you.">
        <p className="mt-4 flex items-center gap-2 text-sm text-body"><ShieldCheck className="size-4 text-brand-600" aria-hidden />You stay in control: we tell you exactly what to file and say. We never ask for your password or OTP.</p>
      </PageHero>
      <Container className="py-12">
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.id} className={cx("flex flex-col rounded-2xl border p-6", p.highlight ? "border-brand-600 ring-4 ring-brand-100" : "border-line")}>
              <p className="font-bold text-ink">{p.name}</p>
              <p className="num mt-2 text-3xl font-extrabold text-ink">{p.price}{p.id !== "free" && <span className="text-base font-semibold text-muted"> per case</span>}</p>
              <p className="mt-2 text-sm text-muted">{p.for}</p>
              <ul className="mt-4 space-y-2">
                {p.points.map((x) => <li key={x} className="flex gap-2 text-[15px] text-body"><Check className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden />{x}</li>)}
              </ul>
              <div className="mt-auto pt-5">
                {p.cta
                  ? <Link to={p.cta.to} className="inline-flex w-full justify-center rounded-lg border border-line px-4 py-2.5 font-semibold text-ink no-underline hover:bg-canvas">{p.cta.label}</Link>
                  : <a href="#request" onClick={() => setPlan(p.id)} className={cx("inline-flex w-full justify-center rounded-lg px-4 py-2.5 font-semibold no-underline", p.highlight ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-line text-ink hover:bg-canvas")}>Choose {p.name.toLowerCase()}</a>}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">You pay only after we've reviewed your case and confirmed we can help. If we can't, you pay nothing.</p>

        <div id="request" className="mt-14 grid scroll-mt-24 gap-8 lg:grid-cols-[1.2fr_1fr]">
          <Card className="space-y-5">
            <h2 className="text-xl font-bold">Tell us about your case</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Plan" htmlFor="plan"><Select id="plan" value={plan} onChange={setPlan} options={PLANS.filter((p) => p.id !== "free").map((p) => ({ value: p.id, label: `${p.name} (${p.price})` }))} /></Field>
              <Field label="What kind of case?" htmlFor="type"><Select id="type" value={type} onChange={setType} options={CASE_TYPES.map((c) => ({ value: c, label: c }))} /></Field>
            </div>
            <Field label="What's happened so far?" htmlFor="desc" hint="Dates, what the portal shows, what you've tried. No UAN, Aadhaar, PAN, bank numbers or OTPs.">
              <textarea id="desc" rows={6} value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
            </Field>
            {leaked && <Callout tone="warn">That looks like an Aadhaar, PAN or OTP. Please remove it; we'll never need it.</Callout>}
            {open ? (
              <div className="flex flex-wrap items-center gap-3">
                {config.whatsapp && config.contactEmail && (
                  <div className="flex gap-2 text-sm">
                    {(["whatsapp", "email"] as const).map((c) => <button key={c} type="button" onClick={() => setContact(c)} aria-pressed={contact === c} className={cx("rounded-full border px-3 py-1 font-semibold", contact === c ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line text-body")}>{c === "whatsapp" ? "WhatsApp" : "Email"}</button>)}
                  </div>
                )}
                <button type="button" disabled={leaked || desc.trim().length < 15} onClick={send} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                  {contact === "whatsapp" ? <MessageCircle className="size-4" /> : <Mail className="size-4" />}Send my case
                </button>
              </div>
            ) : (
              <Callout title="Expert help opens soon">
                <p>We're onboarding our first cases. In the meantime, the <Link to="/pf/grievance" className="font-semibold text-brand-700">complaint drafter</Link> gets most stuck claims moving.</p>
              </Callout>
            )}
          </Card>
          <div>
            <SectionTitle title="How it works" />
            <ol className="space-y-4">
              {[
                ["Send your case", "A few lines about what's happened. No ID numbers or passwords."],
                ["We review it", "Usually within one working day, we tell you what's wrong, whether we can help, and the fee."],
                ["We guide you to the finish", "You file on the official portal with our exact steps and drafts. We follow up until it's settled or escalated."],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                  <div><p className="font-semibold text-ink">{t}</p><p className="text-sm text-body">{b}</p></div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted">Led by {FOUNDER.name}, {FOUNDER.credentials.join(", ")}. <Link to="/about" className="text-brand-700">About us</Link></p>
          </div>
        </div>
      </Container>
    </>
  );
}
