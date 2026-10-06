/**
 * Single source of truth for page titles, descriptions, canonical URLs and structured data.
 * Used on the client (document head updates) and at build time (prerendered HTML, sitemap).
 */
import { ANSWERS, answerBySlug, CATEGORY_LABELS } from "./data/answers";
import { LIFE_STAGES } from "./data/lifestages";
import { FOUNDER } from "./data/team";

export const SITE_NAME = "Nidhi360";
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://babubl.github.io/nidhi360").replace(/\/$/, "");
const DEFAULT_DESC = "Know what PF you can withdraw, fix a rejected EPFO claim, move PF after a job change, estimate your EPS pension and plan your NPS exit. Free, based on the latest EPFO and PFRDA rules, with the source for every answer.";

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  jsonLd?: object[];
  noindex?: boolean;
}

const STATIC: Record<string, { title: string; description: string }> = {
  "/": { title: "PF and NPS help for salaried India", description: DEFAULT_DESC },
  "/pf/health-check": { title: "PF account check: find what will block your claim", description: "Check your EPFO account in 2 minutes: UAN, KYC, bank, name match, exit dates, nominee. Get a prioritised fix list before you file a claim." },
  "/pf/claim-rejected": { title: "PF claim rejected? Understand the reason and fix it", description: "Paste your EPFO rejection reason and get a plain-English explanation, the exact steps to fix it, and where to complain if it's still stuck." },
  "/pf/job-change": { title: "Changed jobs? Transfer your PF the right way", description: "Step-by-step PF transfer after a job change: merge two UANs, mark the exit date, transfer without employer approval, handle a closed company." },
  "/pf/withdraw": { title: "How much PF can I withdraw? EPF Scheme 2026 calculator", description: "Estimate your PF withdrawal for medical, education, marriage, housing, job loss or retirement under the EPF Scheme 2026, including TDS and the 25% minimum balance." },
  "/pf/pension": { title: "EPS pension calculator: how much will I get?", description: "Estimate your EPS monthly pension at 58, early from 50 or deferred to 60, including the ₹25,000 wage ceiling from September 2026." },
  "/pf/calculator": { title: "EPF calculator: your PF balance at retirement", description: "Project your EPF balance at 58 with the 8.25% rate and the ₹25,000 wage ceiling, including VPF, and see how much comes from you, your employer and interest." },
  "/pf/grievance": { title: "Write an EPFO complaint (EPFiGMS grievance) in a minute", description: "Draft a clear EPFiGMS grievance for a delayed, rejected or unpaid PF claim, a stuck transfer, or an employer not depositing PF. Checks the 20-day deadline." },
  "/nps/tax": { title: "NPS tax savings calculator: old vs new regime", description: "How much tax NPS saves you in the old and new regimes, including the employer contribution deduction up to 14% of basic + DA." },
  "/nps/retirement": { title: "NPS retirement and exit planner (2025 rules)", description: "Project your NPS corpus and see what you can take as lump sum, what must buy an annuity, and the tax, under PFRDA's December 2025 exit rules." },
  "/compare": { title: "EPF vs VPF vs PPF vs NPS: compare returns, tax and lock-in", description: "Side-by-side comparison of EPF, VPF, PPF and NPS: current returns, tax treatment, lock-in, withdrawal rules and who each one suits." },
  "/reminders": { title: "PF and NPS deadline reminders for your calendar", description: "Never miss a PF or NPS deadline: exit date, 12-month settlement, EPS at 58, NPS decision before 60, yearly life certificate. Add them to your calendar." },
  "/answers": { title: "PF, EPS and NPS answers", description: "Straight answers to the PF, EPS and NPS questions people ask most, with the steps to take and the official rule behind each." },
  "/rules": { title: "PF and NPS rule updates with official sources", description: "Every EPFO, PFRDA and tax rule Nidhi360 uses, with its official source, effective date and status." },
  "/glossary": { title: "PF and NPS glossary in plain English", description: "UAN, EPS, Form 19, Form 10C, PRAN, annuity and more, explained in plain English." },
  "/help": { title: "Expert help with your PF or NPS case", description: "Stuck PF claim, death claim, employer default or pension problem? Get an expert to guide you. Pay only after we confirm we can help." },
  "/employers": { title: "PF and NPS support for employers and HR teams", description: "Give employees PF and NPS support that cuts HR tickets and rejected claims, and keeps up with every rule change. Start with a 60-day pilot." },
  "/about": { title: "About Nidhi360", description: `Who's behind Nidhi360, where our answers come from and how we handle your data. Built and reviewed by ${FOUNDER.name}.` },
  "/legal": { title: "Terms, privacy and disclaimer", description: "Nidhi360's plain-language terms, privacy policy and disclaimer." },
  "/ask": { title: "Ask about PF or NPS", description: "Describe your PF, EPS or NPS problem in your own words and get a straight answer." },
};

const crumbs = (items: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE_URL + path })),
});

export function getMeta(pathname: string): PageMeta {
  const path = pathname.replace(/\/+$/, "") || "/";

  const answer = path.match(/^\/answers\/([^/]+)$/);
  if (answer) {
    const a = answerBySlug(answer[1]);
    if (a) {
      const text = a.short + (a.steps ? "\n" + a.steps.map((s, i) => `${i + 1}. ${s}`).join("\n") : "");
      return {
        path,
        title: a.question,
        description: a.short.length > 158 ? a.short.slice(0, 155).replace(/\s+\S*$/, "") + "…" : a.short,
        jsonLd: [
          { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: a.question, acceptedAnswer: { "@type": "Answer", text } }] },
          crumbs([["Answers", "/answers"], [CATEGORY_LABELS[a.category], "/answers"], [a.question, path]]),
        ],
      };
    }
  }

  const stage = path.match(/^\/start\/([^/]+)$/);
  if (stage) {
    const s = LIFE_STAGES.find((x) => x.slug === stage[1]);
    if (s) return { path, title: `PF and NPS in your ${s.age}: ${s.title.toLowerCase()}`, description: s.intro };
  }

  const st = STATIC[path];
  if (st) {
    const meta: PageMeta = { path, ...st };
    if (path === "/") {
      meta.jsonLd = [
        { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL + "/", potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/answers?q={search_term_string}`, "query-input": "required name=search_term_string" } },
        { "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: SITE_URL + "/", logo: SITE_URL + "/icon-512.png", founder: { "@type": "Person", name: FOUNDER.name } },
      ];
    }
    if (path === "/answers") {
      meta.jsonLd = [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: ANSWERS.map((a) => ({ "@type": "Question", name: a.question, acceptedAnswer: { "@type": "Answer", text: a.short } })) }];
    }
    return meta;
  }

  return { path, title: "Page not found", description: DEFAULT_DESC, noindex: true };
}

export const fullTitle = (m: PageMeta) => (m.path === "/" ? `${SITE_NAME} · ${m.title}` : `${m.title} · ${SITE_NAME}`);

/** Every indexable path, for prerendering and the sitemap. */
export function allPaths(): string[] {
  return [
    ...Object.keys(STATIC),
    ...ANSWERS.map((a) => `/answers/${a.slug}`),
    ...LIFE_STAGES.map((s) => `/start/${s.slug}`),
  ];
}
