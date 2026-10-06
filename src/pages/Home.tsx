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
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-7 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold">Withdrawal estimate</p>
          <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] font-medium text-ivory/60">Example</span>
        </div>
        <p className="mt-2 text-[13px] text-ivory/55">Medical treatment · PF balance {inr(420000)}</p>
        <p className="mt-6 text-sm text-ivory/60">You can withdraw</p>
        <p className="num font-display text-[46px] font-semibold leading-none tracking-tight text-ivory">{inr(r.amount)}</p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light" style={{ width: "75%" }} />
        </div>
        <dl className="mt-5 space-y-2.5 text-sm">
          <div className="flex justify-between"><dt className="text-ivory/55">Stays in your account</dt><dd className="num font-semibold text-ivory">{inr(r.remains)}</dd></div>
          <div className="flex justify-between"><dt className="text-ivory/55">Tax</dt><dd className="font-semibold text-ivory">None</dd></div>
          <div className="flex justify-between"><dt className="text-ivory/55">Form</dt><dd className="font-semibold text-ivory">Form 31, online</dd></div>
        </dl>
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/10 px-3.5 py-2.5 text-[13px] text-gold-light">
          <BadgeCheck className="size-4 shrink-0 text-gold" aria-hidden />
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

export default function Home() {
  const latest = rulesByRecency().slice(0, 3);
  const card = "rounded-2xl border border-line bg-white no-underline transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_24px_48px_-28px_rgba(13,13,15,0.45)]";
  return (
    <>
      <section className="relative overflow-hidden bg-night text-ivory">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,106,0.18),transparent_55%)]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(242,239,233,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(242,239,233,.6)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" aria-hidden />
        <Container className="relative grid items-center gap-14 pb-14 pt-16 sm:pt-24 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-7 inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="h-px w-8 bg-gold" aria-hidden />Updated for the EPF Scheme 2026
            </p>
            <h1 className="text-[44px] leading-[1.02] !text-ivory sm:text-[72px]">Your PF and NPS, <em className="font-display italic text-gold">finally</em> clear.</h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ivory/70">Withdrawals, rejected claims, job changes, pension and NPS exit, explained from the current EPFO and PFRDA rules, with the source behind every answer.</p>
            <div className="mt-10 max-w-xl"><SearchBox size="lg" /></div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-ivory/50">Popular:</span>
              {POPULAR.map((p) => <Link key={p.slug} to={`/answers/${p.slug}`} className="rounded-full border border-white/15 px-3.5 py-1 text-[13px] text-ivory/80 no-underline transition hover:border-gold/60 hover:text-ivory">{p.label}</Link>)}
            </div>
          </div>
          <HeroPreview />
        </Container>
        <Container className="relative pb-16">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK.map((q) => (
              <Link key={q.to} to={q.to} className="group flex items-center gap-4 bg-night p-5 no-underline transition-colors hover:bg-night-2">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold"><q.icon className="size-5" aria-hidden /></span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold leading-snug text-ivory">{q.title}</span>
                  <span className="block text-[13px] text-ivory/50">{q.sub}</span>
                </span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-ivory/40 transition group-hover:translate-x-0.5 group-hover:text-gold" aria-hidden />
              </Link>
            ))}
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[13px] text-ivory/55">
            {["Free, no login", "We never ask for your UAN password or OTP", "Independent of EPFO and PFRDA", `Rules verified ${fmtDate(RULES_CHECKED_ON)}`].map((t) => <li key={t} className="flex items-center gap-2"><span className="size-1 rounded-full bg-gold" aria-hidden />{t}</li>)}
          </ul>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-brand-600">Why this matters</p>
          <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line">
            {STATS.map((s) => (
              <div key={s.n} className="md:px-8 md:first:pl-0 md:last:pr-0">
                <p className="num font-display text-[56px] font-semibold leading-none tracking-tight text-ink">{s.n}</p>
                <p className="mt-4 font-semibold text-ink">{s.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="tools" className="scroll-mt-24 border-y border-line bg-canvas py-20 sm:py-24">
        <Container>
          <SectionTitle title="Every PF and NPS task, in one place" intro="Free tools for the jobs people actually get stuck on. Each one shows the rules it uses." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <Link key={t.to} to={t.to} className={`group flex flex-col p-6 ${card}`}>
                <span className="flex size-11 items-center justify-center rounded-xl bg-night text-gold"><t.icon className="size-5" aria-hidden /></span>
                <span className="mt-5 block text-[17px] font-semibold text-ink">{t.title}</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted">{t.body}</span>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">Open <ArrowRight className="size-4 text-brand-600 transition group-hover:translate-x-1" aria-hidden /></span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionTitle title="Start with where you are in life" intro="What matters about your PF and NPS changes with every decade of your career. Pick yours for the three things to do now." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LIFE_STAGES.map((s) => (
              <Link key={s.slug} to={`/start/${s.slug}`} className={`group relative flex flex-col overflow-hidden p-6 ${card}`}>
                <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
                <span className="font-display text-[52px] font-semibold leading-none tracking-tight text-ink">{s.age}</span>
                <span className="mt-4 text-[17px] font-semibold text-ink">{s.title}</span>
                <span className="mt-1 text-sm text-muted">{s.short}</span>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">See your plan <ArrowRight className="size-4 text-brand-600 transition group-hover:translate-x-1" aria-hidden /></span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-night text-ivory">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(201,168,106,0.16),transparent_60%)]" aria-hidden />
        <Container className="relative flex flex-col items-start gap-8 py-20 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold">Once a month · two minutes</p>
            <h2 className="mt-4 text-[34px] leading-tight !text-ivory sm:text-[46px]">Catch a missed PF deposit <em className="italic text-gold">before</em> it becomes a problem.</h2>
            <p className="mt-4 text-ivory/65">Log your passbook balance, see whether your employer's deposit arrived, and see which rules changed since your last visit.</p>
          </div>
          <ButtonLink to="/monthly" variant="gold" className="shrink-0 rounded-full px-7 py-3.5 text-base">Start this month's check-up</ButtonLink>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionTitle title="Rules change often. We keep up." intro="The most recent changes. Each tool shows exactly which rules it uses."
            action={<Link to="/rules" className="text-sm font-semibold text-ink no-underline hover:underline">All rule updates →</Link>} />
          <div className="grid gap-4 md:grid-cols-3">
            {latest.map((r) => (
              <Link key={r.id} to={`/rules#${r.id}`} className={`flex flex-col p-6 ${card}`}>
                <div className="flex items-center gap-2"><AreaBadge area={r.area} /><StatusBadge status={r.status} /></div>
                <p className="mt-4 text-[17px] font-semibold text-ink">{r.title}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{r.summary}</p>
                <p className="mt-auto pt-5 text-[12px] font-medium uppercase tracking-wide text-brand-600">{r.source}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-canvas py-16">
        <Container className="flex flex-col items-start gap-8 md:flex-row md:items-center">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-night font-display text-2xl font-semibold text-gold ring-1 ring-gold/40 ring-offset-4 ring-offset-canvas" aria-hidden>{FOUNDER.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
          <div className="max-w-3xl">
            <p className="font-display text-[24px] font-semibold text-ink">Built and reviewed by {FOUNDER.name}</p>
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-600">{FOUNDER.credentials.join(" · ")}</p>
            <p className="mt-3 text-body">{FOUNDER.bio} Every answer shows when it was last checked, and anyone can report an error.</p>
          </div>
          <Link to="/about" className="shrink-0 text-sm font-semibold text-ink no-underline hover:underline md:ml-auto">About us →</Link>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-[32px] leading-tight sm:text-[40px]">Common questions</h2>
            <p className="mt-3 text-muted">More in the <Link to="/answers" className="font-semibold text-ink">answers library</Link>, and the <Link to="/glossary" className="font-semibold text-ink">glossary</Link> explains the jargon.</p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold text-ink">
                  {f.q}<span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line text-lg text-muted transition group-open:rotate-45 group-open:border-gold group-open:text-brand-600">+</span>
                </summary>
                <p className="mt-3 text-body">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
