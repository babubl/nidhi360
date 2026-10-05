# Nidhi360: investor memo and panel feedback

*October 2026. Market figures are from public sources linked at the end. The panel feedback is simulated: it is our best reading of how each investor or operator would react, based on their public theses and products, used to stress-test the plan. It is not their actual opinion.*

## The problem

- **1 in 5 PF claims is rejected.** About 174 lakh of 796 lakh claims were rejected in FY 2024-25, according to EPFO's annual report. The five-year average is about 26%. Most rejections come from fixable errors: KYC not verified, bank or IFSC mismatches, missing exit dates, name or date-of-birth mismatches.
- **The rules keep changing.** Since late 2025:
  - EPF partial withdrawals were cut from 13 categories to 3, with a new 25% minimum balance.
  - The EPF Scheme 2026 replaced the 1952 scheme on 1 July 2026, and full settlement now needs 12 months without a job.
  - The PF wage ceiling went from ₹15,000 to ₹25,000 on 17 September 2026.
  - NPS exit rules changed in December 2025 (80% lump sum, exit after 15 years, deferral to 85), but only 60% of the corpus is tax-free.
  - UPI-based NPS onboarding was unveiled in October 2026.
- **People don't know where to go.** EPFO's portal assumes you know the form number. Blogs are generic and often out of date. "PF agents" ask for UAN passwords and OTPs.

## Why now

The EPF Scheme 2026, the ₹25,000 wage ceiling (about 51 lakh newly covered workers), the December 2025 NPS exit changes and UPI-based NPS onboarding (PFRDA expects 2–3 crore new subscribers in two years) all landed within twelve months. Confusion is at a peak, and every change resets what people think they know.

## Product (live today)

- **Problem search and an answers library:** 34 questions, each with a direct answer, steps, the rule behind it and the right tool.
- **Resolution tools:**
  - PF account check
  - rejection decoder
  - transfer planner
  - withdrawal estimate (EPF Scheme 2026)
  - EPS pension estimate (₹25,000 ceiling transition)
  - EPFiGMS complaint drafter with the 20-day deadline check
  - deadline reminders as a calendar file
  - NPS tax and NPS exit planners
- **The rules register:** 28 rules, each with its status, effective date and official source. Every tool and every AI answer reads from it.
- **Expert help for hard cases** (₹499 case review, ₹999 full support; you pay only after we confirm we can help). Every "stuck" path in the product leads here.
- **Trust layer:** a named founder with credentials, a "checked on" date and "report an error" link on every answer, and plain-language terms, privacy and disclaimer.
- **Remembers you without an account:** details entered once prefill the other tools, stored only on the device.
- **Partner-ready:** any page embeds in payroll or HRMS apps with `?embed=1`.
- **Privacy:** no login, and nothing the user types leaves the browser. We never touch credentials or money.
- **Quality:** 69 automated tests, including a benchmark of 30 real user questions that must find the right answer. CI deploys on every push.

## Moat

1. **The rules register.** It is versioned and tested, and maintained as EPFO and PFRDA issue changes. Copying the UI is easy; keeping 28+ rules correct as they change every quarter is the hard part.
2. **Resolution data.** "Did this solve it?" on every answer and tool tells us which problems we actually close, and which need an expert or an EPFO escalation. Over time this becomes the best map of where PF claims fail.
3. **Trust posture.** We never ask for passwords or OTPs and never sell products. In a category full of agents and mis-selling, that is a brand.

## Business model

| Stream | Who pays | When |
|---|---|---|
| Free consumer tools | Nobody | Always. This is the acquisition engine. |
| Employer plan (per employee per month) | HR / payroll | Pilot now: co-branded link, then HRMS integration, white-label and aggregate insights |
| Assisted resolution (fixed fee per case, refundable if unresolved) | The individual | Once WhatsApp expert help is staffed, for cases flagged "Not yet resolved" |
| Partnerships (no commissions on products) | Payroll/HRMS platforms, corporate NPS stacks | Distribution and API licensing of the rules engine |

We deliberately exclude ads, annuity or insurance lead-selling, and anything that pays us more when the user picks a particular product.

## Competition

| Player | What they do | How we differ |
|---|---|---|
| EPFO portal, UMANG | Where claims are filed | We don't replace them; we get users there with the right form, clean KYC and the right words |
| FinRight (ex-CRED/Amazon founders, 2023) | Human-assisted PF claims; about 5,000 customers reported | Self-serve first, near-zero marginal cost per user; assisted help only as a paid escalation |
| PensionBox (Rainmatter-backed, Feb 2026) | Corporate NPS infrastructure for employers | Complementary: we are the employee-facing resolution layer across PF, EPS and NPS. A natural partner, not a rival |
| ClearTax, ET Money and finance blogs | SEO content | Content, not resolution; often stale after rule changes. Our answers are tested, cited and tied to tools |
| PF "agents" | Cash for filing | They need your password; we never do |

## Simulated panel feedback and what we changed

### Rainmatter (Zerodha's fund; backs PensionBox; patient, user-first, wary of ad- and commission-driven models)
- *"Information is a commodity. What do you actually resolve?"* → We now track **"Did this solve your problem?"** on every answer and tool. A "No" routes to the complaint drafter or expert help. Resolution rate is our north-star metric.
- *"Don't make money by selling annuities or insurance."* → We wrote the **no-commission model** into this memo and the business-model table.
- *"How do you sit next to PensionBox?"* → We position as the **employee-facing resolution layer**, complementary to employer NPS infrastructure, and make partnership a stated go-to-market path.

### Early-stage fintech VC lens
*Note: we couldn't identify a public investor named "Fynprint". This section applies the questions any early-stage fintech VC asks.*
- *"Why now? Market size? Competition?"* → Answered with sourced figures above. The home page now opens the problem with outcome numbers (1 in 5 claims rejected; 7.5 crore members; 2.3 crore NPS subscribers).
- *"Consumer CAC will kill you."* → The **employers page** now carries a concrete **60-day pilot** and market data (11 lakh PF establishments against about 22,000 offering NPS). B2B is the primary revenue path; consumer tools are the funnel.
- *"Show me metrics."* → **Privacy-first analytics** (Plausible, cookie-less, no personal data): searches, zero-result searches, resolved and not resolved, shares, complaint drafts, calendar downloads.

### CRED (trust, delight, habit)
- *"PF is episodic. People come once a year. Why would they return?"* → **Deadline reminders**: a personal calendar of PF and NPS dates (exit date, 12-month settlement, EPS at 58, NPS decision before 60, yearly life certificate, quarterly passbook check). Each reminder links back to the right page. It works without accounts or a backend.
- *"Make the value visible in five seconds."* → Problem search in the hero, popular questions as one-tap chips, and outcome numbers above the fold.

### PhonePe and Google Pay (distribution at India scale)
- *"Your users live on WhatsApp and UPI apps, not on websites."* → **Share on WhatsApp** on every answer and the PF check score. On the roadmap: a UPI-app mini-app (PhonePe Switch-style) and a WhatsApp bot built on the same answers library and search.
- *"Most of India won't use an English-only finance site."* → Acknowledged. The founder chose English for this phase. Content is already data-driven, so **Hindi first, then Tamil and other languages** is a content change, not a rebuild. It's the top roadmap item once English product-market fit is shown.
- *"Never touch credentials. One leaked OTP and you're done."* → Already true: we block Aadhaar, PAN and OTP numbers in AI and complaint inputs, and say so on every page.

## Founder self-review (investor and user lens), and what changed

| Feedback | Change |
|---|---|
| "Help stops at the portal door; no human when I'm stuck" | Expert help with clear prices, linked from every tool and answer; answers for OTP not received, portal down and agent safety |
| "It doesn't know me; I retype everything" | Tools share the person's details on their device (age, balance, service, dates) |
| "Who's behind this?" | Named founder with credentials on Home, About and every answer |
| "One wrong answer and I'm gone" | A checked date and a public "report an error" link on every answer and rule |
| "No revenue yet" | Paid case review and full support tiers; employer pilot; payroll embed |
| "Compliance edges" | Terms, privacy (DPDP-aligned) and disclaimer, including "not a SEBI-registered investment adviser"; clear-my-data control |
| "English only" | Kept by founder decision for now; Hindi and then Tamil next, once there is early traction |

## Metrics we will report

- **Resolution rate:** "Yes" ÷ ("Yes" + "Not yet") on answers and tools. Target: 70% or more.
- **Zero-result search rate.** Target: under 10%. Every zero-result query becomes a new answer and a new benchmark test.
- **Complaints drafted, and reminder calendars downloaded:** intent signals.
- **Employer pilots:** PF tickets per 100 employees before and after; claim rejection rate for pilot employees.

## Roadmap (next two quarters)

1. Deploy the AI proxy (Ask and screenshot reading of rejections) and staff WhatsApp expert help.
2. Hindi content, then Tamil, Telugu, Kannada and Malayalam.
3. First three employer pilots; HRMS integration with one payroll partner.
4. A WhatsApp bot and a UPI mini-app on the same answers engine.
5. A rules-change alerts subscription.

## Sources

- [EPFO claim rejections FY 2024-25: Business Today](https://www.businesstoday.in/personal-finance/news/story/epfos-instant-pf-withdrawal-promise-has-a-catch-one-in-five-claims-still-gets-rejected-541466-2026-07-07)
- [PFRDA: 2.3 crore NPS subscribers, 2–3 crore expected via UPI onboarding (Oct 2026)](https://news.webindia123.com/news/Articles/Business/20261001/4506005.html)
- [Rainmatter's $2M investment in PensionBox (Feb 2026)](https://www.outlookbusiness.com/amp/story/corporate/zerodhas-rainmatter-invests-2-million-in-pensionbox-to-tap-into-pension-ecosystem)
- [FinRight: PF claims startup](https://www.business-standard.com/content/press-releases-ani/india-s-first-fintech-startup-simplifying-provident-fund-challenges-for-india-s-workforce-125010900506_1.html)
- [EPFO 3.0 UPI testing complete; 7.48 crore active subscribers](https://www.bestencyclopedia.com/2026/05/epfo-upi-pf-withdrawal-guide.html?m=1)
- [Wage ceiling ₹25,000 from 17 Sep 2026; 51 lakh newly covered](https://www.indianpaycalculator.in/govt-news/epf-wage-ceiling-25000-no-notification-eps-pension-2026)
