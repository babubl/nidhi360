import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { Container, cx } from "./ui";
import { RULES_CHECKED_ON } from "../data/rules";
import { fmtDate } from "../lib/format";
import { aiEnabled } from "../config";

export const PF_TOOLS = [
  { to: "/pf/health-check", label: "PF account check", desc: "Find what will block your next claim" },
  { to: "/pf/claim-rejected", label: "Claim rejected", desc: "Understand the reason and fix it" },
  { to: "/pf/job-change", label: "Job change & transfer", desc: "Move old PF, merge UANs" },
  { to: "/pf/withdraw", label: "Withdrawal estimate", desc: "How much you can take, and the tax" },
  { to: "/pf/pension", label: "EPS pension estimate", desc: "Your monthly pension and when to start" },
];
export const NPS_TOOLS = [
  { to: "/nps/tax", label: "NPS tax savings", desc: "Old vs new regime, employer contribution" },
  { to: "/nps/retirement", label: "NPS retirement & exit", desc: "Corpus, lump sum, annuity, tax" },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-ink no-underline" aria-label="Nidhi360 home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden><rect width="32" height="32" rx="8" fill="#0B5D4B" /><path d="M9 23V9h3l8 9.5V9h3v14h-3l-8-9.5V23z" fill="#fff" /></svg>
      <span className="text-[19px] font-extrabold tracking-tight">Nidhi<span className="text-brand-600">360</span></span>
    </Link>
  );
}

function Dropdown({ label, items, active }: { label: string; items: typeof PF_TOOLS; active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className={cx("flex items-center gap-1 rounded-md px-3 py-2 text-[15px] font-semibold", active ? "text-ink" : "text-body hover:text-ink")}>
        {label}<ChevronDown className={cx("size-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-xl border border-line bg-white p-2 shadow-lg">
          {items.map((i) => (
            <Link key={i.to} to={i.to} className="block rounded-lg px-3 py-2.5 no-underline hover:bg-canvas">
              <span className="block text-[15px] font-semibold text-ink">{i.label}</span>
              <span className="block text-[13px] text-muted">{i.desc}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  const navCls = ({ isActive }: { isActive: boolean }) => cx("rounded-md px-3 py-2 text-[15px] font-semibold no-underline", isActive ? "text-ink" : "text-body hover:text-ink");
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <Dropdown label="PF" items={PF_TOOLS} active={loc.pathname.startsWith("/pf")} />
          <Dropdown label="NPS" items={NPS_TOOLS} active={loc.pathname.startsWith("/nps")} />
          <NavLink to="/rules" className={navCls}>Rule updates</NavLink>
          <NavLink to="/glossary" className={navCls}>Glossary</NavLink>
          <NavLink to="/employers" className={navCls}>For employers</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {aiEnabled && <Link to="/ask" className="hidden rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-brand-700 sm:inline-flex">Ask a question</Link>}
          <button className="rounded-md p-2 text-ink lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </Container>
      {open && (
        <nav className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-white lg:hidden" aria-label="Mobile">
          <Container className="py-4">
            <p className="px-1 pb-1 text-xs font-semibold text-muted">PF tools</p>
            {PF_TOOLS.map((i) => <Link key={i.to} to={i.to} className="block rounded-lg px-1 py-2.5 text-[16px] font-semibold text-ink no-underline">{i.label}</Link>)}
            <p className="mt-3 px-1 pb-1 text-xs font-semibold text-muted">NPS tools</p>
            {NPS_TOOLS.map((i) => <Link key={i.to} to={i.to} className="block rounded-lg px-1 py-2.5 text-[16px] font-semibold text-ink no-underline">{i.label}</Link>)}
            <div className="mt-3 border-t border-line pt-3">
              {[["/rules", "Rule updates"], ["/glossary", "Glossary"], ["/employers", "For employers"], ...(aiEnabled ? [["/ask", "Ask a question"]] : [])].map(([to, l]) => (
                <Link key={to} to={to} className="block rounded-lg px-1 py-2.5 text-[16px] font-semibold text-ink no-underline">{l}</Link>
              ))}
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-canvas">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-muted">Clear, current answers on PF and NPS for salaried India. Rules last verified on {fmtDate(RULES_CHECKED_ON)}.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">PF</p>
          <ul className="mt-3 space-y-2 text-sm">{PF_TOOLS.map((i) => <li key={i.to}><Link className="text-muted no-underline hover:text-ink" to={i.to}>{i.label}</Link></li>)}</ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">NPS</p>
          <ul className="mt-3 space-y-2 text-sm">{NPS_TOOLS.map((i) => <li key={i.to}><Link className="text-muted no-underline hover:text-ink" to={i.to}>{i.label}</Link></li>)}</ul>
          <p className="mt-6 text-sm font-semibold text-ink">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="text-muted no-underline hover:text-ink" to="/about">How we work</Link></li>
            <li><Link className="text-muted no-underline hover:text-ink" to="/employers">For employers</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Official portals</p>
          <ul className="mt-3 space-y-2 text-sm">
            {[["https://unifiedportal-mem.epfindia.gov.in", "EPFO member portal"], ["https://epfigms.gov.in", "EPFiGMS grievances"], ["https://www.npstrust.org.in", "NPS Trust"], ["https://www.pfrda.org.in", "PFRDA"], ["https://www.incometax.gov.in", "Income Tax"]].map(([h, l]) => (
              <li key={h}><a className="text-muted no-underline hover:text-ink" href={h} target="_blank" rel="noopener noreferrer">{l}</a></li>
            ))}
          </ul>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="py-6 text-[13px] leading-relaxed text-muted">
          Nidhi360 is an independent information service. It is not affiliated with EPFO, PFRDA, the Income Tax Department or any government body, and it does not provide investment, tax or legal advice. Always confirm on the official portal before filing. We never ask for your UAN password, OTP, PRAN login or bank details. © {new Date().getFullYear()} Nidhi360.
        </Container>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <Header />
      <main id="main" className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
