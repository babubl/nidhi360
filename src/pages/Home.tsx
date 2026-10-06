import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, CalendarPlus, FileText, FileWarning, HeartPulse, Landmark, PiggyBank, Repeat, Scale, Wallet } from "lucide-react";
import { AreaBadge, ButtonLink, Container, SectionTitle, StatusBadge } from "../components/ui";
import SearchBox from "../components/SearchBox";
import { FOUNDER } from "../data/team";
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
  { q: "Is it free?", a: "Yes. All answers and tools are free. If your case needs a person, such as a death claim or an employer that won't cooperate, expert help costs ₹499–999 per case, and you pay only after we confirm we can help." },
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

const QUICK = [
  { to: "/pf/health-check", icon: HeartPulse, title: "Check my PF account", sub: "2 minutes · find what blocks claims" },
  { to: "/pf/claim-rejected", icon: FileWarning, title: "My claim was rejected", sub: "Understand it and fix it" },
  { to: "/pf/withdraw", icon: Wallet, title: "How much can I withdraw?", sub: "Under the EPF Scheme 2026" },
  { to: "/pf/job-change", icon: Repeat, title: "Changed jobs? Move my PF", sub: "Transfer and merge UANs" },
];

const TINT = ["bg-brand-50 text-brand-600", "bg-amber-50 text-amber-600", "bg-emerald-50 text-emerald-600", "bg-violet-50 text-violet-600"];

export default function Home() {
  const latest = rulesByRecency().slice(0, 3);
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 size-[360px] rounded-full bg-amber-400/10 blur-3xl" aria-hidden />
        <Container className="relative grid items-center gap-12 pb-28 pt-14 sm:pb-32 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[13px] font-medium text-brand-100">
              <span className="size-1.5 rounded-full bg-amber-400" />Updated for the EPF Scheme 2026 and new NPS exit rules
            </p>
            <h1 className="text-[36px] font-extrabold leading-[1.08] tracking-tight !text-white sm:text-[54px]">Your PF and NPS, <span className="text-amber-400">sorted</span> without the runaround.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-100">Know what you can withdraw, fix a rejected claim, move PF after a job change, and plan your pension and NPS exit. Every answer comes from current EPFO and PFRDA rules, with the source shown.</p>
            <div className="mt-8 max-w-xl"><SearchBox size="lg" /></div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-brand-100/80">People ask:</span>
              {POPULAR.map((p) => <Link key={p.slug} to={`/answers/${p.slug}`} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[13px] font-medium text-white no-underline transition hover:bg-white/20">{p.label}</Link>)}
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-100">
              {["Free, no login", "We never ask for your UAN password or OTP", "Source shown on every answer"].map((t) => <li key={t} className="flex items-center gap-1.5"><BadgeCheck className="size-4 text-emerald-400" aria-hidden />{t}</li>)}
            </ul>
          </div>
          <HeroPreview />
        </Container>
      </section>

      <section className="relative z-10 -mt-16">
        <Container>
          <div className="grid gap-3 rounded-2xl border border-line bg-white p-3 shadow-[0_20px_40px_-20px_rgba(10,31,77,0.35)] sm:grid-cols-2 lg:grid-cols-4">
            {QUICK.map((q, i) => (
              <Link key={q.to} to={q.to} className="group flex items-center gap-3 rounded-xl p-4 no-underline transition hover:bg-canvas">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${TINT[i]}`}><q.icon className="size-5" aria-hidden /></span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold leading-snug text-ink">{q.title}</span>
                  <span className="block text-[13px] text-muted">{q.sub}</span>
                </span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-line bg-white p-6">
                <p className="num text-4xl font-extrabold tracking-tight text-brand-600">{s.n}</p>
                <p className="mt-2 font-bold text-ink">{s.t}</p>
                <p className="mt-1 text-sm text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="tools" className="scroll-mt-24 border-y border-line bg-canvas py-16 sm:py-20">
        <Container>
          <SectionTitle title="Every PF and NPS job, in one place" intro="Free tools for the tasks people actually get stuck on. Each one shows the rules it uses." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t, i) => (
              <Link key={t.to} to={t.to} className="group flex gap-4 rounded-2xl border border-line bg-white p-5 no-underline transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_14px_28px_-16px_rgba(10,31,77,0.35)]">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${TINT[i % TINT.length]}`}><t.icon className="size-5" aria-hidden /></span>
                <span>
                  <span className="block text-[16px] font-bold text-ink">{t.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{t.body}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">Open <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden /></span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionTitle title="Start with where you are" intro="What matters about your PF and NPS changes with every decade of your career. Pick yours for the three things to do now." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LIFE_STAGES.map((s, i) => (
              <Link key={s.slug} to={`/start/${s.slug}`} className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 no-underline transition hover:border-brand-200 hover:shadow-[0_14px_28px_-16px_rgba(10,31,77,0.35)]">
                <span className={`absolute inset-x-0 top-0 h-1 ${["bg-brand-500", "bg-amber-400", "bg-emerald-500", "bg-violet-500"][i % 4]}`} aria-hidden />
                <span className="text-4xl font-extrabold tracking-tight text-ink">{s.age}</span>
                <span className="mt-3 text-[17px] font-bold text-ink">{s.title}</span>
                <span className="mt-1 text-sm text-muted">{s.short}</span>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">See your plan <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden /></span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-brand-900 text-white">
        <Container className="flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-amber-400">Come back once a month</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight !text-white">Your monthly PF check-up takes two minutes.</h2>
            <p className="mt-2 text-brand-100">Log your passbook balance, catch a missed employer deposit early, and see which rules changed since your last visit.</p>
          </div>
          <ButtonLink to="/monthly" className="shrink-0 !bg-amber-400 px-6 py-3 text-base !text-brand-900 hover:!bg-amber-300">Start this month's check-up</ButtonLink>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionTitle title="Rules change often. We keep up." intro="The most recent changes. Each tool shows exactly which rules it uses."
            action={<Link to="/rules" className="text-sm font-semibold text-brand-600 no-underline hover:underline">All rule updates →</Link>} />
          <div className="grid gap-4 md:grid-cols-3">
            {latest.map((r) => (
              <Link key={r.id} to={`/rules#${r.id}`} className="flex flex-col rounded-2xl border border-line bg-white p-6 no-underline transition hover:border-brand-200 hover:shadow-[0_14px_28px_-16px_rgba(10,31,77,0.35)]">
                <div className="flex items-center gap-2"><AreaBadge area={r.area} /><StatusBadge status={r.status} /></div>
                <p className="mt-3 text-[16px] font-bold text-ink">{r.title}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{r.summary}</p>
                <p className="mt-auto pt-4 text-[13px] font-medium text-body">{r.source}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-canvas py-14">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-xl font-bold text-white" aria-hidden>{FOUNDER.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
          <div className="max-w-3xl">
            <p className="text-lg font-bold text-ink">Built and reviewed by {FOUNDER.name}</p>
            <p className="mt-1 text-sm font-semibold text-brand-700">{FOUNDER.credentials.join(" · ")}</p>
            <p className="mt-2 text-body">{FOUNDER.bio} Every answer shows when it was last checked, and anyone can report an error.</p>
          </div>
          <Link to="/about" className="shrink-0 text-sm font-semibold text-brand-600 no-underline hover:underline md:ml-auto">About us →</Link>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-bold sm:text-[30px]">Common questions</h2>
            <p className="mt-2 text-muted">More in the <Link to="/answers" className="font-semibold text-brand-600">answers library</Link>, and the <Link to="/glossary" className="font-semibold text-brand-600">glossary</Link> explains the jargon.</p>
          </div>
          <div className="divide-y divide-line rounded-2xl border border-line bg-white px-6">
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
    </>
  );
}
