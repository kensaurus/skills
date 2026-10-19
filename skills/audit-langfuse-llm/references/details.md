# audit-langfuse-llm: Phase 5 details

## Contents

- Iteration log entry template (the fenced block directly below)
- [Phase 5: Prompt Improvement Cycle (PDCA)](#phase-5-prompt-improvement-cycle-pdca)
  - 5a Capture baseline
  - 5b DO: improve the prompt
  - 5c CHECK: trigger and verify via Playwright
  - 5d CHECK: score comparison
  - 5e ACT: promote or rollback
  - 5f Iteration log

```
### Improvement Details

**[Prompt Name] — Iteration 1:**
- Change: [what was changed and why]
- Result: Score [X] -> [Y] ([+/-Z%]), Latency [A]ms -> [B]ms, Cost $[C] -> $[D]
- Evidence: Langfuse trace ID [ID], Playwright screenshot [ref]

**[Prompt Name] — Iteration 2:**
- Change: [next improvement attempt]
- Result: ...

═══════════════════════════════════════════════════════
```

---

## Phase 5: Prompt Improvement Cycle (PDCA)

After the audit report identifies prompt weaknesses, run an iterative improvement cycle for each
flagged prompt. This is the **Do-Check-Act** loop that turns audit findings into measurable improvements.

> **Max 3 iterations per prompt.** If no improvement after 3 attempts, log as "needs manual prompt engineering" and move on.

> **Always capture baseline BEFORE making changes.** Without a baseline, you cannot measure improvement.

> **Never promote a prompt version that scores worse than baseline.** The goal is monotonic improvement.

### 5a. Capture Baseline

For each prompt flagged in Phase 2b (Prompt Quality Audit), record the current state:

```bash
npx langfuse-cli api prompts get --name "<PROMPT_NAME>"
```

Record:
- **Current version number** and **label** (e.g., v3, label: `production`)
- **Current eval scores** from Phase 2d (average score, score distribution)
- **Current cost metrics** from Phase 2c (model, avg tokens, avg latency, est. cost/call)
- **Specific weaknesses** identified in the audit (missing guardrails, no few-shot, vague instructions, etc.)

Build a baseline table:

| Prompt | Version | Avg Score | Avg Latency | Avg Cost | Weaknesses |
|--------|---------|-----------|-------------|----------|------------|
| ...    | ...     | ...       | ...         | ...      | ...        |

### 5b. DO: Improve the Prompt

For each flagged prompt, create an improved version based on the audit findings.

**Step 1: Research the specific improvement needed**

```json
firecrawl:firecrawl_search
{
  "query": "<WEAKNESS_TYPE> prompt engineering best practices [current year]",
  "limit": 5
}
```

Example queries by weakness type:
- Missing guardrails: `"LLM safety guardrails system prompt best practices [current year]"`
- No few-shot: `"few-shot prompting examples for <TASK_TYPE> [current year]"`
- Vague instructions: `"prompt engineering specific instructions examples structured output [current year]"`
- Wrong model: `"<TASK_TYPE> model selection small tier vs frontier tier <PROVIDER> [current year]"`

Scrape the top 1-2 results for concrete patterns:

```json
firecrawl:firecrawl_scrape
{
  "url": "<BEST_RESULT_URL>",
  "formats": ["markdown"],
  "onlyMainContent": true
}
```

**Step 2: Draft the improved prompt**

Apply the researched improvements. Common enhancement patterns:
- **Add role definition**: "You are a [specific role] with expertise in [domain]."
- **Add output format**: "Respond in JSON with the following schema: {...}"
- **Add guardrails**: "If the user asks about [off-topic], respond with [refusal]."
- **Add few-shot examples**: Include 2-3 input/output pairs for complex tasks
- **Use native reasoning**: turn on the provider's reasoning mode (Anthropic adaptive thinking plus `effort`, OpenAI reasoning models) instead of adding "Think step by step" to the prompt — reasoning models already do it, and on the rest the phrase mostly lengthens output.
- **Shape the output**: name the audience and the format; cap length with the request's output-token limit (`max_tokens` on Anthropic, `max_completion_tokens` or `max_output_tokens` on OpenAI) rather than a word count in the prompt, which starves reasoning on hard inputs.
- **Add grounding instructions**: "Only use information from the provided context. If unsure, say so."

**Step 3: Create the new version**

If prompts are managed in Langfuse:

```bash
npx langfuse-cli api prompts create --name "<PROMPT_NAME>" --prompt "<IMPROVED_PROMPT_TEXT>" --labels experiment
```

This creates a new version with the `experiment` label (not `production` — we test first).

If prompts are hardcoded in source code:
1. Read the file containing the prompt
2. Edit the prompt text in place (StrReplace in Cursor, Edit in Claude Code)
3. Record the file path and the change for potential rollback

### 5c. CHECK: Trigger and Verify via Playwright

**Important**: Apply the `protocol-browser-anti-stall` protocol for all browser interactions.

**Step 1: Trigger the AI feature**

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=langfuse-audit open --headed "<APP_URL>"
```

Navigate to the feature that uses this prompt. Interact with it (fill form, click button, send message).

Capture:
- AI-generated response via `snapshot`
- Console errors via `console`
- Network requests via `requests`
- Screenshot via `screenshot` (visual evidence for the report)

**Step 2: Repeat N=3 times minimum**

Trigger the feature at least 3 times with different inputs to get a representative sample.
Vary the inputs to test edge cases relevant to the improvement (e.g., if you added guardrails,
test with an off-topic input).

**Step 3: Verify traces landed in Langfuse**

Wait 5-10 seconds after each trigger, then:

```bash
npx langfuse-cli api traces list --limit 10
```

For each new trace, verify:
- [ ] Trace uses the new prompt version (check metadata or generation details)
- [ ] Input/output captured correctly
- [ ] Generation includes model, token usage, latency

### 5d. CHECK: Score Comparison

**Option A: If Langfuse datasets exist** (preferred — most rigorous)

Run the dataset experiment with the new prompt version vs the old:

```bash
npx langfuse-cli api datasets list
```

If a relevant dataset exists, use Langfuse's Experiment feature (via UI or SDK) to run both
prompt versions against the same dataset and compare scores side-by-side.

**Option B: If LLM-as-a-Judge evaluators are configured**

Check if automated eval scores have been generated for the new traces:

```bash
npx langfuse-cli api scores list --limit 20
```

Compare the scores attached to new traces (experiment version) vs old traces (production version).

**Option C: Live trace comparison (minimum viable)**

From the N=3+ triggers in Step 5c, compare the new traces against baseline:

| Metric | Baseline (avg) | New Version (avg) | Delta | Verdict |
|--------|---------------|-------------------|-------|---------|
| Eval score | ... | ... | +/-% | Better / Worse / Same |
| Latency | ...ms | ...ms | +/-% | Better / Worse / Same |
| Input tokens | ... | ... | +/-% | Better / Worse / Same |
| Output tokens | ... | ... | +/-% | Better / Worse / Same |
| Est. cost/call | $... | $... | +/-% | Better / Worse / Same |
| Grounding accuracy | ... | ... | +/-% | Better / Worse / Same |

### 5e. ACT: Promote or Rollback

Based on the score comparison:

**Score improved (any eval metric improved, no metric degraded):**
- If Langfuse-managed: promote the new version to `production` label
- If hardcoded: keep the source code change, commit it
- Log the improvement in the report

**Score unchanged (no significant difference):**
- Keep the new version as `staging` for further observation
- Document why the improvement didn't move the needle
- Try a different improvement strategy in the next iteration

**Score degraded (any eval metric worsened):**
- If Langfuse-managed: do NOT change labels — the `production` label stays on the old version
- If hardcoded: revert the source code change with the same edit tool, using the path and text recorded in 5b step 3
- Document what went wrong and why

**Repeat the cycle** from Step 5b with a different strategy if the score target has not been met
and iterations remain (max 3).

### 5f. Iteration Log

Track all iterations in a structured log:

```
PDCA ITERATION LOG — [Prompt Name]

Baseline: v[N], score [X], latency [Y]ms, cost $[Z]/call

--- Iteration 1 ---
Strategy: [what was changed and why]
Changes: [specific edits to the prompt]
Result: score [X1], latency [Y1]ms, cost $[Z1]/call
Delta: score [+/-A%], latency [+/-B%], cost [+/-C%]
Verdict: [PROMOTE / CONTINUE / ROLLBACK]

--- Iteration 2 ---
Strategy: [different approach based on Iteration 1 results]
...

--- Iteration 3 (final) ---
...

FINAL OUTCOME: [Promoted vN+K to production / No improvement — needs manual engineering]
```
