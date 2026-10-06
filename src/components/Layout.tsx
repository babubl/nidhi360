import { Suspense, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { Container, cx } from "./ui";
import { RULES_CHECKED_ON } from "../data/rules";
import { fmtDate } from "../lib/format";
import { aiEnabled } from "../config";
import { NPS_TOOLS, PF_TOOLS } from "../data/tools";
import SearchBox from "./SearchBox";
import Head from "./Head";
import ChatWidget from "./ChatWidget";

const DIAL = "M16.00 4.10L16.00 2.00M18.22 3.39L18.43 2.21M20.38 3.97L20.79 2.84M22.40 4.91L23.00 3.88M24.23 6.19L25.00 5.28M25.81 7.77L26.72 7.00M27.09 9.60L28.12 9.00M28.03 11.62L29.16 11.21M28.61 13.78L29.79 13.57M27.90 16.00L30.00 16.00M28.61 18.22L29.79 18.43M28.03 20.38L29.16 20.79M27.09 22.40L28.12 23.00M25.81 24.23L26.72 25.00M24.23 25.81L25.00 26.72M22.40 27.09L23.00 28.12M20.38 28.03L20.79 29.16M18.22 28.61L18.43 29.79M16.00 27.90L16.00 30.00M13.78 28.61L13.57 29.79M11.62 28.03L11.21 29.16M9.60 27.09L9.00 28.12M7.77 25.81L7.00 26.72M6.19 24.23L5.28 25.00M4.91 22.40L3.88 23.00M3.97 20.38L2.84 20.79M3.39 18.22L2.21 18.43M4.10 16.00L2.00 16.00M3.39 13.78L2.21 13.57M3.97 11.62L2.84 11.21M4.91 9.60L3.88 9.00M6.19 7.77L5.28 7.00M7.77 6.19L7.00 5.28M9.60 4.91L9.00 3.88M11.62 3.97L11.21 2.84M13.78 3.39L13.57 2.21";
const N_PATH = "M10.3 10.2h3.2l7.1 10.05V11h-1.4v-.8h3.9v.8h-1.4v10.8h-1.6L11.4 12.4V21h1.4v.8H8.9V21h1.4V11H8.9v-.8z";

/** The Nidhi360 mark: a gold serif N inside a 360-tick bezel, like a watch dial or a coin. */
export function LogoMark({ className = "size-9", simple = false }: { className?: string; simple?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#0D0D0F" />
      <circle cx="16" cy="16" r="12" fill="none" stroke="#C9A86A" strokeWidth={simple ? 0.9 : 0.5} />
      {!simple && <path d={DIAL} stroke="#C9A86A" strokeWidth=".45" />}
      <path d={N_PATH} fill="#C9A86A" />
    </svg>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className={`group flex shrink-0 cursor-pointer items-center gap-3 rounded-lg no-underline ${dark ? "text-ivory" : "text-ink"}`} aria-label="Nidhi360 home" title="Nidhi360 home">
      <LogoMark className={`size-10 transition-transform duration-500 group-hover:rotate-[30deg] ${dark ? "ring-1 ring-gold/30 rounded-[9px]" : ""}`} />
      <span className="flex items-baseline gap-1">
        <span className="font-display text-[23px] font-semibold tracking-tight">Nidhi</span>
        <span className="text-[13px] font-semibold tracking-[0.18em] text-gold">360</span>
      </span>
    </Link>
  );
}

function Dropdown({ label, items, active }: { label: string; items: { to: string; label: string; desc: string }[]; active: boolean }) {
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
        className={cx("flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-[14.5px] font-medium transition-colors", active ? "text-gold" : "text-ivory/75 hover:text-ivory")}>
        {label}<ChevronDown className={cx("size-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-3 w-80 rounded-2xl border border-line bg-white p-2 shadow-[0_24px_48px_-16px_rgba(13,13,15,0.45)]">
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
  const isHome = loc.pathname === "/";
  const navCls = ({ isActive }: { isActive: boolean }) => cx("whitespace-nowrap rounded-md px-3 py-2 text-[14.5px] font-medium no-underline transition-colors", isActive ? "text-gold" : "text-ivory/75 hover:text-ivory");
  return (
    <header className="sticky top-0 z-40 bg-night/95 shadow-[0_1px_0_0_rgba(201,168,106,0.18)] backdrop-blur">
      <div className="hidden border-b border-white/5 bg-black text-[12px] tracking-wide text-ivory/55 sm:block">
        <Container className="flex h-8 items-center justify-between">
          <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-gold" aria-hidden />Independent PF and NPS guidance · Rules verified {fmtDate(RULES_CHECKED_ON)}</span>
          <span className="flex items-center gap-5">
            <Link to="/glossary" className="text-ivory/55 no-underline hover:text-ivory">Glossary</Link>
            <Link to="/site-map" className="text-ivory/55 no-underline hover:text-ivory">Site map</Link>
            <a href="https://unifiedportal-mem.epfindia.gov.in" target="_blank" rel="noopener noreferrer" className="text-ivory/55 no-underline hover:text-ivory">EPFO portal ↗</a>
          </span>
        </Container>
      </div>
      <Container className="flex h-[72px] items-center gap-6">
        <Logo dark />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <Dropdown label="PF" items={PF_TOOLS} active={loc.pathname.startsWith("/pf")} />
          <Dropdown label="NPS" items={NPS_TOOLS} active={loc.pathname.startsWith("/nps")} />
          <NavLink to="/monthly" className={navCls}>Monthly check-up</NavLink>
          <NavLink to="/answers" className={navCls}>Answers</NavLink>
          <NavLink to="/rules" className={navCls}>Rule updates</NavLink>
          <NavLink to="/about" className={navCls}>About</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {!isHome && <div className="hidden w-64 2xl:block"><SearchBox size="sm" placeholder="Search your problem" label="Site search" /></div>}
          <Link to="/answers" aria-label="Search" className="rounded-md p-2 text-ivory 2xl:hidden"><Search className="size-5" /></Link>
          <Link to="/help" className="hidden whitespace-nowrap rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-night no-underline transition-colors hover:bg-gold-light sm:inline-flex">Expert help</Link>
          <button className="rounded-md p-2 text-ivory lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </Container>
      {open && (
        <nav className="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-white/10 bg-night lg:hidden" aria-label="Mobile">
          <Container className="py-4">
            <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-widest text-gold">PF tools</p>
            {PF_TOOLS.map((i) => <Link key={i.to} to={i.to} className="block rounded-lg px-1 py-2.5 text-[16px] font-medium text-ivory no-underline">{i.label}</Link>)}
            <p className="mt-3 px-1 pb-1 text-xs font-semibold uppercase tracking-widest text-gold">NPS tools</p>
            {NPS_TOOLS.map((i) => <Link key={i.to} to={i.to} className="block rounded-lg px-1 py-2.5 text-[16px] font-medium text-ivory no-underline">{i.label}</Link>)}
            <div className="mt-3 border-t border-white/10 pt-3">
              {[["/monthly", "Monthly check-up"], ["/help", "Expert help"], ["/answers", "Answers"], ["/rules", "Rule updates"], ["/glossary", "Glossary"], ["/about", "About"], ["/employers", "For employers"], ["/site-map", "Site map"], ...(aiEnabled ? [["/ask", "Ask a question"]] : [])].map(([to, l]) => (
                <Link key={to} to={to} className="block rounded-lg px-1 py-2.5 text-[16px] font-medium text-ivory no-underline">{l}</Link>
              ))}
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}

function FooterLinks({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold">{title}</p>
      <ul className="mt-5 space-y-3 text-[14px]">{items.map((i) => <li key={i.to}><Link className="text-ivory/65 no-underline transition-colors hover:text-ivory" to={i.to}>{i.label}</Link></li>)}</ul>
    </div>
  );
}

function Footer() {
  const portals = [["https://unifiedportal-mem.epfindia.gov.in", "EPFO member portal"], ["https://epfigms.gov.in", "EPFiGMS grievances"], ["https://www.npstrust.org.in", "NPS Trust"], ["https://www.pfrda.org.in", "PFRDA"], ["https://www.incometax.gov.in", "Income Tax"]];
  return (
    <footer className="mt-24 bg-night text-ivory">
      <Container className="border-b border-white/10 py-14">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Logo dark />
            <p className="mt-6 max-w-xl font-display text-[30px] leading-tight text-ivory sm:text-[38px]">Your provident fund and pension, <em className="text-gold">handled with care.</em></p>
          </div>
          <Link to="/help" className="inline-flex shrink-0 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-night no-underline transition-colors hover:bg-gold-light">Talk to an expert</Link>
        </div>
      </Container>
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <FooterLinks title="Provident fund" items={PF_TOOLS} />
        <FooterLinks title="NPS and planning" items={[...NPS_TOOLS, { to: "/monthly", label: "Monthly check-up" }]} />
        <FooterLinks title="Company" items={[{ to: "/about", label: "About us" }, { to: "/answers", label: "Answers" }, { to: "/rules", label: "Rule updates" }, { to: "/glossary", label: "Glossary" }, { to: "/help", label: "Expert help" }, { to: "/employers", label: "For employers" }, { to: "/site-map", label: "Site map" }, { to: "/legal", label: "Terms & privacy" }]} />
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold">Official portals</p>
          <ul className="mt-5 space-y-3 text-[14px]">{portals.map(([h, l]) => <li key={h}><a className="text-ivory/65 no-underline transition-colors hover:text-ivory" href={h} target="_blank" rel="noopener noreferrer">{l} ↗</a></li>)}</ul>
          <p className="mt-8 text-[13px] text-ivory/50">Rules verified {fmtDate(RULES_CHECKED_ON)}</p>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="py-6 text-[12px] leading-relaxed text-ivory/45">
          Nidhi360 is an independent information service. It is not affiliated with EPFO, PFRDA, the Income Tax Department or any government body, and it does not provide investment, tax or legal advice. Always confirm on the official portal before filing. We never ask for your UAN password, OTP, PRAN login or bank details. © {new Date().getFullYear()} Nidhi360.
        </Container>
      </div>
    </footer>
  );
}

function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse">
      <div className="border-b border-line bg-canvas"><Container className="py-12"><div className="h-9 w-2/3 rounded bg-line/70" /><div className="mt-4 h-4 w-1/2 rounded bg-line/60" /></Container></div>
      <Container className="grid gap-6 py-8 lg:grid-cols-2"><div className="h-72 rounded-xl bg-canvas" /><div className="h-72 rounded-xl bg-canvas" /></Container>
    </div>
  );
}

/** ?embed=1 hides site chrome so payroll/HRMS partners can embed any page in an iframe. Persists for the session. */
function useEmbedMode() {
  const { search } = useLocation();
  const inUrl = new URLSearchParams(search).get("embed") === "1";
  try { if (inUrl) sessionStorage.setItem("n360:embed", "1"); return inUrl || sessionStorage.getItem("n360:embed") === "1"; }
  catch { return inUrl; }
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  const embed = useEmbedMode();
  // "/" focuses search from anywhere, like most search-first products.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      const input = document.querySelector<HTMLInputElement>('main input[type="search"]') ?? document.querySelector<HTMLInputElement>('header input[type="search"]');
      if (input) { e.preventDefault(); input.focus(); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
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
      <Head />
      {!embed && <Header />}
      <main id="main" className="flex-1"><Suspense fallback={<PageSkeleton />}><Outlet /></Suspense></main>
      {!embed && <ChatWidget />}
      {embed
        ? <p className="border-t border-line py-4 text-center text-[13px] text-muted">Powered by <a href={import.meta.env.BASE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700">Nidhi360</a> · Independent information, not affiliated with EPFO or PFRDA</p>
        : <Footer />}
    </div>
  );
}
