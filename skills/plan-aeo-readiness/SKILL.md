---
name: plan-aeo-readiness
description: >
  Plan-only audit of answer-engine (AEO/GEO) citation readiness for ChatGPT,
  Perplexity, and AI Overviews. Use when "AEO", "GEO", "show up in
  ChatGPT/Perplexity", "AI search visibility", "llms.txt", or "am I blocking
  AI crawlers".
license: MIT
effort: high
---

# Answer-Engine Readiness Audit + Citation Plan

**Degree of freedom: HIGH** — crawl access, extractability, authority levers, plan.
Stay **plan-only**. No robots.txt, schema, or copy edits until approved.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **plan-aeo-readiness** (this) | Answer-engine / GEO citation plan |
| `enhance-web-seo` | Classic search meta / sitemap / OG |
| `plan-antislop` | Voice / slop in the copy itself |


**Role:** Senior growth engineer + content strategist (AEO/GEO lens).

**Task:** Confirm AI crawler access first, audit content extractability and authority
levers per key page, phase remediations, emit `plan-aeo-readiness.md`. **Audit & plan
only — no robots.txt, schema, or copy edits until approved.**

**Find why AI engines don't cite you. Plan the fix. Change nothing until approved.**

## How to reason (every plan item)

1. **Propose** — unblock a bot, SSR/expose, schema, or authority lever
2. **Risk** — engines never see the page, or they see it and have nothing to cite
3. **Keep-working** — pages already answer-first with valid schema
4. **Phase** — Unblock → Structure → Authority → Entity-measure (do not execute)

## Worked example

> **Propose:** allow GPTBot/PerplexityBot in robots.txt; add an FAQ JSON-LD block on `/pricing`.
> **Risk:** Cloudflare default blocks AI bots — citation frequency is zero until access exists.
> **Keep-working:** `/docs` is SSR and already direct-answer-first.
> **Phase:** Phase 1 — Unblock & expose.
> **Lever:** access before schema; do not promise a rank.

Ranking #1 on Google no longer buys an AI citation. Overlap between top Google links
and AI-cited sources has **dropped from ~70% to below 20%**. LLM-referred visitors
convert markedly better than classic search traffic (~4.4x in one 2026 analysis).

This skill targets *LLM citation* — distinct from SERP rank (`enhance-web-seo`).

---

## When this fires

Trigger phrases: *"do AI engines cite me"*, *"AEO"*, *"GEO"*, *"answer engine
optimization"*, *"show up in ChatGPT/Perplexity"*, *"AI search visibility"*,
*"llms.txt"*, *"am I blocking AI crawlers"*.

Do **not** fire for: classic Google ranking or Core Web Vitals alone
(`enhance-web-seo`). For Google AI Overviews, classic ranking is still often a
prerequisite — note and hand that layer to `enhance-web-seo`.

---

## The audit  [HIGH freedom]

### A · Can AI even read the site?
- **robots.txt** — GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and each engine's other current crawler tokens allowed? Check the engines' published token lists; the set changes.
- **CDN / Cloudflare** — AI-bot blocking can be on by default; if the site sits behind a CDN, confirm bot access with a live fetch.
- **SSR vs JS-hidden** — content behind client JS/login/paywall can't be cited.
- **llms.txt** — present? Recommend describing site structure for AI systems.

### B · Extractable & answer-shaped?
- **Direct-answer-first** — concise answer before context.
- **Heading hierarchy** — H1→H2→H3, one topic per section.
- **Schema markup** — FAQ, HowTo, Product, Review, Speakable JSON-LD valid.
- **Sub-query coverage** — answers likely fan-out sub-questions.

### C · Citable / authoritative? (Princeton GEO levers)
- **Expert quotes / attribution** (~+41% citation probability).
- **Statistics & data** (~+30%).
- **Inline citations** to authoritative sources (~+30%).
- **No keyword stuffing** (~-9%); hand AI-slop copy to `plan-antislop`.

### D · Entity & consensus (advisory)
- Brand consistency across crawled sources; platform presence gaps. Note only.

### E · Measurability
- Baseline citation monitoring across engines recommended.

---

## Procedure  [HIGH freedom — plan only]

1. **Crawl-access first** (A) — blocked bots = finding #1.
2. **Audit content shape & authority** (B, C) per key page.
3. **Note entity/measurability** (D, E).
4. **Score** by impact × effort.
5. **Emit `plan-aeo-readiness.md`, then end the turn** with a standalone recap in chat: the two or three highest-impact findings and the first phase to approve. The file is the deliverable — write it before the recap.

---

## Guardrails

- **Plan only.** No robots.txt, schema, or copy edits.
- **Access before optimization.**
- **Don't promise rankings** — frame as citation frequency, not fixed rank.
- **Authenticity over gaming** — real expertise, not manufactured quote-stuffing.
- **Cross-hand copy** to `plan-antislop`.

## Self-critique before the burndown  [LOW freedom — do not skip]

1. **evidenced-not-assumed** — robots/CDN/SSR checked on real URLs, not assumed open
2. **plan-only** — no robots.txt, schema, or copy edits
3. **severity/phase justified** — blocked bots are finding #1, not buried under schema polish
4. **right-owner** — classic meta/sitemap/OG → `enhance-web-seo`; slop copy → `plan-antislop`
5. **no-false-safety** — do not promise rankings; citation frequency only; no manufactured quote-stuffing

---

## Report template — `plan-aeo-readiness.md`

```markdown
# Answer-Engine Readiness Audit — <site>

_Audit-only. Nothing changes until each phase is approved._

## Scope
- Pages/routes audited: …  | Behind Cloudflare/CDN: ☐

## Verdict
| Area | Status | Worst gap |
|------|--------|-----------|
| AI crawler access | ❌ | GPTBot blocked |
| Content extractability | partial | answers buried |
| Authority levers | weak | no stats/quotes |

## Findings
| # | Page | Gap | Lever | Sev | Direction |
|---|------|-----|-------|-----|-----------|

## Phased burndown
- **Phase 1 — Unblock & expose** → `enhance-web-seo` — robots, CDN, SSR, llms.txt
- **Phase 2 — Structure & schema** → `enhance-web-seo` — direct-answer-first, JSON-LD
- **Phase 3 — Authority levers** → `docs-writer` — stats, quotes, citations
- **Phase 4 — Entity/measure (advisory)** → off-site + monitoring baseline

## Execution handoff
Set citation-monitoring baseline before/after so improvement is measured.
```

---

## Chains with

- **Launch gates loop** — growth/discoverability; run alongside `plan-mobile-readiness`.
- **`enhance-web-seo`** — classic ranking underpins AI Overviews.
- **`plan-antislop`** — generic copy suppresses citation.
- **Execution:** `enhance-web-seo`, `docs-writer`, `enhance-web-landing`.
- **Verify:** prompt-test target queries across engines before/after.

> Plan at high effort. Execute after approval at the default effort under `approved-plan-execution.mdc` (no reward hacking, no feature deletion).
