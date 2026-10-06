# Payment audit — prioritized report template

The Phase 3 report skeleton for `audit-payment-system`, with example rows.

```markdown
## Payment System Audit — [repo] — [date]
**Provider(s):** [Stripe/PayPal/…]  ·  **Scope tier:** [P0/P1/P2 + evidence]
**In scope:** [groups]  ·  **N/A (out of tier):** [rows + why]

### Critical — money loss / double-charge / card-data exposure (fix before ship)
| Finding | Control | file:line | Why it bites | Fix via |
|---|---|---|---|---|
| Charge has no idempotency key; no unique constraint | A1 | pay/charge.ts:52 | Retry double-charges the customer | audit-resilience |
| Webhook processed without signature check | C2 | api/webhook.ts:9 | Untrusted "paid" → free goods | audit-security |
| Card number written to app log | F1 | pay/log.ts:20 | PCI breach liability | audit-security |
| DB write then broker publish (not atomic) | C4 | ledger.ts:88 | Captured, never booked → money unaccounted | backend-patterns |

### High / Medium (correctness & compliance matrix)
| Group | Implemented | Partial | Missing | N/A | Fix via |
|---|---|---|---|---|---|
| A Money-movement | … | … | … | | audit-resilience |
| B Ledger | … | … | … | (P0) | audit-db-schema |
| C Webhooks/async | … | … | … | | backend-patterns |
| D Reconciliation | … | … | … | (P0) | data-pipeline |
| E Fraud/SCA | … | … | … | | backend-patterns |
| F PCI/compliance | … | … | … | | audit-security |
| G Resilience | … | … | … | | audit-resilience |

### Lift-to-production roadmap (ordered by blast radius)
1. Idempotency (gateway + DB unique constraint) on every mutation → audit-resilience
2. Verify + dedup webhooks, 200-then-process async → audit-security / audit-resilience
3. Atomic state+ledger+outbox; pull-based recovery for stuck payments → backend-patterns
4. [P1/P2] Double-entry append-only ledger + daily reconciliation w/ break report → audit-db-schema / data-pipeline
5. Tokens-only + key rotation + access audit (PCI v4.0.1) → audit-security
6. Breaker/bulkhead + fraud fail-policy around every external call → audit-resilience
```
