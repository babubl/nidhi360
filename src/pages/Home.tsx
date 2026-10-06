import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, FileText, FileWarning, HeartPulse, Landmark, PiggyBank, Repeat, Scale, Wallet } from "lucide-react";
import { ButtonLink, Container } from "../components/ui";
import SearchBox from "../components/SearchBox";
import { FOUNDER } from "../data/team";
import { LIFE_STAGES } from "../data/lifestages";
import { RULES_CHECKED_ON } from "../data/rules";
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
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between text-[13px]">
          <p className="font-medium text-ivory/60">Medical withdrawal · balance {inr(420000)}</p>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-ivory/60">Example</span>
        </div>
        <p className="mt-8 text-[15px] text-ivory/60">You can withdraw</p>
        <p className="num text-[56px] font-semibold leading-none tracking-[-0.04em] text-ivory">{inr(r.amount)}</p>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gold" style={{ width: "75%" }} />
        </div>
        <dl className="mt-6 space-y-3 text-[15px]">
          <div className="flex justify-between"><dt className="text-ivory/55">Stays invested</dt><dd className="num font-medium text-ivory">{inr(r.remains)}</dd></div>
          <div className="flex justify-between"><dt className="text-ivory/55">Tax</dt><dd className="font-medium text-ivory">None</dd></div>
          <div className="flex justify-between"><dt className="text-ivory/55">Approval</dt><dd className="font-medium text-gold">Automatic, with full KYC</dd></div>
        </dl>
      </div>
    </div>
  );
}

const QUICK = [
  { to: "/pf/health-check", icon: HeartPulse, title: "Check my PF account" },
  { to: "/pf/claim-rejected", icon: FileWarning, title: "My claim was rejected" },
  { to: "/pf/withdraw", icon: Wallet, title: "How much can I withdraw?" },
  { to: "/pf/job-change", icon: Repeat, title: "I changed jobs" },
];

export default function Home() {
  const card = "rounded-3xl bg-white no-underline ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(13,13,15,0.4)]";
  return (
    <>
      <section className="relative overflow-hidden bg-night text-ivory">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,106,0.16),transparent_55%)]" aria-hidden />
        <Container className="relative grid items-center gap-16 pb-16 pt-20 sm:pt-28 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-[52px] leading-[0.98] tracking-[-0.045em] !text-ivory sm:text-[84px]">PF and NPS.<br /><span className="text-gold">Finally clear.</span></h1>
            <p className="mt-8 max-w-lg text-[19px] leading-relaxed text-ivory/65">Withdraw, transfer, fix a rejected claim and plan your pension. Every answer comes with the official rule behind it.</p>
            <div className="mt-10 max-w-xl"><SearchBox size="lg" /></div>
            <div className="mt-5 flex flex-wrap gap-2">
              {POPULAR.map((p) => <Link key={p.slug} to={`/answers/${p.slug}`} className="rounded-full bg-white/[0.07] px-3.5 py-1.5 text-[13px] text-ivory/75 no-underline transition hover:bg-white/15 hover:text-ivory">{p.label}</Link>)}
            </div>
          </div>
          <HeroPreview />
        </Container>
        <Container className="relative pb-20">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK.map((q) => (
              <Link key={q.to} to={q.to} className="group flex items-center gap-4 rounded-2xl bg-white/[0.05] p-5 no-underline ring-1 ring-white/10 transition hover:bg-white/[0.09] hover:ring-gold/40">
                <q.icon className="size-6 shrink-0 text-gold" aria-hidden />
                <span className="text-[16px] font-medium text-ivory">{q.title}</span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-ivory/30 transition group-hover:translate-x-0.5 group-hover:text-gold" aria-hidden />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-28 sm:py-36">
        <Container className="max-w-4xl text-center">
          <p className="num text-[96px] font-semibold leading-none tracking-[-0.05em] text-ink sm:text-[148px]">1 in 5</p>
          <h2 className="mt-6 text-[32px] leading-tight sm:text-[48px]">PF claims get rejected.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-[19px] leading-relaxed text-muted">Mostly for things you can fix in two minutes: KYC, bank details, a name that doesn't match. About 174 lakh of 796 lakh claims in 2024-25.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <ButtonLink to="/pf/health-check" className="!rounded-full px-7 py-3.5 text-base">Check my account</ButtonLink>
            <Link to="/pf/claim-rejected" className="text-[16px] font-medium text-brand-600 no-underline hover:underline">Already rejected? Fix it ›</Link>
          </div>
        </Container>
      </section>

      <section id="tools" className="scroll-mt-24 bg-canvas py-24 sm:py-32">
        <Container>
          <h2 className="max-w-2xl text-[36px] leading-[1.05] sm:text-[56px]">Everything you need.<br /><span className="text-muted">Nothing you don't.</span></h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <Link key={t.to} to={t.to} className={`group flex flex-col p-7 ${card}`}>
                <t.icon className="size-7 text-brand-600" aria-hidden />
                <span className="mt-6 block text-[19px] font-semibold tracking-[-0.02em] text-ink">{t.title}</span>
                <span className="mt-2 block text-[15px] leading-relaxed text-muted">{t.body}</span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <h2 className="max-w-2xl text-[36px] leading-[1.05] sm:text-[56px]">Made for every stage<br /><span className="text-muted">of your career.</span></h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LIFE_STAGES.map((s) => (
              <Link key={s.slug} to={`/start/${s.slug}`} className={`group flex flex-col p-7 ${card}`}>
                <span className="text-[64px] font-semibold leading-none tracking-[-0.05em] text-ink">{s.age}</span>
                <span className="mt-6 text-[17px] font-semibold text-ink">{s.title}</span>
                <span className="mt-1 text-[15px] text-muted">{s.short}</span>
                <span className="mt-6 text-[15px] font-medium text-brand-600">See your plan ›</span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-night text-ivory">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(201,168,106,0.18),transparent_60%)]" aria-hidden />
        <Container className="relative max-w-3xl py-28 text-center sm:py-36">
          <h2 className="text-[40px] leading-[1.02] !text-ivory sm:text-[64px]">Two minutes.<br /><span className="text-gold">Once a month.</span></h2>
          <p className="mx-auto mt-6 max-w-xl text-[19px] leading-relaxed text-ivory/65">Log your passbook balance. We'll tell you if your employer missed a deposit, and what changed in the rules since you were last here.</p>
          <ButtonLink to="/monthly" variant="gold" className="mt-10 !rounded-full px-8 py-4 text-base">Start your monthly check-up</ButtonLink>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container className="max-w-3xl text-center">
          <h2 className="text-[32px] leading-tight sm:text-[44px]">No login. No OTP. No commissions.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-[19px] leading-relaxed text-muted">Just the rules, explained, with the source for every one. Built and reviewed by {FOUNDER.name}, {FOUNDER.credentials[0]}. Rules last verified {fmtDate(RULES_CHECKED_ON)}.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[16px] font-medium">
            <Link to="/about" className="text-brand-600 no-underline hover:underline">About us ›</Link>
            <Link to="/rules" className="text-brand-600 no-underline hover:underline">See every rule and source ›</Link>
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-24 sm:py-28">
        <Container className="max-w-3xl">
          <h2 className="text-[32px] leading-tight sm:text-[44px]">Questions.</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[18px] font-medium tracking-[-0.01em] text-ink">
                  {f.q}<span className="text-2xl font-light text-muted transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[16px] leading-relaxed text-body">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-[16px] text-muted">More in the <Link to="/answers" className="font-medium text-brand-600">answers library ›</Link></p>
        </Container>
      </section>
    </>
  );
}
