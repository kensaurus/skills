# Payment correctness matrix (A1–G4)

The Phase 2 matrix for `audit-payment-system`: each control, what bites in prod if it is missing, and the skill that owns the fix. Mark only the rows in scope for the detected tier.

### A. Money-movement correctness (P0+)
| # | Control | Bites in prod if missing | Fix via |
|---|---|---|---|
| A1 | **Idempotency on every mutation** (charge/capture/refund/void) — key from business intent, enforced at gateway **and** a DB **unique constraint** | Network retry → **double charge**; the DB constraint is the last line of defense | `audit-resilience`, `backend-patterns` |
| A2 | **Dedup / stored result** — reused key returns the prior result; reused key + *different* payload is rejected | Retry runs the charge twice; or a bug reuses a key for a new amount | `audit-resilience` |
| A3 | **Payment state machine** — explicit permitted/prohibited transitions; capture-twice is idempotent (2nd returns success, no re-process); no `SETTLED→AUTHORIZED`, no re-capture of `REFUNDED` | Double-capture, refund-after-refund, stuck-in-limbo payments | `backend-patterns` |
| A4 | **Money as integer minor units** (never float); currency travels with amount | Float rounding silently loses/creates fractions of a cent at scale | `audit-db-schema` |
| A5 | **Multi-currency & FX** — no cross-currency arithmetic; FX rate captured at posting time; explicit rounding (e.g. bankers') | Mixed-currency sums, rounding drift, unreproducible historical amounts | `backend-patterns` |

### B. Ledger & data integrity (P1 internal balances · P2 full ledger)
| # | Control | Bites in prod if missing | Fix via |
|---|---|---|---|
| B1 | **Double-entry** — every movement writes balanced debit+credit; sum of all entries = 0 (the invariant that proves nothing leaked) | Money "vanishes" or is created; books never balance; undetectable until audit | `audit-db-schema`, `backend-patterns` |
| B2 | **Append-only / immutable** transaction & ledger tables — corrections are reversing entries, never `UPDATE`/`DELETE` | An edited/deleted row destroys the audit trail; disputes become unwinnable | `plan-data-integrity`, `audit-db-schema` |
| B3 | **Balance = derived, snapshotted separately** — current balance is a snapshot/materialization of ledger entries, not a hand-updated column | Balance column drifts from the ledger; two sources of "truth" | `audit-db-schema` |
| B4 | **Auditability** — event-sourced/immutable history reconstructs any transaction; every access to txn data is logged | Can't answer "what happened to charge X"; fails compliance audit | `backend-observability`, `audit-security` |
| B5 | **Schema for scale** — partition by date (manageable rows/day), indexed for recon queries | Unbounded hot table; recon and reporting time out | `audit-db-schema` |

### C. Async orchestration & webhook delivery (P0+)
| # | Control | Bites in prod if missing | Fix via |
|---|---|---|---|
| C1 | **Sync-auth vs async-everything** — authorization is synchronous; settlement, webhooks, reporting, recon are async | Slow downstream blocks the checkout; or status trusted from a response that lied | `audit-backend-architecture` |
| C2 | **Webhook signature verified** (HMAC / provider `constructEvent`) before any processing | Spoofed "payment succeeded" → goods shipped for free | `audit-security` |
| C3 | **Webhook event-id dedup + 200-then-process** — record processed event ids; ack 200 immediately, process async | PSP retries for days → the same event processed twice (double ledger post) | `audit-resilience` |
| C4 | **Atomic state+ledger+outbox** — the state transition, ledger posting, and outbound event commit in one DB transaction (outbox relay publishes) | Dual-write: crash mid-way = captured payment with no fulfillment event, or vice versa | `audit-backend-architecture`, `backend-patterns` |
| C5 | **Pull-based recovery for stuck payments** — a worker scans transitional states past a timeout and queries the PSP as source of truth | A lost webhook leaves a payment stuck forever; user re-tries → double charge | `backend-patterns` |
| C6 | **Refund/dispute/payout as saga** — multi-service steps with compensations (reverse auth, negative ledger entry, payout clawback, notify) | A half-done refund claws back money but never notifies, or refunds twice | `backend-patterns` |

### D. Reconciliation & settlement (P1/P2)
| # | Control | Bites in prod if missing | Fix via |
|---|---|---|---|
| D1 | **Automated daily reconciliation** vs the PSP settlement file — the single most important control | Ledger and PSP silently diverge (timing, lost webhooks); discrepancies compound | `backend-patterns`, `data-pipeline` |
| D2 | **3-way match** (internal ledger ↔ card-network/PSP ↔ bank statement) with a **break report** | Missing/extra/mismatched txns go unnoticed; revenue leakage & fraud hidden | `data-pipeline` |
| D3 | **Discrepancy handling** — missing txn escalated; extra bank txn found-or-reversed; amount mismatch checks FX; rounding-only auto-resolved | Every break needs a human; or breaks silently ignored | `backend-patterns` |
| D4 | **Safety brake** — unreconciled balance over a threshold halts new captures / alerts | Losses accumulate faster than they're caught | `audit-resilience` |

### E. Fraud, risk & SCA (P0 delegate · P1/P2 in-house)
| # | Control | Bites in prod if missing | Fix via |
|---|---|---|---|
| E1 | **Risk scoring pre-auth** — velocity, geolocation, amount, device fingerprint via rules engine (+ ML score where present) | Card-testing / stolen-card attacks; chargebacks | `backend-patterns` |
| E2 | **3DS2 / SCA step-up** — high-risk/PSD2-region → 3D Secure challenge; low-risk → frictionless via exemptions | Non-compliant in EU (declines) or friction everywhere (lost conversion) | provider docs / `backend-patterns` |
| E3 | **Fraud-service failure policy** — explicit fail-open vs fail-closed when the risk service is down (breaker) | Fraud service down → either block all revenue or wave through all fraud | `audit-resilience` |
| E4 | **Chargeback / dispute monitoring** — track ratio, react before acquirer watchlist (VAMP/VDMP) thresholds | Program placement / fines; account termination | `backend-observability` |
| E5 | **AML / sanctions screening** (P2 / regulated) | Regulatory exposure for regulated flows | `/research` + human |

### F. Compliance & security — PCI DSS v4.0.1 (all tiers)
| # | Control | Bites in prod if missing | Fix via |
|---|---|---|---|
| F1 | **Never store/log PAN or CVV** — tokens only; card data never touches your servers/logs (scope reduction) | PCI breach liability; CVV storage is flatly prohibited | `audit-security` |
| F2 | **Tokenization** — hosted fields / PaymentIntents so raw card data bypasses your infra | Balloons PCI scope from SAQ-A to full audit | provider docs |
| F3 | **Key rotation & secret handling** — API/signing keys rotated, never in code/logs | Leaked long-lived key = unlimited charges/refunds | `audit-security`, `plan-secrets-audit` |
| F4 | **Access audit** — every read/write of transaction/PII data is logged & attributable | Can't prove who touched payment data; fails audit | `audit-security`, `backend-observability` |

### G. Error handling & resilience (P0+)
| # | Control | Bites in prod if missing | Fix via |
|---|---|---|---|
| G1 | **PSP/bank API timeout + retry with backoff** and a **circuit breaker** | One slow provider exhausts the pool → whole checkout 503s | `audit-resilience` |
| G2 | **Bulkhead / pool isolation** — PSP calls can't starve the DB/other deps | Timeout storm cascades across the system | `audit-backend-architecture` |
| G3 | **Partial-write safety** — state + ledger commit atomically; no "charged but not booked" | Money taken, ledger never posted (or reverse) | `backend-patterns` |
| G4 | **Graceful degradation** for non-critical deps (fraud/notification down ≠ block auth, per policy) | A non-critical outage takes payments offline | `audit-resilience` |
