/**
 * Nidhi360 AI proxy (Cloudflare Worker).
 * - Keeps the Gemini API key server-side (secret GEMINI_API_KEY).
 * - Grounds every answer in the same rules register the website uses.
 * - Blocks Aadhaar/PAN/OTP, restricts origins, and rate-limits per IP.
 *
 * Endpoints: POST /ask  { messages: [{ role, text }] }
 *            POST /decode { text, image?: { mimeType, data } }
 */
import rules from "../../src/data/rules.json";

interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  ALLOWED_ORIGINS?: string; // comma-separated
}
interface Rule { id: string; area: string; status: string; effective: string; title: string; summary: string; source: string }

const SENSITIVE = /\b\d{12}\b|\b\d{4}\s\d{4}\s\d{4}\b|\b[A-Z]{5}\d{4}[A-Z]\b|\botp\b\s*[:=]?\s*\d{4,8}/i;
const LIMIT_PER_MIN = 10;
const hits = new Map<string, { n: number; t: number }>();

const REGISTER = (rules as Rule[])
  .map((r) => `[${r.id}] (${r.area.toUpperCase()}, ${r.status}, from ${r.effective}; source: ${r.source}) ${r.title}: ${r.summary}`)
  .join("\n");

const SYSTEM = `You are Nidhi360's assistant for salaried people in India with questions about PF (EPFO), EPS pension and NPS (PFRDA).
Rules:
1. Answer ONLY from the RULES REGISTER. After each factual claim, cite the rule id in square brackets, e.g. [R4]. If the register doesn't cover the question, say so plainly and point to the official source (EPFO member portal, NPS Trust, or a tax professional). Never invent rules, numbers, dates or form names.
2. Be specific and practical: what applies to the person, the numbers, and the next step on the official portal.
3. Never ask for or accept UAN, PAN, Aadhaar, bank account numbers, passwords or OTPs.
4. This is general information, not personalised investment, tax or legal advice. For tax-heavy decisions, suggest a tax professional in one short line.
5. Plain, friendly English. Under 180 words. Short bullets for steps.

RULES REGISTER:
${REGISTER}`;

const DECODE_TASK = `The user shares an EPFO claim rejection message or a screenshot of one. In under 150 words explain: what the rejection means, the exact fix steps on the EPFO member portal, and when to escalate on EPFiGMS (cite [R6] for the 20-day settlement deadline). If the screenshot shows UAN, Aadhaar, PAN or bank numbers, never repeat them.`;

function cors(origin: string | null, env: Env): Record<string, string> {
  const allowed = (env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const ok = origin && (allowed.length === 0 || allowed.includes(origin));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : allowed[0] ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

async function gemini(env: Env, contents: unknown[], system: string): Promise<string> {
  const model = env.GEMINI_MODEL ?? "gemini-flash-latest";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents, generationConfig: { temperature: 0.3, maxOutputTokens: 1024 } }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("empty");
  return text;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const h = cors(req.headers.get("Origin"), env);
    if (req.method === "OPTIONS") return new Response(null, { headers: h });
    if (req.method !== "POST") return json({ error: "method" }, 405, h);

    const allowed = (env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const origin = req.headers.get("Origin");
    if (allowed.length && (!origin || !allowed.includes(origin))) return json({ error: "origin" }, 403, h);

    const ip = req.headers.get("CF-Connecting-IP") ?? "anon";
    const now = Date.now();
    const rec = hits.get(ip);
    if (rec && now - rec.t < 60_000) { if (++rec.n > LIMIT_PER_MIN) return json({ error: "rate" }, 429, h); }
    else hits.set(ip, { n: 1, t: now });

    const path = new URL(req.url).pathname;
    try {
      if (path.endsWith("/ask")) {
        const { messages } = (await req.json()) as { messages: { role: string; text: string }[] };
        if (!Array.isArray(messages) || !messages.length) return json({ error: "bad request" }, 400, h);
        const recent = messages.slice(-10).map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: String(m.text).slice(0, 2000) }] }));
        if (messages.some((m) => m.role === "user" && SENSITIVE.test(m.text))) return json({ text: "Please remove any Aadhaar, PAN or OTP from your message and ask again." }, 200, h);
        return json({ text: await gemini(env, recent, SYSTEM) }, 200, h);
      }
      if (path.endsWith("/decode")) {
        const { text, image } = (await req.json()) as { text?: string; image?: { mimeType: string; data: string } };
        if (text && SENSITIVE.test(text)) return json({ text: "Please remove any Aadhaar, PAN or OTP and try again." }, 200, h);
        const parts: unknown[] = [{ text: "Rejection message: " + (text?.slice(0, 2000) || "(see screenshot)") }];
        if (image?.data && image.data.length < 6_000_000) parts.push({ inline_data: { mime_type: image.mimeType, data: image.data } });
        return json({ text: await gemini(env, [{ role: "user", parts }], SYSTEM + "\n\n" + DECODE_TASK) }, 200, h);
      }
      return json({ error: "not found" }, 404, h);
    } catch {
      return json({ error: "upstream" }, 502, h);
    }
  },
};
