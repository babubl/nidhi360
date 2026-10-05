import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Callout, Cites, Container } from "../components/ui";
import { PageHero } from "../components/ToolPage";

type Col = "epf" | "vpf" | "ppf" | "nps";
const COLS: { id: Col; name: string; tag: string }[] = [
  { id: "epf", name: "EPF", tag: "Compulsory, through your employer" },
  { id: "vpf", name: "VPF", tag: "Extra PF you choose to add" },
  { id: "ppf", name: "PPF", tag: "Open to any resident" },
  { id: "nps", name: "NPS", tag: "Market-linked pension" },
];

const ROWS: { label: string; cells: Record<Col, string>; note?: string }[] = [
  { label: "Return now", cells: { epf: "8.25% (FY 2025-26), declared yearly", vpf: "Same as EPF: 8.25%", ppf: "7.1% (Oct–Dec 2026), set quarterly", nps: "Market-linked; no guarantee" } },
  { label: "Who can invest", cells: { epf: "Employees in PF-covered establishments", vpf: "Existing EPF members, through payroll", ppf: "Any resident individual", nps: "Indian citizens 18 and above; employer may contribute" } },
  { label: "How much", cells: { epf: "12% of basic + DA, matched by employer (part goes to EPS)", vpf: "Any amount above 12%, up to 100% of basic + DA; no employer match", ppf: "₹500 to ₹1.5 lakh a year", nps: "Any amount; employer can add up to 14% (new regime)" } },
  { label: "Tax on what you put in", cells: { epf: "80C (old regime only)", vpf: "80C (old regime only)", ppf: "80C (old regime only)", nps: "Old regime: 80C + extra ₹50,000. Both regimes: employer share up to 10–14%" } },
  { label: "Tax on returns", cells: { epf: "Tax-free, except interest on your contributions above ₹2.5 lakh a year", vpf: "Counts toward the same ₹2.5 lakh limit", ppf: "Fully tax-free", nps: "60% lump sum tax-free; annuity income taxed at slab" } },
  { label: "When you can take money out", cells: { epf: "Partial after 12 months of membership (25% stays in); full after 12 months without a job or at 55+", vpf: "Same as EPF", ppf: "Matures in 15 years; partial withdrawals from year 7; loans from year 3", nps: "25% of own contributions after 3 years (up to 4 times before 60); exit at 60 or after 15 years (private)" } },
  { label: "What you get at the end", cells: { epf: "Full lump sum", vpf: "Full lump sum", ppf: "Full lump sum, or extend in 5-year blocks", nps: "Up to 80% lump sum, at least 20% as pension (private sector)" } },
  { label: "Often suits", cells: { epf: "Everyone eligible: it's compulsory and the employer adds to it", vpf: "Salaried people wanting more guaranteed, tax-free growth", ppf: "Self-employed, or a family member without EPF; long-term safe money", nps: "Long horizons, people comfortable with equity, and new-regime employees via employer NPS" } },
];

export default function Compare() {
  return (
    <>
      <PageHero crumb={{ to: "/#tools", label: "Tools" }} title="EPF, VPF, PPF or NPS: how they compare"
        intro="The four long-term savings options salaried people ask about most, side by side: what they pay, how they're taxed, and when you can get your money." />
      <Container className="py-10">
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[760px] border-collapse text-left text-[14.5px]">
            <caption className="sr-only">Comparison of EPF, VPF, PPF and NPS</caption>
            <thead>
              <tr className="bg-canvas">
                <th scope="col" className="w-40 border-b border-line p-4 text-sm font-semibold text-muted">Feature</th>
                {COLS.map((c) => (
                  <th key={c.id} scope="col" className="border-b border-l border-line p-4 align-top">
                    <span className="block text-lg font-bold text-ink">{c.name}</span>
                    <span className="block text-[13px] font-normal text-muted">{c.tag}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="align-top">
                  <th scope="row" className="border-b border-line p-4 text-sm font-semibold text-ink">{r.label}</th>
                  {COLS.map((c) => <td key={c.id} className="border-b border-l border-line p-4 text-body">{r.cells[c.id]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Callout title="A common order of priority">
            <p>Many salaried people first take the full employer match through EPF, then use employer NPS if they're in the new regime, and only then add VPF or PPF for extra safe savings. Your situation, tax regime and time horizon matter more than any rule of thumb.</p>
          </Callout>
          <Callout tone="warn" title="This is a comparison, not advice">
            <p>Rates change: EPF yearly, PPF every quarter, and NPS with markets. For a plan built around your situation, speak to a SEBI-registered investment adviser.</p>
          </Callout>
        </div>
        <p className="mt-6 text-sm text-muted">
          Rules used: <Cites ids={["R11", "R25", "R2", "R3", "R4", "R15", "R19", "R21", "R22"]} />
          {" · "}PPF rate: <a href="https://www.business-standard.com/finance/personal-finance/ppf-rate-unchanged-at-7-1-what-investors-need-to-know-this-quarter-126100200411_1.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-700">Finance Ministry, 30 Sep 2026<ExternalLink className="size-3" /></a>
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-[15px]">
          <Link to="/nps/tax" className="font-semibold text-brand-600">See your NPS tax saving →</Link>
          <Link to="/answers/vpf" className="font-semibold text-brand-600">More on VPF →</Link>
          <Link to="/nps/retirement" className="font-semibold text-brand-600">Project your NPS corpus →</Link>
        </div>
      </Container>
    </>
  );
}
