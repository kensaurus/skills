---
name: backend-observability
description: >
  Implement correlated errors, traces, and structured logs with PII redaction.
  Use when "add logging", "instrument this", or wiring Sentry/Langfuse.
  Plan-only audit → plan-error-handling. Sentry triage → debug-sentry-monitor.
license: MIT
---

# Observability Instrumentation

**Degree of freedom: MIXED.** What to wrap and alert on `[HIGH freedom]`;
correlation ids, PII redaction, and the DoD `[LOW freedom — run exactly]`.

## How to reason

1. **Observe** — which ids, logs, spans, and PII already exist
2. **Interpret** — can you pivot error ↔ trace ↔ log ↔ user from any one?
3. **Classify** — add-correlation / convert-console / redact / wrap-span / alert
4. **Severity** — uncorrelated prod 500 outranks a missing debug field

## Worked example

> **Observe:** checkout 500 in Sentry has no request_id; pino logs the cart id; no LLM (Langfuse unused).
> **Interpret:** cannot pivot error → logs; webhook still `console.log`s.
> **Classify:** ALS request_id on logs + `Sentry.setTag`; convert console to pino; redact `Authorization`.
> **Verify:** one id on the Sentry event and the log line; `beforeSend` strips the header.

## Self-critique before reporting

- **Correlated** — same request/trace id on the log, Sentry, and Langfuse
- **Redacted** — deny-list at the logger + `beforeSend`, not per-call hope
- **Leveled** — no `console.log` in prod; handled paths are not `error`
- **Right owner** — plan-only audit → `plan-error-handling`; investigate a Sentry issue → `debug-sentry-monitor`

> The build-time counterpart to your monitoring stack. The Sentry plugin installs the SDK; `debug-sentry-monitor` triages after the fact; `audit-langfuse-llm` audits LLM traces. This skill is about instrumenting **correctly while you build** so those tools have signal to work with — and so a 3am incident is debuggable.

## When this fires
Adding logging / tracing / metrics to new code, reviewing instrumentation, or fixing "we can't tell what happened in prod." Not for installing an SDK (use the Sentry/Langfuse plugins) or post-hoc triage (use the monitor/audit skills).

## The one rule that matters most: correlation  [LOW freedom — run exactly]
A prod incident is only debuggable if you can pivot **error ↔ trace ↔ log ↔ user** from any one of them. Make every layer share an id.

- Generate/propagate a **request id** (or OTel `trace_id`) at the entry point (HTTP middleware, edge function, job start). Put it in async context (`AsyncLocalStorage` / context var), not a parameter threaded everywhere.
- **Stamp it on everything:** every log line, Sentry `setTag("request_id", id)` / `setContext`, and the Langfuse trace (`trace.id` or metadata). On an LLM error, attach the Langfuse trace URL to the Sentry event so you jump straight from the error to the prompt/response.
- Set user/session/tenant scope (`Sentry.setUser`, Langfuse `userId`/`sessionId`) — scrubbed (see redaction).

## Structured logging discipline  [HIGH freedom]
- **Structured, not string-soup.** Emit JSON with stable fields (`level`, `msg`, `request_id`, `event`, domain ids). One event per line. Use the platform logger (pino / structlog / slog), not bare `console.log`.
- **Levels mean things:** `error` = needs a human; `warn` = degraded but handled; `info` = state transitions / business events; `debug` = dev-only, off in prod. Don't log `error` for handled flow.
- **No `console.log` shipped to prod** — it's unsearchable, unleveled, and a PII leak risk. Remove or convert to a leveled structured log.
- **Log decisions, not noise:** log the branch taken + key inputs/outputs at boundaries, not every line. A log you'd never grep is cost, not signal.

## PII / secret redaction (non-negotiable)  [LOW freedom — run exactly]
- Never log tokens, passwords, API keys, full PANs, auth headers, or raw request bodies. Redact at the logger/transport layer (deny-list keys + pattern scrub) so it can't be bypassed per-call.
- Configure Sentry `beforeSend` / data-scrubbing and Langfuse masking to strip PII from events/traces. Assume anything you put in a span/breadcrumb may be retained.
- For LLM traces: decide explicitly whether prompts/completions may contain PII; mask or hash before sending if the jurisdiction requires it.

## Tracing / spans (what to wrap)  [HIGH freedom]
- Wrap **boundaries and slow/fallible work**: inbound request, outbound HTTP/DB/queue calls, LLM calls, background jobs. Not every function.
- Name spans by operation (`http.server`, `db.query`, `llm.generate`), add attributes (route, status, row count, model) — follow **OTel semantic conventions**, including the **GenAI conventions** for LLM spans (model, tokens in/out, cost, latency, temperature).
- **Sampling:** you don't need 100%. Head-sample normal traffic (e.g. 10–20%), but **always keep errors and slow outliers**. Document the rate; it's a cost/visibility dial.

## LLM-specific (Langfuse)  [HIGH freedom]
- Capture per generation: prompt, response, model, input/output tokens, cost, latency, and the eval/score if you run one. Group multi-step agents under one trace with nested spans.
- Link the Langfuse `trace_id` into the surrounding request id and into Sentry on failure — so an LLM error in Sentry is one click from the full trace.
- Tag traces with `userId` / `sessionId` / release so `audit-langfuse-llm` can slice quality by cohort.

## Alerts & SLOs (signal, not noise)  [HIGH freedom]
- Alert on **symptoms users feel** (error-rate spike, p95 latency, checkout/login failure, LLM eval-score drop), not every error. A pager that cries wolf gets muted.
- Define a few SLOs (availability, latency, key-flow success) and alert on burn rate, not raw counts.
- Every alert names an owner and a first action. Route via `sentry-create-alert` / your channel.

## Definition of done  [LOW freedom — do not skip]
- [ ] A shared request/trace id is on every log line, the Sentry scope, and the Langfuse trace.
- [ ] From a prod error you can reach the trace, the logs, and the user in ≤2 clicks.
- [ ] Logs are structured + correctly leveled; no `console.log` shipped to prod.
- [ ] PII/secret redaction is enforced at the logger + Sentry `beforeSend` + Langfuse masking.
- [ ] Spans cover boundaries with OTel-conventional names/attributes; errors are never sampled out.
- [ ] LLM generations record model/tokens/cost/latency and link back to the request id.
- [ ] Alerts fire on user-felt symptoms with an owner, not on every error.

## Composes with
- Sentry plugin (`sentry-sdk-setup`, `sentry-setup-ai-monitoring`, `sentry-create-alert`, `sentry-otel-exporter-setup`) — SDK + alert wiring.
- Langfuse plugin (`langfuse`) + `audit-langfuse-llm` — LLM trace capture + quality audit.
- `debug-sentry-monitor` / `debug-error` — post-hoc triage of what this instrumentation surfaces.
- `data-pipeline` — per-run pipeline metrics use these same correlation + logging rules.
- `workflow-spec-tdd` — make "observable" part of the spec's "done when", not an afterthought.
