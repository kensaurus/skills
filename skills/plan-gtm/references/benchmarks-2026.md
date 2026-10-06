# GTM benchmarks and sources (verified 2026-09-17)

Shared by `plan-gtm`, `plan-pricing`, `enhance-onboarding`,
`enhance-web-conversion`, `enhance-lifecycle-email`, `enhance-growth-loops`,
`docs-launch-kit`, `docs-comparison-pages`, `audit-registry-listing`,
`iterate-gtm-weekly`. Quote a number only with its row here; if a row is
missing, write **unmeasured** or **no benchmark** in the plan.

## Contents

- Free-to-paid by model
- Activation, time-to-value, retention
- Pricing and packaging
- Pricing research and value metric
- Lifecycle email
- Open-source monetization
- Distribution
- Positioning and messaging
- Failure modes (why GTM plans die)


## Free-to-paid by model

ChartMogul × Growth Unhinged (Kyle Poyar) × ProductLed, ~200 self-serve
products, Jan 2026. Conversion measured within 6 months of signup.

| Model | Good (p50) | Great (p75) | Notes |
|---|---|---|---|
| Freemium (gated) | 3–5% | 8–12% | 26% of products lead with it |
| Freemium, ungated (try before account) | 7–9% | 8–12% | 7% of products; adoption play |
| Free trial, no card | 4–6% | 10–15% | 57% of products; 14-day modal (62%) |
| Free trial, card required | 25–35% | 50–60% | 20% of trials; ~5× no-card; ~65% fewer signups |
| Reverse trial | 4–6% | 8–12% | 7% of products; **not statistically distinct** |
| Interactive demo (dummy data) | — | — | 7% of products |

Median across all models **8%**; 20% of trial products convert under 2.5%,
23% above 25%. Per 1,000 visitors: freemium ≈ 90 signups → 5 paid; no-card
trial 45 → 4; card trial 35 → 11. One dual-CTA change (free plan *or*
14-day card trial) lifted premium trial starts 26%. PQL-driven conversion
runs ~3× the 9% average; only 24–34% of PLG companies track PQLs/activation.

- https://www.growthunhinged.com/p/free-to-paid-conversion-report
- https://chartmogul.com/reports/saas-conversion-report/
- https://www.growthunhinged.com/p/how-to-improve-free-to-paid-conversion
- https://productled.com/blog/product-led-growth-benchmarks
- https://userpilot.com/blog/saas-average-conversion-rate/ (First Page Sage and
  GrowthSpree report higher B2B bands: opt-in 14–18%, opt-out 44–49%)

## Activation, time-to-value, retention

| Metric | Number | Source |
|---|---|---|
| B2B SaaS activation, average / median | 37.5% / 37% (n=62) | Userpilot 2025 |
| PLG vs sales-led activation | 34.6% vs 41.6% | Userpilot 2025 |
| Activation by vertical | AI/ML 54.8% · dev tools ~40% · MarTech 24% · FinTech 5% | Userpilot 2025 |
| Activation median, all products / SaaS | 25% / 30%; good = p60, great = p80 | Lenny × Timen, 500+ products |
| Time-to-value, average / median | 1 d 12 h / 1 d 2 h; top quartile < 5 min | Userpilot 2025 |
| TTV > 24 h | activation collapses below 25% | Userpilot analysis |
| Day-1 activation, top products / median | 21% / 5% | Amplitude 2025 (2,600+ cos) |
| Day-7 return of a new cohort | ≥ 7% = top quartile | Amplitude 2025 |
| Month-3 loss of new users, median product | 96% | Amplitude 2025 |
| Valid activation event | ≥ 2× retention for users who hit it | Lenny × Timen |
| Onboarding checklist completion | 19–20% avg; engaged users finish ~5 items | Chameleon 2025 (550M interactions) |
| Tour completion | click-triggered 67% vs timer 31%; 3–4 steps 72–74%, 7+ steps 16% | Chameleon 2025 |
| Embedded guidance vs modal | +20% engagement | Chameleon 2025 |
| Personalization | 65% collect signup data, 18% use it | Chameleon 2025 |

- https://userpilot.com/saas-product-metrics/
- https://www.lennysnewsletter.com/p/what-is-a-good-activation-rate
- https://www.linkedin.com/posts/elenaverna_growth-data-activity-7377023750262644736-buVc
- https://www.chameleon.io/benchmark-report
- https://www.reforge.com/guides/analyze-activation (Setup → Aha → Habit)
- https://posthog.com/product-engineers/activation-metrics (pick the event combo that best predicts 3-month retention)

## Pricing and packaging

- Hybrid (seat + usage) pricing 27% → 41% of B2B SaaS in 2025; seat-only
  21% → 15%; 29% sell AI credits, 33% plan to. AI-native companies 4× more
  likely to price on outcomes. — https://www.growthunhinged.com/p/2025-state-of-b2b-monetization
- Annual discount norm 15–25%; state it as "2 months free", not "save 17%".
  Hiding the enterprise price removes the anchor and hurts middle-tier
  conversion — show "from $X". — https://productphilosophy.com/articles/pricing-page-conversion-architecture-twelve-elements
- Three tiers good-better-best, recommended middle, higher tier on the right
  as anchor, same CTA verb on every column, "No credit card required" under
  the button when true. — https://kompassify.com/blog/pricing-page-best-practices
- Underpricing attracts the curious, not the committed: one indie raise
  £9 → £19 moved month-3 retention 42% → 67%. — https://www.indiehackers.com/post/i-underpriced-my-saas-for-4-months-and-it-almost-broke-me-not-the-way-you-think-a0ae21a1e6

## Pricing research and value metric

- Order of methods: Van Westendorp (acceptable range; directional) →
  Gabor-Granger (revenue-maximizing point on one tier) → MaxDiff (rank
  features for tier placement) → conjoint (price bundles). —
  https://thesaaslibrary.com/pricing-research-methods-saas-founders/
- Value metric = the unit the price attaches to; "subscription vs usage" is
  a payment cadence question, not the metric. A good metric is understandable
  by the buyer, estimable before signing, and diverges from cost. 41% of
  software buyers cite unpredictable cost as the primary objection to
  usage pricing (2025 survey). — https://softwarepricing.com/blog/value-metric-decision/
- Score candidates on value connection, fairness/familiarity, predictability,
  scalability, billability; simulate on historical accounts. —
  https://www.pacepricing.com/blog/the-ultimate-guide-to-value-metrics-for-b2b-saas-pricing-monetization ·
  https://enablism.com/resources/value-metrics-for-b2b-pricing/ ·
  https://www.getmonetizely.com/articles/how-to-choose-the-right-saas-pricing-metric-with-value-metric-examples

## Lifecycle email

- Behavior-triggered sequences vs calendar drips: vendor-reported ~3–4× the
  click-through and up to ~30% higher conversion (Userpilot, Customer.io,
  Bessemer citations); no independent primary study — treat as direction. —
  https://www.digitalapplied.com/blog/saas-customer-onboarding-email-sequence-2026-crm-playbook ·
  https://ustechautomations.com/resources/blog/automate-saas-free-trial-onboarding-activation-2026
- Timers are the fallback for users with no signal; exit the sequence the
  moment the goal event fires; split expiry messaging by activated vs
  stalled. — https://www.getfluxly.com/blog/lifecycle-email-automation-saas
- 70–85% of trial-to-paid conversions happen in the second half of the
  trial; sequences that stop on day 7 of 14 under-perform. Cadence:
  activation push days 1–3, value reinforcement 4–10, conversion CTA 11–14. —
  https://www.growthspreeofficial.com/blogs/b2b-saas-trial-to-paid-conversion-rate-benchmarks-2026-by-trial-type-acv-length-credit-card
- Users without the core activation action inside 48 h carry the highest
  churn probability — the day-2 nudge is the highest-leverage single email. —
  https://ustechautomations.com/resources/blog/automate-saas-free-trial-onboarding-activation-2026

## Open-source monetization

- Managed cloud carries 48–73% of revenue at MongoDB, Confluent, Elastic; the
  cloud line grows faster than the company. GitLab open-core: 23% growth,
  117% NRR (Q1 FY27). Open-core self-host → paid conversion ~0.5–2%.
- Relicensing (Elastic, Redis) cost contributors to permanent forks and
  gained no visible revenue; both reversed. A license is a distribution
  decision; monetization is who runs the software.
- AGPL + commercial dual license is the proven open-core shape; some buyers
  (Google) ban AGPL outright. BSL / FSL are source-available, not OSI.
- https://www.saasmag.com/open-source-saas-monetization-license-product/
- https://ossalt.com/guides/open-core-vs-source-available-business-models-2026
- https://finitestate.io/blog/the-complete-guide-to-open-source-licenses
- https://fsl.software/

## Distribution

| Channel | Number | Source |
|---|---|---|
| Show HN front page (dev tool) | 5–30k visits, 50–400 signups, < 5% conv; #1 ≈ 300k daily uniques | Causo Hub 2026 |
| Show HN clearing 10 points | 62% (2022) → 11% (2025) | DoDataThings analysis |
| Show HN timing | 12–17 UTC, Tue–Thu; ~+200 GitHub stars vs off-peak | DoDataThings analysis |
| Product Hunt featured rate | 60–98% (2020–23) → ~10% | awesome-directories 2025; PH newsletter |
| Product Hunt B2B visit→signup | 1–2% | Causo Hub 2026 |
| Comparison pages in a pSEO test | 28% of pages → 78% of clicks, 6 of 7 leads | nicodigital, 162 pages |
| llms.txt | Google: zero effect on Search / AI Overviews (2026-06-15); AI crawlers rarely fetch it; coding assistants do read it on docs sites | digitalapplied 2026 |
| AI citations | third-party publishers earn 6.5× more citations than owned domains | geoaura 2026 |
| SaaS referral rate / referred conversion | 4.75% avg / 7.86%, top quartile 12%+ | bloop.plus |
| "Powered by" badge | 0.5–3% conversion, ~100% exposure; value-before-signup lifts referred conversion 2–5× | nativeviralloop |
| Warm invites (user-sent, named recipient) | 10–25% accept → signup | nativeviralloop |

- https://hub.causo.ai/guides/show-hn-launch-playbook-technical-founders-2026
- https://hub.causo.ai/guides/product-hunt-vs-hacker-news-vs-betalist-2026
- https://dodatathings.dev/blog/launch-platform-roi-the-math-nobody-shares
- https://news.ycombinator.com/showhn.html (rules: runnable thing, no signup wall, no vote solicitation)
- https://awesome-directories.com/blog/product-hunt-launch-guide-2025-algorithm-changes/
- https://www.producthunt.com/newsletters/archive/33951-the-roundup-is-product-hunt-dead
- https://www.nicodigital.com/technical-seo/programmatic-seo-experiment-162-pages/
- https://developers.google.com/search/docs/essentials/spam-policies (scaled content abuse covers AI-generated pages)
- https://www.digitalapplied.com/blog/google-llms-txt-no-seo-value-lighthouse-audit-2026
- https://nativeviralloop.com/knowledge/viral-loop-metrics.html
- https://www.reforge.com/blog/growth-loops

## Positioning and messaging

- Dunford order: competitive alternatives (incl. spreadsheets / do nothing)
  → unique attributes → value themes with proof → who cares most → market
  category → optional trend. — https://www.aprildunford.com/post/a-quickstart-guide-to-positioning
- Five-second test with ICP respondents: what is it, for whom, what outcome;
  "doppelganger" check with the logo removed. — https://www.electriccopy.tech/blog/how-to-test-messaging-on-a-budget
- North-star: classify the game (attention / transaction / productivity),
  define the value moment as a time-bound behavior, confirm it leads revenue
  and retention, pick 3–5 inputs with owners. — https://amplitude.com/blog/product-north-star-metric
- PQA (account fit + usage) says *when*; PQL (economic buyer present) says
  *whom*. — https://www.elenaverna.com/p/elenas-2024-b2b-product-led-sales

## Failure modes (why GTM plans die)

CB Insights, 431 VC-backed shutdowns since 2023: 43% poor product-market fit,
29% timing, 19% unit economics; 18% pricing, 14% marketing.

1. Building before validating — no ICP interviews.
2. Generic hero — fails the five-second test; written for investors.
3. Underpricing "to reduce friction".
4. No distribution hypothesis — "first-time founders focus on product, second-time on distribution".
5. Activation untracked (~66%) or defined as payment.
6. AI-generated content at scale — Google spam policy; HN removes AI-written posts.
7. Launching once instead of per release.
8. Reverse trial or AI credits as a fix — neither shows a conversion lift.

- https://www.cbinsights.com/research/report/startup-failure-reasons-top/
- https://github.com/dovzhikova/developer-tools-gtm-checklist
- https://gtm-labs.co/open-source-go-to-market (README first 10 lines = hero)
