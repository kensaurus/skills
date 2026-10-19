---
name: audit-langfuse-llm
description: >
  PDCA quality audit of LLM features: traces, prompts, costs, evals,
  grounding, hallucination. Use for "audit LLM quality", "check Langfuse",
  or "audit AI costs". Jailbreaks → audit-llm-security. Cost caps →
  plan-llm-cost-guardrails.
license: MIT
effort: high
---

# Langfuse LLM Quality Audit

**Degree of freedom: MIXED** — Phases 0–1, 4 `[HIGH freedom]`; Phases 2–3
CLI traces and playwright `[LOW freedom — run exactly]`. Read
`protocol-browser-anti-stall` before any browser step. Phase 0 first: Phases 2–3 verify the feature map it produces.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-langfuse-llm** (this) | PDCA quality audit of LLM features: traces, prompts, costs, evals, grounding |
| `audit-llm-security` | Read-only OWASP LLM Top 10 audit: prompt injection, leakage, unsafe agency |
| `plan-llm-cost-guardrails` | Plan-only audit of runaway LLM cost and quota-abuse exposure |

## How to reason

1. **Observe** — quote the trace, prompt version, token/cost, or live output
2. **Interpret** — is quality, cost, or the pipeline actually broken?
3. **Classify** — missing-trace / prompt / cost / eval / grounding / correct
4. **Severity** — pipeline break or untraced prod feature = P0; cost/eval gap = P1

## Worked example

> **Observe:** after Playwright chat, `langfuse-cli api traces list` shows no new
> row; `app/api/chat/route.ts` calls `openai.chat` with no Langfuse wrap.
> **Interpret:** the live path is uninstrumented — the static map was wrong.
> **Classify:** missing instrumentation (pipeline break).
> **Severity:** P0 — prod chat is invisible.
> **Finding:** chat | P0 | no trace after live send | wrap the SDK call.

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Concrete numbers** — model + $/call or tokens, not "costs seem high"
2. **Live, not static** — trigger the feature; missing post-trigger trace = P0
3. **Severity justified** — P0 = pipeline break or untraced user-facing call
4. **Right owner** — jailbreak/OWASP → `audit-llm-security`; token caps → `plan-llm-cost-guardrails`
5. **Keys stay in env** — report host + presence, never secret values

---

## Phase 0: Auto-Detect Langfuse Integration

### 0a. Find Langfuse Configuration

Search for environment variables and config files (in order):

1. `.env`, `.env.local`, `.env.production` — look for `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL`, `LANGFUSE_HOST`
2. `langfuse.config.ts`, `langfuse.config.js` — dedicated config files
3. `instrumentation.ts` / `instrumentation.js` — Next.js instrumentation with Langfuse
4. Supabase Edge Functions — `Glob("**/supabase/functions/**/index.ts")` and search for `Langfuse` imports

```
Grep(pattern: "LANGFUSE_PUBLIC_KEY|LANGFUSE_SECRET_KEY|LANGFUSE_BASE_URL|LANGFUSE_HOST", glob: ".env*")
Grep(pattern: "langfuse|Langfuse|@langfuse", glob: "*.{ts,js,tsx,jsx,py,rb,go}")
```

Record: `LANGFUSE_HOST`, public-key present (never the secret), import sites, CLI env ready.

### 0b. Detect LLM Framework and Provider

```
Grep(pattern: "openai|OpenAI|anthropic|Anthropic|@google/generative-ai|gemini|cohere|mistral|groq|together|replicate", glob: "*.{ts,js,py}")
Grep(pattern: "langchain|LangChain|@langchain|vercel/ai|ai/core|createOpenAI|createAnthropic", glob: "*.{ts,js,py}")
```

Record: providers, frameworks, and the exact model ID strings in use, with each one's tier (frontier, mid, or small).

### 0c. Map AI Features

```
SemanticSearch(query: "Where are LLM/AI features called in the codebase?", target_directories: [])
```

Build a feature map:
| Feature | File(s) | Provider | Model | Traced? |
|---------|---------|----------|-------|---------|
| _e.g. Chat_ | `app/api/chat/route.ts` | OpenAI | `<model id>` (frontier) | Yes |

### 0d. Detect Eval and Prompt Management Setup

```
Grep(pattern: "createScore|langfuse.score|annotation|eval|judge|dataset", glob: "*.{ts,js,py}")
Grep(pattern: "getPrompt|langfuse.prompt|fetchPrompt|compilePrompt", glob: "*.{ts,js,py}")
```

Record: prompt source (Langfuse vs hardcoded vs config), eval setup, version/label.

---

## Phase 1: Research LLM Best Practices

### 1a. Firecrawl Research

```json
firecrawl:firecrawl_search
{
 "query": "LLM observability best practices production monitoring [current year]",
 "limit": 5
}
```

```json
firecrawl:firecrawl_search
{
 "query": "prompt engineering evaluation scoring hallucination detection [current year]",
 "limit": 5
}
```

```json
firecrawl:firecrawl_search
{
 "query": "LLM cost optimization token usage model selection production [current year]",
 "limit": 5
}
```

Scrape the top 2–3 results:

```json
firecrawl:firecrawl_scrape
{
 "url": "<BEST_RESULT_URL>",
 "formats": ["markdown"]
}
```

### 1b. Langfuse Documentation

Langfuse docs for the detected setup:

```json
firecrawl:firecrawl_search
{
 "query": "site:langfuse.com docs tracing prompts evaluation scores",
 "limit": 5
}
```

### 1c. Context7 for LLM Framework Docs


```json
context7:resolve-library-id
{
 "libraryName": "<DETECTED_FRAMEWORK e.g. langchain or vercel-ai>"
}
```

```json
context7:query-docs
{
 "libraryId": "<RESOLVED_ID>",
 "query": "Langfuse integration tracing observability"
}
```

---

## Phase 2: Audit via Langfuse CLI

Shell + Langfuse CLI. Require `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` in the env.

### 2a. Trace Completeness

```bash
npx langfuse-cli api traces list --limit 50
```

For each AI feature identified in Phase 0c, verify:
- [ ] Trace exists with a matching name/metadata
- [ ] Trace has spans/generations (not just a top-level trace with no children)
- [ ] Trace includes input/output (not empty)
- [ ] Trace has proper metadata (userId, sessionId, tags)
- [ ] Latency is recorded

**Red flags:**
- AI feature exists in code but produces no traces → **missing instrumentation**
- Traces exist but have no generations → **incomplete tracing** (wrapper created but LLM call not captured)
- Traces with empty output → **output not being captured** (fire-and-forget pattern)

### 2b. Prompt Quality Audit

```bash
npx langfuse-cli api prompts list
```

For each prompt:

```bash
npx langfuse-cli api prompts get --name "<PROMPT_NAME>"
```

Evaluate:
- [ ] **Versioning**: Are prompts versioned (v1, v2, v3+) or stuck at v1?
- [ ] **Labels**: Is there a `production` label? Are there `staging`/`experiment` labels for A/B testing?
- [ ] **System message quality**: Clear role definition, constraints, output format instructions?
- [ ] **Few-shot examples**: Does the prompt include examples for complex tasks?
- [ ] **Guardrails**: Does the prompt include instructions to refuse off-topic/harmful requests?
- [ ] **Variables**: Are dynamic parts properly templated with `{{variables}}` not string concatenation?
- [ ] **Freshness**: When was the prompt last updated? Stale prompts may not use newer model capabilities.

If prompts are hardcoded in source code instead of managed via Langfuse:

```
Grep(pattern: "You are|system.*message|systemPrompt|SYSTEM_PROMPT", glob: "*.{ts,js,py}")
```

Flag hardcoded prompts as a finding — they should be migrated to Langfuse for versioning and A/B testing.

### 2c. Model and Cost Efficiency

From trace data, analyze:

```bash
npx langfuse-cli api traces list --limit 50
```

Build a cost table from generation details (model, tokens, latency, cost):
| Feature | Model | Avg Input Tokens | Avg Output Tokens | Avg Latency | Est. Cost/Call |
|---------|-------|------------------|-------------------|-------------|----------------|

**Red flags:**
- Frontier-tier model used for simple classification/extraction → **recommend the provider's small tier**
- High input token counts → **check for unnecessary context stuffing**
- Output tokens much larger than needed → **add an output-token cap or response format constraints**
- High latency on user-facing features → **consider streaming, caching, or smaller model**
- Same content sent repeatedly → **implement semantic caching**

### 2d. Eval Score Health

```bash
npx langfuse-cli api scores list --limit 50
```

Evaluate:
- [ ] **Score existence**: Are evals running at all?
- [ ] **Score types**: What's being measured (relevance, faithfulness, toxicity, custom)?
- [ ] **Score distribution**: Are scores clustered (all 1.0 = useless eval) or distributed?
- [ ] **Annotation queues**: Are humans reviewing AI outputs?
- [ ] **Judge LLM**: If using LLM-as-judge, which model? Is the judge prompt well-designed?

**Red flags:**
- No scores at all → **no quality feedback loop**
- Only manual scores, no automated → **quality is not continuously monitored**
- All scores are identical → **eval criteria too loose or rubric too vague**
- Scores declining over time → **model degradation or prompt drift**

### 2e. Session and User Attribution

```bash
npx langfuse-cli api sessions list --limit 20
```

Verify:
- [ ] Sessions group related interactions (multi-turn conversations have one session ID)
- [ ] User IDs are attributed (not all anonymous)
- [ ] Session metadata is useful (page, feature, user segment)

### 2f. Dataset Health

```bash
npx langfuse-cli api datasets list
```

Evaluate:
- [ ] **Datasets exist**: Are there regression test datasets?
- [ ] **Dataset freshness**: When were items last added?
- [ ] **Coverage**: Do datasets cover all AI features or just one?
- [ ] **Expected outputs**: Do dataset items have expected outputs for automated comparison?

---

## Phase 3: Live Verification

### 3a. Trigger AI Features via Playwright

For each Phase 0c feature, trigger it live. Timeouts 15s; `sleep 2` → `snapshot` (not one long block).

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=langfuse-audit open --headed "<APP_URL>"
```

Navigate to the feature, interact with it (fill form, click button, send message), and capture:
- The AI-generated response (via `snapshot`)
- Console messages (via `console`) — look for errors
- Network requests (via `requests`) — look for failed API calls

### 3b. Verify Trace Pipeline

After triggering each feature, wait 5-10 seconds, then verify the trace landed:

```bash
npx langfuse-cli api traces list --limit 5
```

Check:
- [ ] New trace appeared with correct name
- [ ] Trace has generations with model and token data
- [ ] Trace latency matches observed UX latency
- [ ] Input/output captured correctly

### 3c. Cross-Check with Sentry

```json
sentry:search_issues
{
 "organizationSlug": "<ORG_SLUG>",
 "projectSlugOrId": "<PROJECT_SLUG>",
 "query": "is:unresolved ai OR llm OR openai OR anthropic OR langfuse OR completion OR embedding"
}
```

Check for:
- LLM timeout errors
- Rate limiting (429) errors
- Token limit exceeded errors
- Langfuse SDK errors (failed to send trace)
- JSON parse errors on LLM responses

### 3d. Cross-Check with Supabase (if AI results stored in DB)

If the project stores AI outputs in the database:

```json
supabase:list_tables
{
 "schemas": ["public"]
}
```

Find tables that store AI outputs and verify data landed:

```json
supabase:execute_sql
{
 "query": "SELECT id, created_at, <ai_output_column> FROM <table> ORDER BY created_at DESC LIMIT 5"
}
```

### 3e. Grounding / Hallucination Check

For features where the AI should reference source data (RAG, summarization, data extraction):

1. Get the source data from the database (Supabase `execute_sql`)
2. Trigger the AI feature via Playwright
3. Compare the AI output against the source data

**Red flags:**
- AI mentions facts not in the source data → **hallucination**
- AI omits critical facts from the source data → **incomplete extraction**
- AI contradicts the source data → **grounding failure**
- AI generates plausible but wrong numbers → **numerical hallucination**

---

## Phase 4: Report

Generate a structured report with the following sections.

```
═══════════════════════════════════════════════════════
 LANGFUSE LLM QUALITY AUDIT REPORT
 Project: <PROJECT_NAME>
 Date: <DATE>
 Langfuse Host: <HOST_URL>
═══════════════════════════════════════════════════════

## 1. TRACE COVERAGE

| Feature | Traced? | Generations? | Input/Output? | Metadata? | Status |
|---------|---------|-------------|---------------|-----------|--------|
| ... | ... | ... | ... | ... | ✅/❌ |

Coverage: X/Y features traced (Z%)
Missing instrumentation: [list features with no traces]

## 2. PROMPT QUALITY

| Prompt | Version | Label | System Msg | Few-Shot | Guardrails | Variables | Score |
|--------|---------|-------|------------|----------|------------|-----------|-------|
| ... | ... | ... | ... | ... | ... | ... | A-F |

Hardcoded prompts found: [list files with inline prompts]
Recommendations: [specific improvements per prompt]

## 3. COST EFFICIENCY

| Feature | Model | Avg Tokens (in/out) | Avg Latency | Est. Cost/Call | Recommendation |
|---------|-------|---------------------|-------------|----------------|----------------|
| ... | ... | ... | ... | ... | ... |

Monthly estimate: $X (at current usage rate)
Savings opportunity: $Y (by implementing recommendations)

## 4. EVAL HEALTH

| Metric | Status | Details |
|------------------|-----------|----------------------------------|
| Automated evals | ✅/❌ | [count and types] |
| Manual reviews | ✅/❌ | [annotation queue status] |
| Score distribution| ✅/❌ | [healthy spread vs clustered] |
| Datasets | ✅/❌ | [count, freshness, coverage] |
| Regression tests | ✅/❌ | [dataset run frequency] |

## 5. PIPELINE INTEGRITY

| Step | Status | Evidence |
|-------------------------|--------|-------------------------------------|
| FE triggers AI feature | ✅/❌ | [Playwright observation] |
| API receives request | ✅/❌ | [network request captured] |
| LLM call executes | ✅/❌ | [trace generation exists] |
| Trace lands in Langfuse | ✅/❌ | [CLI verification] |
| Result stored in DB | ✅/❌ | [Supabase query result] |
| Result displayed in FE | ✅/❌ | [Playwright snapshot] |
| Eval score recorded | ✅/❌ | [score attached to trace] |

## 6. GROUNDING & HALLUCINATION

| Feature | Source Data | AI Output Match | Hallucinations | Score |
|---------|-------------|-----------------|----------------|-------|
| ... | ... | ... | ... | A-F |

## 7. SENTRY LLM ERRORS

| Issue | Error Type | Events | Impact | Fix Needed |
|-------|------------|--------|--------|------------|
| ... | ... | ... | ... | ... |

## 8. CRITICAL FINDINGS (Action Required)

P0 — Must fix immediately:
1. [finding with evidence]

P1 — Should fix this sprint:
1. [finding with evidence]

P2 — Improvement opportunity:
1. [finding with evidence]

## 9. RECOMMENDATIONS

| # | Category | Current State | Recommended State | Effort | Impact |
|---|----------|---------------|-------------------|--------|--------|
| 1 | ... | ... | ... | S/M/L | S/M/L |

## 10. PDCA IMPROVEMENT RESULTS

| Prompt | Baseline Score | Iter 1 Score | Iter 2 Score | Iter 3 Score | Final Score | Action Taken |
|--------|---------------|-------------|-------------|-------------|-------------|--------------|
| ... | ... | ... | ... | ... | ... | Promoted / Rolled back / Needs manual |
```

## Further reading

- [Improvement Details and more](references/details.md)

## Related

- `audit-llm-security` — OWASP LLM Top 10 (injection, agency, leaks) — not quality/evals
- `plan-llm-cost-guardrails` — token budgets and quota abuse
- `plan-privacy-compliance` — PII in traces
- `backend-observability` / `debug-sentry-monitor` — non-LLM telemetry

