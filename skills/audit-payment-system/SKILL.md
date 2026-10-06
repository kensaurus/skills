---
name: audit-payment-system
description: >
  Read-only audit of payment and money-movement code, scoped from Stripe
  Checkout to in-house ledgers. Use when "audit payment system", "double
  charge / idempotency", "ledger / reconciliation", or "webhook / 3DS / PCI".
  IAP → audit-monetization-iap.
license: MIT
effort: high
---

# audit-payment-system — Money-Movement Correctness & Compliance Audit

**Degree of freedom: MIXED** — Scope, matrix, and severity `[HIGH freedom]`;
Phase 0 detection searches `[LOW freedom — run exactly]`. **Do not write
exploit or payment-fraud PoCs** — quote the missing control, never a replay
or spoof recipe.

Read-only. Assess and prioritize; do not change code. Payment code is a
STOP-and-confirm surface — findings feed a human-reviewed remediation run at
high effort with a fresh-context reviewer. Delegations: per-call resilience → **`audit-resilience`**;
PCI/secrets/authz → **`audit-security`**; ledger schema → **`audit-db-schema`**;
outbox/saga *structure* → **`audit-backend-architecture`**; append-only
integrity → **`plan-data-integrity`**; Stripe integration → the Stripe plugin
skills. This skill owns *payment-domain correctness*.

Payment failures are silent: a retried charge is a double-charge, a lost ledger
write is vanished money, a logged PAN is PCI liability, an unverified webhook
is an untrusted "paid". Three pillars: **idempotency**, a **double-entry
ledger** (when in scope), **reconciliation** — plus **PCI DSS v4.0.1** and
**webhooks as source of truth** (never trust the sync API response alone).

---

## Core principle — earn each control by scope; every gap is money or liability

Not every app needs an in-house double-entry ledger. Stripe Checkout offloads
ledger, settlement, and most PCI — flagging "no double-entry ledger" there is
noise. **Idempotency, webhook verification, state sync, and tokens-only** apply
to *everyone* who moves money. Gate depth by scope (Phase 0). **Critical = a
customer is charged twice, money is lost/unaccounted, or card data is
exposed.** There is no "low severity" for a double-charge.

## How to reason — Observe → Interpret → Classify → Severity

1. **Observe** — quote the mutation/webhook/ledger `file:line` (or "searched, none found")
2. **Interpret** — what money or liability path breaks if that control is missing?
3. **Classify** — Implemented / Partial / Missing / N/A (tier reason); control id (A1–G4)
4. **Severity** — double-charge, lost money, or PAN/CVV exposure = Critical; P2-only rows are N/A on P0

## Worked example

> **Observe:** P0 Stripe Checkout. `POST /api/checkout` calls
> `paymentIntents.create` with no idempotency key and no unique business-intent
> constraint (`app/api/checkout/route.ts`). Webhook handler updates order status
> from the parsed body without `constructEvent` / signature verification
> (`app/api/stripe/route.ts`).
> **Interpret:** a network retry can create two PaymentIntents for one checkout;
> an unverified webhook is not a trusted state change.
> **Classify:** Missing A1 + Missing C2. Ledger rows B* are N/A (P0).
> **Severity:** Critical — double-charge and untrusted "paid" are in-scope.
> **Finding:** A1+C2 | checkout + webhook routes | Critical | add intent-scoped
> idempotency + verify-then-process. Do not demonstrate a replay or spoof.

---

## Phase 0 — Detect payment surfaces & scope (gates every later finding)  [LOW freedom — run exactly]

Find the money paths and the provider first. Never report an in-house-ledger
control as "Missing" on a pure merchant-integrator (`N/A` with a reason).

```bash
# Provider / SDK
rg -n --hidden -g '!node_modules' -i "stripe|paypal|braintree|adyen|square|payjp|paypay|razorpay|checkout\.com|worldpay|mollie|@stripe/|payment_intent|paymentintent" -l
# Money-movement verbs
rg -n -i "\b(charge|capture|authoriz|refund|void|payout|settle|chargeback|dispute|reversal)\b" -l
# Webhook endpoints + signature
rg -n -i "webhook|/webhooks?|constructEvent|verifyHeader|Stripe-Signature|x-signature|hmac" -l
# Idempotency
rg -n -i "idempotenc|idempotency[-_]?key|Idempotency-Key" -l
# Ledger / accounting
rg -n -i "ledger|double[-_ ]entry|debit|credit|journal|balance|posting|book(keeping)?" -l
# Reconciliation / settlement
rg -n -i "reconcil|settlement|settle|payout report|balance_transaction|three[-_ ]way" -l
# Money type (float smell = red flag)
rg -n -i "amount|price|money|currency|minor[-_ ]unit|cents" -g '*.{ts,tsx,js,py,go,java,rb,cs,sql}' -l
# Fraud / risk / SCA
rg -n -i "fraud|risk|velocity|3ds|3-?d ?secure|sca|radar|device.?fingerprint" -l
# Card-data smell (should find NOTHING raw)
rg -n -i "card[-_ ]?number|\bpan\b|cvv|cvc|card\.number|primary_account" -l
```

Record a **payment profile** and pick the tier — apply only in-scope rows:

| Tier | Signals | In scope |
|---|---|---|
| **P0 — Merchant integrator** | uses hosted Checkout / PaymentIntents / a PSP SDK; PSP holds the money & ledger | Idempotency on mutations, webhook verify+dedup, payment-state sync (pull-based recovery), refund/void idempotency, tokens-only/PCI-SAQ scope, light recon vs PSP dashboard, resilience around PSP calls |
| **P1 — Platform / marketplace** | Connect-style split payments, payouts to sellers, multi-party balances | + payout/clawback **saga**, an **internal ledger** for balances owed, multi-party reconciliation, dispute→clawback flow |
| **P2 — Gateway / PSP / wallet / fintech** | own ledger, direct acquirer/bank/card-network, issues balances | + full **double-entry append-only ledger**, **3-way reconciliation** (ledger↔settlement↔bank), settlement-file ingestion, sharding/serialized balance updates, in-house **fraud engine**, AML/sanctions, PCI DSS Level 1 |

If there is **no** money movement (no PSP, no charge/ledger paths), stop and report reduced
applicability. If card data appears in the last `rg` above, that is **Critical, report immediately**.

---

## Phase 1 — Research (version-anchored, provider-aware)  [HIGH freedom]

Follow `/research`. Anchor to the **installed** SDK version and the provider's
*current* API (e.g. Stripe **PaymentIntents**, not the legacy Charges API).
Confirm the current-year shape of the controls before judging the code.

**When the provider is Stripe, use the Stripe MCP as the authoritative source:**

- Concepts / best practice (idempotency keys, webhook signature verification,
  PaymentIntents lifecycle, SCA/3DS2, Radar) — `search_stripe_documentation`
  with `search_only_api_ref: false`.
- Exact API params the integration should be sending — `stripe_api_search`
  then `stripe_api_details` on the operation id (confirm `PaymentIntent.create`
  is called with an idempotency key and amounts in minor units).

For **PayPal / Square / Adyen / PayPay / Braintree / others**, the Stripe MCP
does not apply — use `/research` against the provider's official docs. Never
invent a param or endpoint the provider doesn't expose.

---

## Phase 2 — Payment correctness matrix  [HIGH freedom]

For **each in-scope row**, mark `Implemented / Partial / Missing / N/A` with
`file:line`, a one-line "why it bites in prod", and the fix-delegate. **Full
detection commands, good-vs-red-flag signals, and fix targets are in
[references/checklist.md](references/checklist.md)** — load it and work the
applicable groups.

Groups and the tier that owns them:
- **A. Money-movement correctness (P0+)** — A1 idempotency on every mutation, A2 dedup / stored result, A3 payment state machine, A4 money as integer minor units, A5 multi-currency & FX
- **B. Ledger & data integrity (P1 internal balances · P2 full ledger)** — B1 double-entry, B2 append-only / immutable, B3 balance derived & snapshotted separately, B4 auditability, B5 schema for scale
- **C. Async orchestration & webhook delivery (P0+)** — C1 sync-auth vs async-everything, C2 webhook signature verified, C3 event-id dedup + 200-then-process, C4 atomic state+ledger+outbox, C5 pull-based recovery for stuck payments, C6 refund/dispute/payout as saga
- **D. Reconciliation & settlement (P1/P2)** — D1 automated daily reconciliation, D2 3-way match + break report, D3 discrepancy handling, D4 safety brake
- **E. Fraud, risk & SCA (P0 delegate · P1/P2 in-house)** — E1 risk scoring pre-auth, E2 3DS2 / SCA step-up, E3 fraud-service failure policy, E4 chargeback / dispute monitoring, E5 AML / sanctions
- **F. Compliance & security — PCI DSS v4.0.1 (all tiers)** — F1 never store/log PAN or CVV, F2 tokenization, F3 key rotation & secret handling, F4 access audit
- **G. Error handling & resilience (P0+)** — G1 PSP/bank API timeout + retry + circuit breaker, G2 bulkhead / pool isolation, G3 partial-write safety, G4 graceful degradation
Full matrix (control | bites in prod if missing | fix via): [references/matrix.md](references/matrix.md).

Rules:
- **Evidence or it didn't happen** — every verdict cites `file:line` or "searched, none found".
- **N/A is first-class** — record *why* (scope tier), don't drop the row.
- **No double-counting** — link per-call resilience to `audit-resilience`, PCI to `audit-security`.
- **No PoCs** — do not write replay, spoof, or card-testing procedures.

---

## Phase 3 — Prioritized report (read-only)  [HIGH freedom]

One markdown report: header (provider(s), scope tier + evidence, in-scope groups, N/A rows + why); a **Critical** table (finding | control | file:line | why it bites | fix via) for money loss, double-charge, and card-data exposure; a **High / Medium** matrix summary per group (Implemented | Partial | Missing | N/A | fix via); and a **lift-to-production roadmap** ordered by blast radius — idempotency → verify + dedup webhooks → atomic state+ledger+outbox and pull-based recovery → [P1/P2] double-entry ledger + daily reconciliation → tokens-only + key rotation + access audit → breaker/bulkhead + fraud fail-policy.
Report skeleton with example rows: [references/report-template.md](references/report-template.md).

**Forbidden:** declaring "production-grade" from passing tests alone; flagging P2-only controls
(in-house ledger, 3-way bank match, sharding) against a P0 merchant integrator; re-auditing per-call
timeouts/retries `audit-resilience` owns; assigning any severity below Critical to a double-charge,
lost-money, or PAN-exposure finding; recommending a refund/payout saga without compensation logic;
**writing exploit or payment-fraud PoCs**; **editing payment code** — this skill reports;
remediation is human-reviewed, runs at high effort, and keeps the execution rule's STOP-and-ask on payment code.

---

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Evidenced** — `file:line` or "searched, none found", not "webhooks are probably signed"
2. **No PoC** — finding names the missing control; no replay, spoof, or card-testing steps
3. **Tier respected** — P2 ledger / 3-way match are N/A on P0, with why
4. **Severity justified** — double-charge, lost money, or PAN/CVV = Critical
5. **Right owner** — IAP / StoreKit → `audit-monetization-iap`; per-call retry → `audit-resilience`
6. **Nothing edited** — STOP-and-confirm; human-reviewed remediation only

## Related
- `audit-resilience` — per-call idempotency keys, timeouts, retry+backoff+jitter, circuit breaker, cancellation
- `audit-security` — PCI/PAN handling, webhook auth, secrets, key rotation, injection, access logging
- `audit-db-schema` — double-entry ledger schema, append-only constraints, money types, partitioning
- `audit-backend-architecture` — outbox/saga/breaker *structure* and topology fit (this skill checks payment *correctness* on top)
- `plan-data-integrity` — append-only/immutability guarantees and destructive-op safety
- `plan-secrets-audit` — rotate vs relocate provider API/signing keys
- `backend-patterns` / `backend-patterns/references/architecture-patterns.md` — implement idempotency, outbox, saga, state machine
- `data-pipeline` — reconciliation/settlement ingestion jobs
- the Stripe plugin skills (`stripe-best-practices`, `connect-recommend`, `upgrade-stripe`) — Stripe-specific integration
- `audit-monetization-iap` — StoreKit / Play Billing / RevenueCat (not Stripe/web)
- `complete-everything` — close audited gaps to done with verification (human-reviewed for payment code)

## Further reading

- [Payment correctness matrix A1–G4](references/matrix.md)
- [Per-control detection commands and signals](references/checklist.md)
- [Prioritized report template](references/report-template.md)
