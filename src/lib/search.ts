import { ANSWERS } from "../data/answers";
import { GLOSSARY } from "../data/glossary";
import { NPS_TOOLS, PF_TOOLS } from "../data/tools";

export type ResultKind = "answer" | "tool" | "term";
export interface SearchResult { kind: ResultKind; title: string; snippet: string; to: string; score: number }

const STOP = new Set("a an the i my me is am are was be to of for in on at and or how what when where why can do does did will should could would it its this that with from by about we our your you get got have has had not no any much many which who".split(" "));

/** Words people use → words our content uses. */
const SYNONYMS: Record<string, string[]> = {
  epf: ["pf"], provident: ["pf"], resign: ["resigned", "quit", "left"], resigned: ["resign", "left"], quit: ["resign", "left"],
  fired: ["lost", "job"], terminated: ["lost", "job"], layoff: ["lost", "job"], unemployed: ["lost", "job"],
  money: ["withdraw", "balance"], cash: ["withdraw", "lump"], takeout: ["withdraw"], take: ["withdraw"], encash: ["withdraw"],
  rejected: ["rejection"], reject: ["rejected"], complaint: ["grievance", "epfigms"], complain: ["grievance"],
  dead: ["death", "died"], died: ["death"], expired: ["death"], passed: ["death"],
  pension: ["eps"], eps: ["pension"], retire: ["retirement", "60", "58"], retirement: ["retire"],
  hospital: ["medical"], treatment: ["medical"], fees: ["education"], wedding: ["marriage"], home: ["house"], flat: ["house"],
  dob: ["birth"], birthday: ["birth"], spelling: ["name"], uan: ["uan"], tds: ["tax"], taxable: ["tax"],
};

export function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9₹%.\s]/g, " ").split(/\s+/).filter((t) => t && !STOP.has(t));
}

/** Common misspellings seen in Indian PF/NPS searches. */
const SPELLING: Record<string, string> = {
  widraw: "withdraw", withdrew: "withdraw", withdrawl: "withdrawal", widrawal: "withdrawal", withdrawel: "withdrawal",
  pention: "pension", pensn: "pension", nomine: "nominee", nomini: "nominee", transfar: "transfer", tranfer: "transfer",
  rejectd: "rejected", rejeted: "rejected", balence: "balance", ballance: "balance", pasbook: "passbook", setteled: "settled",
  setlement: "settlement", employeer: "employer", aadhar: "aadhaar", adhar: "aadhaar", resine: "resign", resined: "resigned",
};

function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0], rowMin = (prev[0] = i);
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
      rowMin = Math.min(rowMin, prev[j]);
    }
    if (rowMin > max) return max + 1;
  }
  return prev[b.length];
}

let VOCAB: Set<string> | null = null;
/** Correct a token to the nearest word in our content when it isn't a known word. */
function correct(t: string): string {
  if (SPELLING[t]) return SPELLING[t];
  if (t.length < 5 || /\d/.test(t)) return t;
  VOCAB ??= new Set(DOCS.flatMap((d) => tokenize(`${d.title} ${d.keywords.join(" ")} ${d.body}`)));
  if (VOCAB.has(t)) return t;
  const max = t.length >= 8 ? 2 : 1;
  let best = t, bestD = max + 1;
  for (const w of VOCAB) {
    const d = editDistance(t, w, max);
    if (d < bestD) { best = w; bestD = d; if (d === 1 && max === 1) break; }
  }
  return best;
}

function expand(tokens: string[]): string[] {
  tokens = tokens.map(correct);
  const out = new Set(tokens);
  for (const t of tokens) for (const s of SYNONYMS[t] ?? []) out.add(s);
  return [...out];
}

interface Doc { kind: ResultKind; title: string; snippet: string; to: string; keywords: string[]; body: string; boost: number }

const DOCS: Doc[] = [
  ...ANSWERS.map((a) => ({ kind: "answer" as const, title: a.question, snippet: a.short, to: `/answers/${a.slug}`, keywords: a.keywords, body: a.short, boost: 1 })),
  ...[...PF_TOOLS, ...NPS_TOOLS].map((t) => ({ kind: "tool" as const, title: t.label, snippet: t.desc, to: t.to, keywords: [], body: t.desc, boost: 0.9 })),
  ...GLOSSARY.map((g) => ({ kind: "term" as const, title: g.term, snippet: g.meaning, to: "/glossary", keywords: [g.term.toLowerCase()], body: g.meaning, boost: 0.6 })),
];

const has = (hay: string, t: string) => new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(hay);

export function search(query: string, limit = 8): SearchResult[] {
  const tokens = expand(tokenize(query));
  const q = " " + tokens.join(" ") + " " + query.toLowerCase().trim();
  if (!tokens.length) return [];
  const scored = DOCS.map((d) => {
    let s = 0;
    const title = d.title.toLowerCase(), body = d.body.toLowerCase();
    for (const k of d.keywords) if (k.length > 2 && q.includes(k)) s += 4 + k.split(" ").length * 2;
    for (const t of tokens) {
      if (has(title, t)) s += 3;
      if (d.keywords.some((k) => has(k, t))) s += 2;
      if (has(body, t)) s += 1;
    }
    return { kind: d.kind, title: d.title, snippet: d.snippet, to: d.to, score: s * d.boost };
  }).filter((r) => r.score >= 3);
  scored.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  return scored.filter((r) => (r.kind === "term" ? !seen.has(r.title) && seen.add(r.title) : true)).slice(0, limit);
}
