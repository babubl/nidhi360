# Nidhi360: PF & NPS, sorted

Free PF and NPS help in English and Tamil, built on the latest EPFO and PFRDA rules. A single `index.html` with no backend, no tracking and no build step.

## What's inside

| Page | What it does |
|---|---|
| Home | Problem-first picker, trust promises, latest rule changes |
| PF check | 11-question PF health check, a prioritised fix list, a shareable score card, print to PDF |
| Rejection decoder | Matches an EPFO rejection message against 12 common reasons, gives the fix and the escalation path. The optional AI explanation also reads screenshots |
| Job change | Transfer wizard covering multiple UANs, KYC, exit date, closed employer and company trust cases |
| Withdraw PF | Eligible amount under EPF Scheme 2026 (25% floor, 12-month rules), TDS estimate, interest given up by age 58, EPS note |
| NPS planner | Tax saved (old vs new regime) and retirement projection with exit split under the Dec 2025 PFRDA rules (80/20, ₹8L/₹12L slabs, premature exit, 60% tax-free) |
| Ask | Gemini chat grounded only in the rules register, citing rule IDs, and blocking Aadhaar, PAN and OTP |
| Rule watch | All 23 rules, each with status, effective date and source stamp |

## Before you publish

Edit the `CONFIG` block at the top of the `<script>`:

```js
GEMINI_API_KEY: "",          // from aistudio.google.com
GEMINI_MODEL: "gemini-flash-latest",
WHATSAPP_NUMBER: "",         // e.g. "919876543210"; empty = visitors copy their summary instead
SITE_URL: "https://babubl.github.io/nidhi360/",
RULES_CHECKED_ON: "2026-10-05"
```

**Protect the Gemini key.** A key in a public page is visible to anyone, so restrict it:

1. Go to Google Cloud Console, then APIs & Services, then Credentials.
2. Open your key and set Application restrictions to **Websites**.
3. Add `https://babubl.github.io/*` and your own domain.
4. Under API restrictions, allow only the **Generative Language API**.

The site works fully without a key. Only Ask and "Explain with AI" need it.

## Deploy on GitHub Pages

1. Create a repo named `nidhi360` and upload `index.html` and this README.
2. Go to Settings, then Pages, then Deploy from branch: `main`, folder `/root`.
3. The site goes live at `https://babubl.github.io/nidhi360/`.

## Keeping rules current (the moat)

All logic reads from the `RULES` array. When EPFO or PFRDA issue a change:

1. Add or edit the rule. Include `status` (`live` or `announced`), the effective `date`, the source `src` and its `url`, and text in both English and Tamil.
2. If the change affects numbers, update the calculators (`calcWithdraw`, `exitRules`, `calcTax`).
3. Update `RULES_CHECKED_ON`.

Rules last verified: 5 Oct 2026.
