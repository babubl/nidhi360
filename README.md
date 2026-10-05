# Nidhi360

PF and NPS, sorted, for salaried India. Nidhi360 tells people what they can withdraw, why their EPFO claim was rejected and how to fix it, how to move PF after a job change, what EPS pension they'll get, and how to exit NPS without overpaying tax. Every answer is grounded in a dated, sourced register of EPFO, PFRDA and tax rules.

**Live:** https://babubl.github.io/nidhi360/

## Product

| Area | Route | What it does |
|---|---|---|
| Answers | `/answers`, `/answers/:slug` | 34 common questions with a direct answer, steps, the rules behind it and the right tool; site-wide problem search |
| Complaint drafter | `/pf/grievance` | Paste-ready EPFiGMS grievance for delayed, rejected or unpaid claims, stuck transfers and employer defaults, with the 20-day deadline check |
| Expert help | `/help` | Paid help for hard cases (₹499 case review, ₹999 full support; prices in `src/pages/Help.tsx`), sent by WhatsApp or email |
| About, Terms & privacy | `/about`, `/legal` | Founder profile (`src/data/team.ts`), methodology, DPDP-aligned privacy, disclaimer, clear-my-data |
| Deadline reminders | `/reminders` | Personal PF/NPS dates (exit date, 12-month settlement, EPS at 58, NPS before 60, life certificate) as a calendar file |
| Life stages | `/start/:stage` | 20s / 30s / 40s / 50s: the three things to do now, and mistakes to avoid |
| PF account check | `/pf/health-check` | 11-point readiness score with a prioritised fix list |
| Claim rejected | `/pf/claim-rejected` | Matches the rejection reason against 12 common causes, gives fix steps and the escalation path. Optional AI reading of a screenshot |
| Job change | `/pf/job-change` | Personalised transfer plan: two UANs, KYC, exit date, closed employer, company trust |
| Withdrawal estimate | `/pf/withdraw` | EPF Scheme 2026 rules (25% floor, 12-month waits), TDS, interest given up |
| EPS pension | `/pf/pension` | Pension at 50–60, ₹25,000 ceiling transition, 20-year weightage, ₹1,000 minimum |
| NPS tax | `/nps/tax` | Old vs new regime, employer 14%/10% caps, what to ask HR |
| NPS retirement | `/nps/retirement` | Corpus projection and the Dec 2025 exit split (80/20, ₹8L/₹12L slabs, premature exit, tax-free 60%) |
| Rule updates | `/rules` | The full register with status, effective date and source |
| Ask | `/ask` | AI assistant answering only from the register, with rule citations |
| For employers | `/employers` | B2B offer for HR teams |

## Architecture

```
src/
  data/          Content as data: rules register (rules.json), rejection reasons, health check, glossary, life stages
  lib/calc/      Pure, unit-tested calculators (no UI): PF withdrawal, EPS pension, NPS exit/tax/projection, health score, rejection matching
  lib/ask.ts     Client for the AI proxy
  components/    Design system (ui.tsx), layout, tool page shell
  pages/         One lazy-loaded route per page
worker/          Cloudflare Worker AI proxy: holds the Gemini key, grounds answers in rules.json, filters Aadhaar/PAN/OTP, rate-limits, restricts origins
.github/workflows/deploy.yml   Test → build → deploy to GitHub Pages on every push to main
```

- **Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Vitest.
- **The rules register is the moat.** Every calculator and AI answer reads from `src/data/rules.json`. When a rule changes, edit it there, update the affected calculator and its tests, and bump `RULES_CHECKED_ON` in `src/data/rules.ts`.
- **Privacy by design.** There are no accounts, and no personal data leaves the browser except AI questions, which are filtered for ID numbers before sending.
- **Ready to grow.** Content is separate from code, so it can move to a CMS. Calculators are framework-free and can be reused in a mobile app or an employer API.

## Investor memo

See [docs/PITCH.md](docs/PITCH.md) for the problem, market, competition, business model, metrics and the investor-panel feedback behind recent changes.

## Embedding (payroll / HRMS partners)

Add `?embed=1` to any page URL to hide the site header and footer, e.g. `https://babubl.github.io/nidhi360/pf/withdraw?embed=1`, and place it in an iframe.

## Content corrections

Every answer and rule has a **Report an error** link that opens a prefilled GitHub issue (label `content-error`). Fix the data file, bump `reviewed` on the answer (or `RULES_CHECKED_ON`), and close the issue with the commit.

## Resolution benchmark

`src/lib/search.test.ts` holds 30 real questions typed the way people type them ("i resigned last month can i take my full pf", "father passed away how to claim his pf and insurance"). Each must surface the right answer in the top 3 search results. The suite runs in CI on every push, so new content can't quietly break the way people find help. Add a test case whenever users ask something new.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173/nidhi360/
npm test           # calculator unit tests
npm run build
```

## Deploy

1. In **Settings → Pages**, set Source to **GitHub Actions**. Every push to `main` then tests, builds and deploys.
2. Optional: add repository **Variables** (Settings → Secrets and variables → Actions → Variables):
   - `VITE_ASK_URL`: URL of the deployed AI proxy. Turns on Ask and AI rejection reading.
   - `VITE_WHATSAPP_NUMBER`: turns on "Talk to a PF expert", e.g. `919876543210`.
   - `VITE_CONTACT_EMAIL`: shown on the For employers page.
   - `VITE_PLAUSIBLE_DOMAIN`: cookie-less analytics (searches, resolved / not resolved, shares). No personal data.
   - `BASE_PATH`: set to `/` if you move to a custom domain.

## AI proxy (worker/)

```bash
cd worker
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```

Set the resulting `https://nidhi360-ai.<account>.workers.dev` URL as `VITE_ASK_URL`. Allowed origins are in `worker/wrangler.toml`.

## Disclaimer

Nidhi360 is independent and is not affiliated with EPFO, PFRDA or any government body. It provides general information, not investment, tax or legal advice.
