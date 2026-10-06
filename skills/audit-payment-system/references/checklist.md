# Payment system audit — detection commands & signals

Per-control detection for `audit-payment-system` Phase 2. Each entry: **what**, **detect** (commands),
**good signal**, **red flag**, **fix via**. Amounts are always integer **minor units** (cents) as
strings across boundaries — never floats. Run only the groups in scope for the detected tier (P0/P1/P2).

## Contents

- A. Money-movement correctness
- B. Ledger & data integrity  *(P1 internal balances · P2 full ledger — `N/A` for P0)*
- C. Async orchestration & webhook delivery
- D. Reconciliation & settlement  *(P1/P2 — `N/A` for P0 beyond PSP-dashboard spot checks)*
- E. Fraud, risk & SCA
- F. Compliance & security — PCI DSS v4.0.1 (all tiers)
- G. Error handling & resilience
- Delegation map (don't double-count)


---

## A. Money-movement correctness

### A1 — Idempotency on every mutation
- **What:** charge/capture/refund/void accept a business-intent idempotency key, enforced at the API
  edge **and** by a DB **unique constraint** (the last line of defense against a double charge).
- **Detect:**
  ```bash
  rg -n -i "idempotency[-_]?key|Idempotency-Key|idempotenc" -g '*.{ts,js,py,go,java,rb,cs}'
  rg -n -i "unique|UNIQUE|createIndex.*unique|@@unique|add_index.*unique" -g '*.{sql,prisma,rb,ts}' | rg -i "idempot|payment|charge|event"
  rg -n -i "\.(create|charge|capture|refund|cancel|void)\b" -g '*.{ts,js,py,go}'   # do these calls pass a key?
  ```
- **Good:** every mutating call passes a key derived from business identity (order id + action), and a
  `UNIQUE(idempotency_key)` (or `UNIQUE(order_id, action)`) exists in the schema.
- **Red flag:** key generated from a timestamp/UUID at call time (defeats dedup on retry); key only at
  the app layer with no DB constraint; some mutations keyed and others not.
- **Fix via:** `audit-resilience`, `backend-patterns`.

### A2 — Dedup / stored result & payload guard
- **What:** a reused key returns the *prior* result (or a "processing" status); a reused key with a
  **different** payload is rejected, not silently run.
- **Detect:** `rg -n -i "already.?processed|existing.?result|payload.?hash|conflict|409" -g '*.{ts,js,py,go}'`
- **Good:** persist the key + payload hash + response before calling the PSP; on reuse compare hash and
  return the cached response.
- **Red flag:** key accepted but result not stored; different payloads accepted under the same key.
- **Fix via:** `audit-resilience`.

### A3 — Payment state machine
- **What:** explicit permitted/prohibited transitions; `capture` twice is idempotent (2nd call returns
  success without re-processing); no `SETTLED→AUTHORIZED`, no re-capture of `REFUNDED`.
- **Detect:**
  ```bash
  rg -n -i "state|status|transition|PENDING|AUTHORIZED|CAPTURED|SETTLED|REFUNDED|FAILED|CHECK constraint" -g '*.{ts,js,py,go,sql}'
  ```
- **Good:** a defined transition graph (enum + guard, DB `CHECK`, or state-machine lib); capture/refund
  are guarded and idempotent; a background worker resolves stuck transitional states (see C5).
- **Red flag:** free-form status string set anywhere; capture with no "already captured" guard; no
  prohibited-transition checks.
- **Fix via:** `backend-patterns`.

### A4 — Money as integer minor units
- **What:** amounts are integers (cents), currency carried alongside; no float arithmetic on money.
- **Detect:** `rg -n -i "float|double|parseFloat|Number\(|decimal|BigDecimal|toFixed|amount\s*[*/]" -g '*.{ts,js,py,go,java,sql}'`
- **Good:** `amount_minor int` / `bigint` + `currency char(3)`; money math in integer or a decimal type;
  amounts crossing boundaries as strings in minor units.
- **Red flag:** `float`/`double`/`parseFloat` on money; `toFixed(2)` as the storage strategy; summing
  across currencies.
- **Fix via:** `audit-db-schema`.

### A5 — Multi-currency & FX
- **What:** no cross-currency arithmetic; FX rate captured at posting time and stored with the entry;
  explicit rounding policy (e.g. bankers'/half-even).
- **Detect:** `rg -n -i "currency|fx|exchange.?rate|convert|round|banker" -g '*.{ts,js,py,go,sql}'`
- **Good:** each ledger entry stores currency + fx rate used; conversions produce a recorded FX entry;
  documented rounding.
- **Red flag:** adding amounts of different currencies; FX rate re-fetched at read time; unspecified
  rounding.
- **Fix via:** `backend-patterns`.

---

## B. Ledger & data integrity  *(P1 internal balances · P2 full ledger — `N/A` for P0)*

### B1 — Double-entry
- **What:** every movement writes a balanced debit **and** credit; the sum of all ledger entries = 0.
- **Detect:** `rg -n -i "debit|credit|double|balanced|journal|posting|sum.*zero" -g '*.{ts,js,py,go,sql}'`
- **Good:** a `ledger_entries` table with `direction (debit|credit)`, entries grouped by a
  transaction/journal id, and an invariant/test asserting per-transaction debits == credits.
- **Red flag:** a single "amount +/-" column; balances mutated directly without paired entries.
- **Fix via:** `audit-db-schema`, `backend-patterns`.

### B2 — Append-only / immutable
- **What:** transaction & ledger tables are insert-only; corrections are **reversing entries**, never
  `UPDATE`/`DELETE`.
- **Detect:**
  ```bash
  rg -n -i "UPDATE (ledger|transactions|journal|entries)|DELETE FROM (ledger|transactions|journal)" -g '*.{sql,ts,js,py,go,rb}'
  rg -n -i "\.update\(|\.destroy\(|\.delete\(" -g '*.{ts,js,py,go,rb}' | rg -i "ledger|transaction|journal|entry"
  ```
- **Good:** no update/delete on financial tables; DB trigger/grant prevents it; reversals are new rows.
- **Red flag:** any `UPDATE`/`DELETE` against ledger/transaction rows.
- **Fix via:** `plan-data-integrity`, `audit-db-schema`.

### B3 — Balance derived & snapshotted separately
- **What:** current balance is a materialized snapshot of ledger entries, not a hand-updated column.
- **Detect:** `rg -n -i "balance|snapshot|materialized|SUM\(|running.?total" -g '*.{ts,js,py,go,sql}'`
- **Good:** balance = periodic snapshot + entries since; snapshot table separate from ledger.
- **Red flag:** `balance = balance + x` UPDATE alongside (or instead of) ledger entries.
- **Fix via:** `audit-db-schema`.

### B4 — Auditability
- **What:** immutable/event-sourced history reconstructs any transaction; access to txn/PII data logged.
- **Detect:** `rg -n -i "audit|event.?source|history|append|access.?log|who|actor" -g '*.{ts,js,py,go,sql}'`
- **Good:** every state change emits an immutable event; reads/writes of payment data are attributable.
- **Red flag:** no history table; no access logging on payment/PII reads.
- **Fix via:** `backend-observability`, `audit-security`.

### B5 — Schema for scale
- **What:** time-partitioned transaction/ledger tables (manageable rows/day); indexes for recon queries.
- **Detect:** `rg -n -i "PARTITION|partition by|created_at.*index|BRIN|shard" -g '*.{sql,prisma}'`
- **Good:** partition by date; indexes on `(created_at)`, `(idempotency_key)`, `(status)`.
- **Red flag:** one unbounded hot table; recon full-scans.
- **Fix via:** `audit-db-schema`.

---

## C. Async orchestration & webhook delivery

### C1 — Sync-auth vs async-everything
- **What:** authorization is synchronous (caller waits); settlement, webhooks, reporting, recon are async.
- **Detect:** `rg -n -i "await.*capture|await.*settle|await.*reconcil|await.*notify|await.*email" -g '*.{ts,js,py,go}'`
- **Good:** only auth/confirm is on the request path; the rest is queued.
- **Red flag:** blocking on settlement/reporting/email inside the checkout request.
- **Fix via:** `audit-backend-architecture`.

### C2 — Webhook signature verified before processing
- **What:** HMAC / provider `constructEvent` verification happens **before** any state change.
- **Detect:**
  ```bash
  rg -n -i "constructEvent|verifyHeader|Stripe-Signature|hmac|createHmac|timingSafeEqual|verify.*signature|x-.*-signature" -g '*.{ts,js,py,go,rb}'
  rg -n -i "app\.(post|put)\(.*webhook|@app.route.*webhook|/webhook" -g '*.{ts,js,py,go,rb}'   # then check each verifies
  ```
- **Good:** every webhook route verifies the signature with the raw body and a constant-time compare.
- **Red flag:** webhook handler parses/acts on the body with no verification; signature compared with `==`.
- **Fix via:** `audit-security`.

### C3 — Event-id dedup + 200-then-process
- **What:** processed event ids are recorded; the endpoint acks **200 immediately** then processes async.
- **Detect:** `rg -n -i "event\.id|processed.?event|already.?seen|enqueue|queue|200|res\.(send|status)" -g '*.{ts,js,py,go}'`
- **Good:** insert event id into a `processed_events` table (unique); return 200 fast; process on a worker.
- **Red flag:** synchronous heavy processing inside the webhook (PSP retries on timeout → double process);
  no event-id dedup.
- **Fix via:** `audit-resilience`.

### C4 — Atomic state + ledger + outbox
- **What:** the state transition, ledger posting, and outbound event are committed in **one** DB
  transaction; a relay publishes from the outbox.
- **Detect:** `rg -n -i "transaction|BEGIN|commit|outbox|\.\$transaction|unit.?of.?work" -g '*.{ts,js,py,go,sql}'`
- **Good:** single DB txn wraps state+ledger+outbox insert; separate relay/CDC publishes events.
- **Red flag:** DB write then a separate `publish()`/HTTP call (dual-write — crash between = inconsistency).
- **Fix via:** `audit-backend-architecture`, `backend-patterns`.

### C5 — Pull-based recovery for stuck payments
- **What:** a worker scans transitional states past a timeout and queries the PSP as the source of truth.
- **Detect:** `rg -n -i "cron|scheduler|worker|poll|stuck|reconcile.*status|retrieve.*payment|pull" -g '*.{ts,js,py,go}'`
- **Good:** periodic sweep of `PENDING`/`PROCESSING` older than N minutes → PSP status API drives the transition.
- **Red flag:** state advanced **only** by inbound webhooks (a lost webhook = stuck forever → user retries → double charge).
- **Fix via:** `backend-patterns`.

### C6 — Refund/dispute/payout as saga
- **What:** multi-service flows use local steps + **compensations** (reverse auth, negative ledger entry,
  payout clawback, notify), driven by a durable workflow.
- **Detect:** `rg -n -i "saga|compensat|workflow|temporal|step.?function|rollback|clawback" -g '*.{ts,js,py,go}'`
- **Good:** each step has a compensating action; a durable engine won't lose an in-flight saga on crash.
- **Red flag:** a refund that reverses money but can fail before notifying/booking, with no compensation.
- **Fix via:** `backend-patterns`.

---

## D. Reconciliation & settlement  *(P1/P2 — `N/A` for P0 beyond PSP-dashboard spot checks)*

### D1 — Automated daily reconciliation
- **Detect:** `rg -n -i "reconcil|settlement|balance_transaction|payout.?report|settle.*file|EOD|end.?of.?day" -g '*.{ts,js,py,go}'`
- **Good:** a scheduled job ingests the PSP settlement file and matches every line to a ledger entry.
- **Red flag:** no reconciliation job at all (ledger and PSP diverge silently).
- **Fix via:** `backend-patterns`, `data-pipeline`.

### D2 — 3-way match + break report
- **What:** internal ledger ↔ card-network/PSP ↔ bank statement; output a break report for ops.
- **Detect:** `rg -n -i "three.?way|3.?way|match|discrepanc|break.?report|mismatch|unmatched" -g '*.{ts,js,py,go}'`
- **Good:** all three sources compared; matched/unmatched/mismatched categorized daily.
- **Red flag:** only ledger-vs-PSP (bank ignored); no break report.
- **Fix via:** `data-pipeline`.

### D3 — Discrepancy handling
- **What:** missing txn escalated; extra bank txn found-in-records or reversed; amount mismatch checks FX;
  rounding-only differences auto-resolved.
- **Detect:** `rg -n -i "escalat|alert|missing|extra|amount.?mismatch|fx|rounding|auto.?resolve" -g '*.{ts,js,py,go}'`
- **Good:** typed discrepancy handlers with thresholds; rounding auto-resolved, real breaks escalated.
- **Red flag:** breaks logged and ignored, or every break requires manual triage.
- **Fix via:** `backend-patterns`.

### D4 — Safety brake
- **What:** unreconciled balance over a threshold halts new captures / pages on-call.
- **Detect:** `rg -n -i "halt|threshold|circuit|stop.*capture|alert|pager|page" -g '*.{ts,js,py,go}'`
- **Red flag:** losses can accumulate indefinitely with no automated stop.
- **Fix via:** `audit-resilience`.

---

## E. Fraud, risk & SCA

### E1 — Risk scoring pre-auth
- **Detect:** `rg -n -i "fraud|risk|velocity|geolocat|device.?fingerprint|rules?.?engine|ml|score|radar|sift" -g '*.{ts,js,py,go}'`
- **Good:** velocity/geo/amount/device signals feed a rules engine (+ ML score if present) before auth.
- **Red flag:** no pre-auth screening (card-testing/stolen-card attacks land as chargebacks).
- **Fix via:** `backend-patterns` (P0: delegate to the PSP's built-in, e.g. Stripe Radar).

### E2 — 3DS2 / SCA step-up
- **Detect:** `rg -n -i "3ds|3-?d.?secure|sca|strong.?customer|psd2|challenge|exempt|frictionless" -g '*.{ts,js,py,go}'`
- **Good:** high-risk / PSD2-region → 3DS challenge; low-risk → frictionless via exemptions; PaymentIntents
  (which handles SCA) not the legacy Charges API.
- **Red flag:** no SCA for EU cards (declines); or challenge on everything (lost conversion).
- **Fix via:** provider docs / `backend-patterns`.

### E3 — Fraud-service failure policy
- **Detect:** `rg -n -i "fail.?open|fail.?closed|fallback|circuit|degrade|timeout" -g '*.{ts,js,py,go}' | rg -i "fraud|risk"`
- **Good:** an explicit, documented fail-open **or** fail-closed decision behind a breaker.
- **Red flag:** undefined behavior when the risk service is down (blocks all revenue, or waves all fraud through).
- **Fix via:** `audit-resilience`.

### E4 — Chargeback / dispute monitoring
- **Detect:** `rg -n -i "chargeback|dispute|VAMP|VDMP|ratio|watchlist" -g '*.{ts,js,py,go}'`
- **Good:** dispute ratio tracked with alerting well below acquirer thresholds.
- **Red flag:** no visibility into dispute rate.
- **Fix via:** `backend-observability`.

### E5 — AML / sanctions  *(P2 / regulated)*
- **Detect:** `rg -n -i "aml|kyc|sanction|ofac|watchlist|screening" -g '*.{ts,js,py,go}'`
- **Fix via:** `/research` + human review (regulatory).

---

## F. Compliance & security — PCI DSS v4.0.1 (all tiers)

### F1 — Never store/log PAN or CVV
- **Detect (should find nothing raw):**
  ```bash
  rg -n -i "card[-_ ]?number|\bpan\b|cvv|cvc|card\.number|primary_account|expiry|exp_month|exp_year" -g '*.{ts,js,py,go,java,rb,cs,sql,log}'
  rg -n -i "console\.log|logger\.(info|debug)|print\(|fmt\.Print" -g '*.{ts,js,py,go}' | rg -i "card|pan|cvv|token|amount|payment"
  ```
- **Good:** raw card data never reaches your servers (hosted fields / Elements); only tokens stored/logged.
- **Red flag (Critical):** any PAN/CVV in code, DB columns, or logs. CVV storage is flatly prohibited.
- **Fix via:** `audit-security`.

### F2 — Tokenization
- **Detect:** `rg -n -i "token|payment_method|setup_intent|hosted.?field|elements|vault" -g '*.{ts,js,py,go}'`
- **Good:** PaymentIntents / hosted fields keep card data out of scope (SAQ-A).
- **Red flag:** card data posted to your backend then forwarded (full PCI scope).
- **Fix via:** provider docs.

### F3 — Key rotation & secret handling
- **Detect:** `rg -n -i "sk_live|sk_test|api.?key|secret|whsec_|signing.?secret|rotate" -g '*.{ts,js,py,go,env,yml,yaml}'`
- **Good:** keys in a secret manager, rotated; webhook signing secret not in code.
- **Red flag (Critical):** live secret keys committed; no rotation.
- **Fix via:** `audit-security`, `plan-secrets-audit`.

### F4 — Access audit
- **Detect:** `rg -n -i "audit.?log|access.?log|who|actor|user_id.*read|trace" -g '*.{ts,js,py,go}' | rg -i "payment|transaction|card|ledger"`
- **Good:** every read/write of payment/PII data is attributable.
- **Red flag:** no access trail on payment data.
- **Fix via:** `audit-security`, `backend-observability`.

---

## G. Error handling & resilience

- **G1 timeout + backoff + breaker on PSP/bank calls:** `rg -n -i "timeout|retry|backoff|jitter|circuit|breaker|opossum|resilience4j|polly|tenacity" -g '*.{ts,js,py,go}'` → every external call has a timeout and a breaker. Red flag: bare `await fetch(psp)` with no timeout. Fix via `audit-resilience`.
- **G2 bulkhead / pool isolation:** `rg -n -i "pool|semaphore|bulkhead|max.?concurren|limit" -g '*.{ts,js,py,go}'` → PSP calls can't starve the DB pool. Fix via `audit-backend-architecture`.
- **G3 partial-write safety:** covered by C4 (state + ledger commit atomically). Red flag: "charged but not booked" possible. Fix via `backend-patterns`.
- **G4 graceful degradation:** `rg -n -i "degrade|fallback|optional|non.?critical|best.?effort" -g '*.{ts,js,py,go}'` → fraud/notification down ≠ block auth, per an explicit policy. Fix via `audit-resilience`.

---

## Delegation map (don't double-count)
| Concern | Owner skill |
|---|---|
| Per-call timeout/retry/backoff/breaker/idempotency-key mechanics | `audit-resilience` |
| PAN/CVV handling, webhook auth, secrets, key rotation, access logging, injection | `audit-security` |
| Ledger schema, money types, append-only constraints, partitioning | `audit-db-schema` |
| Outbox/saga/breaker *structure* & topology fit | `audit-backend-architecture` |
| Append-only/immutability & destructive-op safety | `plan-data-integrity` |
| Rotate-vs-relocate provider keys | `plan-secrets-audit` |
| Implementation of idempotency/outbox/saga/state machine | `backend-patterns` |
| Reconciliation/settlement ingestion pipelines | `data-pipeline` |
| Stripe-specific integration detail | Stripe plugin skills + Stripe MCP |
