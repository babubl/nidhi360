import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, BookOpenCheck, CalendarPlus, CalendarClock, FileText, FileWarning, HeartPulse, Landmark, LockKeyhole, PiggyBank, Repeat, Scale, Wallet } from "lucide-react";
import { AreaBadge, ButtonLink, Container, SectionTitle, StatusBadge } from "../components/ui";
import SearchBox from "../components/SearchBox";
import { useTitle } from "../components/ToolPage";
import { LIFE_STAGES } from "../data/lifestages";
import { rulesByRecency, RULES_CHECKED_ON } from "../data/rules";
import { estimateWithdrawal } from "../lib/calc/pfWithdrawal";
import { fmtDate, inr } from "../lib/format";

const TOOLS = [
  { to: "/pf/health-check", icon: HeartPulse, title: "PF account check", body: "11 quick questions that catch the problems behind most rejected claims." },
  { to: "/pf/claim-rejected", icon: FileWarning, title: "Claim rejected?", body: "Paste the rejection reason. Get what it means and exactly how to fix it." },
  { to: "/pf/job-change", icon: Repeat, title: "Job change & transfer", body: "Move PF from old employers, merge a second UAN, handle a closed company." },
  { to: "/pf/withdraw", icon: Wallet, title: "Withdrawal estimate", body: "What you can take for each purpose under the 2026 rules, with TDS." },
  { to: "/pf/pension", icon: Landmark, title: "EPS pension estimate", body: "Your monthly pension at 58, or earlier or later, and what affects it." },
  { to: "/nps/tax", icon: Scale, title: "NPS tax savings", body: "What NPS saves you in the old and new regimes, and what HR can change." },
  { to: "/nps/retirement", icon: PiggyBank, title: "NPS retirement & exit", body: "Your corpus, the lump sum you can take, the annuity, and the tax on each." },
  { to: "/pf/grievance", icon: FileText, title: "Complaint drafter", body: "A clear EPFiGMS grievance for delayed claims, unpaid PF or a stuck transfer." },
  { to: "/reminders", icon: CalendarPlus, title: "Deadline reminders", body: "Exit date, 12-month settlement, pension at 58, NPS before 60: in your calendar." },
];

const STATS = [
  { n: "1 in 5", t: "PF claims gets rejected", d: "About 174 lakh of 796 lakh claims in FY 2024-25, mostly for fixable KYC, bank and record errors (EPFO annual report)." },
  { n: "7.5 crore", t: "active EPF members", d: "Contributing members, as reported by the Labour Ministry in 2026. The ₹25,000 wage ceiling brings 51 lakh more under mandatory PF." },
  { n: "2.3 crore", t: "NPS subscribers today", d: "PFRDA expects 2–3 crore more in the next two years with UPI account opening." },
];

const POPULAR = [
  { slug: "withdraw-after-resigning", label: "PF after resigning" },
  { slug: "claim-pending-too-long", label: "Claim pending" },
  { slug: "transfer-pf", label: "Transfer PF" },
  { slug: "check-balance", label: "Check balance" },
  { slug: "nps-at-60", label: "NPS at 60" },
];

const FAQ = [
  { q: "Is this an official EPFO or NPS website?", a: "No. Nidhi360 is independent. We explain the official rules and link to the official portals, where you file your claim yourself." },
  { q: "Do you need my UAN, password or OTP?", a: "Never. Nothing on Nidhi360 asks for login details, and you don't need an account. If anyone claiming to be us asks, it's a scam." },
  { q: "How current is the information?", a: `Every rule is tied to its circular or notification and the date it applies from. The full register was last verified on ${fmtDate(RULES_CHECKED_ON)}, and Rule updates shows what changed.` },
  { q: "Can I withdraw my full PF after resigning?", a: "Not immediately. Under the EPF Scheme 2026 a full settlement needs 12 months without a job. Until then you can take up to about 75% as a partial withdrawal." },
  { q: "Is NPS still worth it in the new tax regime?", a: "Your own contribution gets no deduction in the new regime, but your employer's contribution (up to 14% of basic + DA) does. The NPS tax tool shows your numbers." },
  { q: "Is it free?", a: "Yes. The tools are free for individuals. We offer a paid version for employers who want to give their staff PF and NPS support." },
];

function HeroPreview() {
  const r = estimateWithdrawal({ purpose: "illness", balance: 420000, membershipMonths: 40, continuousServiceYears: 4, age: 31, monthsUnemployed: 0, panLinked: true });
  return (
    <div className="mx-auto w-full max-w-md lg:mx-0" aria-label="Example withdrawal estimate">
      <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_24px_48px_-24px_rgba(16,24,40,0.25)]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Withdrawal estimate</p>
          <span className="rounded-full bg-canvas px-2.5 py-0.5 text-xs font-medium text-muted">Example</span>
        </div>
        <p className="mt-1 text-[13px] text-muted">Medical treatment · PF balance {inr(420000)}</p>
        <p className="mt-5 text-sm text-muted">You can withdraw</p>
        <p className="num text-4xl font-bold tracking-tight text-ink">{inr(r.amount)}</p>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-canvas">
          <div className="h-full rounded-full bg-brand-600" style={{ width: "75%" }} />
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Stays in your account</dt><dd className="num font-semibold text-ink">{inr(r.remains)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd className="font-semibold text-ink">None</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Form</dt><dd className="font-semibold text-ink">Form 31, online</dd></div>
        </dl>
        <div className="mt-5 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-[13px] text-brand-900">
          <BadgeCheck className="size-4 shrink-0 text-brand-600" aria-hidden />
          Auto-settles without documents when KYC is complete
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  useTitle("");
  const latest = rulesByRecency().slice(0, 3);
  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-canvas to-white">
        <Container className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[13px] font-medium text-body">
              <span className="size-1.5 rounded-full bg-brand-500" />Updated for the EPF Scheme 2026 and new NPS exit rules
            </p>
            <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">Your PF and NPS, sorted without the runaround.</h1>
            <p className="mt-5 max-w-xl text-lg text-body">Know what you can withdraw, fix a rejected claim, move PF after a job change, and plan your pension and NPS exit. Every answer comes from the current EPFO and PFRDA rules, with the source shown.</p>
            <div className="mt-8 max-w-xl"><SearchBox size="lg" /></div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">People ask:</span>
              {POPULAR.map((p) => <Link key={p.slug} to={`/answers/${p.slug}`} className="rounded-full border border-line bg-white px-3 py-1 text-[13px] font-medium text-body no-underline hover:border-brand-200 hover:text-ink">{p.label}</Link>)}
            </div>
            <p className="mt-6 text-sm text-muted">Free. No login. We never ask for your UAN password or OTP.</p>
          </div>
          <HeroPreview />
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="grid grid-cols-2 gap-6 py-7 text-sm md:grid-cols-4">
          {[
            [BookOpenCheck, "Source on every rule", "Circular and date shown"],
            [CalendarClock, "Current to " + fmtDate(RULES_CHECKED_ON), "Tracked as rules change"],
            [LockKeyhole, "No login, no data stored", "Runs in your browser"],
            [BadgeCheck, "Independent", "Not affiliated with EPFO or PFRDA"],
          ].map(([Icon, t, s]) => {
            const I = Icon as typeof BookOpenCheck;
            return (
              <div key={t as string} className="flex items-start gap-3">
                <I className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                <div><p className="font-semibold text-ink">{t as string}</p><p className="text-muted">{s as string}</p></div>
              </div>
            );
          })}
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.n}>
                <p className="num text-4xl font-extrabold tracking-tight text-brand-600">{s.n}</p>
                <p className="mt-2 font-semibold text-ink">{s.t}</p>
                <p className="mt-1 text-sm text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-16 sm:py-20">
        <Container>
          <SectionTitle title="Start with where you are" intro="What matters about your PF and NPS changes with every decade of your career. Pick yours for the three things to do now." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LIFE_STAGES.map((s) => (
              <Link key={s.slug} to={`/start/${s.slug}`} className="group flex flex-col rounded-xl border border-line bg-white p-5 no-underline transition hover:border-brand-200 hover:shadow-md">
                <span className="text-3xl font-extrabold tracking-tight text-brand-600">{s.age}</span>
                <span className="mt-3 text-[17px] font-bold text-ink">{s.title}</span>
                <span className="mt-1 text-sm text-muted">{s.short}</span>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">See your plan <ArrowRight className="size-4 transition group-hover:translate-x-0.5" /></span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section id="tools" className="scroll-mt-16 border-y border-line bg-canvas py-16 sm:py-20">
        <Container>
          <SectionTitle title="Tools for the jobs people actually get stuck on" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <Link key={t.to} to={t.to} className="group flex gap-4 rounded-xl border border-line bg-white p-5 no-underline transition hover:border-brand-200 hover:shadow-md">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><t.icon className="size-5" aria-hidden /></span>
                <span>
                  <span className="block text-[16px] font-bold text-ink">{t.title}</span>
                  <span className="mt-1 block text-sm text-muted">{t.body}</span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionTitle title="Rules change often. We keep up." intro="Three of the most recent changes. Each tool shows exactly which rules it uses."
            action={<Link to="/rules" className="text-sm font-semibold text-brand-600 no-underline hover:underline">All rule updates →</Link>} />
          <div className="grid gap-4 md:grid-cols-3">
            {latest.map((r) => (
              <Link key={r.id} to={`/rules#${r.id}`} className="flex flex-col rounded-xl border border-line p-5 no-underline transition hover:border-brand-200">
                <div className="flex items-center gap-2"><AreaBadge area={r.area} /><StatusBadge status={r.status} /></div>
                <p className="mt-3 text-[16px] font-bold text-ink">{r.title}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{r.summary}</p>
                <p className="mt-auto pt-4 text-[13px] font-medium text-body">{r.source}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-bold sm:text-[28px]">Common questions</h2>
            <p className="mt-2 text-muted">More in the <Link to="/answers" className="font-semibold text-brand-600">answers library</Link>, and the <Link to="/glossary" className="font-semibold text-brand-600">glossary</Link> explains the jargon.</p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-ink">
                  {f.q}<span className="text-xl text-muted transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-body">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand-900 px-6 py-10 sm:flex-row sm:items-center sm:px-10">
            <div>
              <h2 className="text-2xl font-bold text-white">Most rejected claims could have been prevented.</h2>
              <p className="mt-2 text-brand-100">Check your account in two minutes, before you need the money.</p>
            </div>
            <ButtonLink to="/pf/health-check" variant="secondary" className="shrink-0 px-5 py-3 text-base">Check my PF account</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
