import { BarChart3, Building2, Clock, Headset, ShieldCheck, Users } from "lucide-react";
import { ButtonLink, Container, SectionTitle } from "../components/ui";
import { PageHero } from "../components/ToolPage";
import { config } from "../config";

const POINTS = [
  { icon: Headset, title: "Fewer PF tickets to HR", body: "Employees self-serve transfers, withdrawals, KYC fixes and rejected claims, with steps specific to their situation." },
  { icon: Clock, title: "Faster onboarding and exits", body: "New joiners link their existing UAN and transfer old PF in week one. Leavers know their EPS and withdrawal options." },
  { icon: ShieldCheck, title: "Always on current rules", body: "We track EPFO, PFRDA and tax changes so your HR team doesn't have to. Every answer cites its source." },
  { icon: BarChart3, title: "See where employees get stuck", body: "Anonymous, aggregate insights: common rejection reasons, KYC gaps, NPS adoption. No personal data." },
  { icon: Users, title: "NPS that employees understand", body: "Show staff what employer NPS saves them in the new regime, and drive opt-ins for flexible benefits." },
  { icon: Building2, title: "Your brand, your benefits", body: "White-label the tools inside your HRMS or intranet, alongside your own PF trust or benefits policy." },
];

export default function Employers() {
  const mail = config.contactEmail ? `mailto:${config.contactEmail}?subject=${encodeURIComponent("Nidhi360 for our employees")}` : "/about";
  return (
    <>
      <PageHero title="PF and NPS support for your whole workforce" intro="PF transfers, rejected claims and NPS questions take up a large share of HR's time. Nidhi360 gives every employee clear, current answers, and gives HR the time back.">
        <div className="mt-7 flex flex-wrap gap-3">
          {config.contactEmail
            ? <a href={mail} className="inline-flex items-center rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white no-underline hover:bg-brand-700">Talk to us</a>
            : <ButtonLink to="/pf/health-check">See the employee experience</ButtonLink>}
        </div>
      </PageHero>
      <Container className="py-14">
        <div className="mb-14 grid gap-6 rounded-2xl border border-line bg-canvas p-6 sm:grid-cols-3 sm:p-8">
          {[
            ["1 in 5", "PF claims rejected in FY 2024-25, mostly for KYC, bank and record errors HR can prevent at onboarding"],
            ["11 lakh vs 22,000", "employers run PF; only about 22,000 offer NPS, though employer NPS is the main tax break left in the new regime"],
            ["17 Sep 2026", "the ₹25,000 wage ceiling took effect, changing PF and EPS deductions for a large part of the workforce"],
          ].map(([n, t]) => (
            <div key={n}><p className="num text-2xl font-extrabold text-brand-600">{n}</p><p className="mt-1 text-sm text-body">{t}</p></div>
          ))}
        </div>
        <SectionTitle title="What your team gets" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title}>
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><p.icon className="size-5" aria-hidden /></span>
              <h3 className="mt-4 text-[17px] font-bold">{p.title}</h3>
              <p className="mt-1.5 text-body">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 rounded-2xl border border-line p-6 sm:p-8">
          <h2 className="text-2xl font-bold">For payroll and HRMS platforms</h2>
          <p className="mt-2 max-w-2xl text-body">Put PF and NPS help where employees already see their payslips. Every Nidhi360 page can be embedded without our header and footer, and the rules engine and calculators are built as standalone modules ready for an API.</p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-canvas p-4 text-[13px] text-ink"><code>{`<iframe src="https://babubl.github.io/nidhi360/pf/withdraw?embed=1"
        width="100%" height="900" style="border:0"></iframe>`}</code></pre>
          <p className="mt-3 text-sm text-muted">Works with any page: answers, PF check, withdrawal, pension, NPS planners, complaint drafter.</p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-bold">Start with a 60-day pilot</h2>
            <p className="mt-2 text-body">No integration needed to begin. We measure the result in fewer PF tickets and fewer rejected claims.</p>
          </div>
          <ol className="space-y-4">
            {[
              ["Week 1", "Share a co-branded link with employees. New joiners run the PF account check and link their existing UAN."],
              ["Weeks 2–8", "Employees self-serve transfers, withdrawals, rejected claims and NPS questions. HR gets a monthly summary of common issues, with no personal data."],
              ["Day 60", "Review ticket volume and claim outcomes with you, then decide on HRMS integration and white-labelling."],
            ].map(([w, t]) => (
              <li key={w} className="flex gap-4 rounded-xl border border-line p-4"><span className="w-20 shrink-0 text-sm font-bold text-brand-600">{w}</span><span className="text-body">{t}</span></li>
            ))}
          </ol>
        </div>
      </Container>
    </>
  );
}
