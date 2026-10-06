---
name: audit-ux
description: >
  Per-page UX audit with NN/g heuristics, microcopy review, and Google HEART.
  Use when evaluating usability, auditing microcopy, or assessing cognitive
  load. Cross-page flows/IA → audit-ux-journeys.
license: MIT
effort: high
---

# UX Audit Skill

**Degree of freedom: MIXED** — Steps 0, 2–5 `[HIGH freedom]`; Step 1
research JSON and every playwright step `[LOW freedom — run exactly]`.
Read `protocol-browser-anti-stall` before any browser interaction.

## How to reason

1. **Observe** — quote the screenshot, copy, or code line
2. **Interpret** — what does this do to the human in this moment of the pipeline?
3. **Classify** — heuristic fail / law violation / microcopy / correct-as-is
4. **Severity** — blocks the success moment = P0; recoverable friction = P1; nit = P2

## Worked example

> **Observe:** invoice Submit stays enabled; no toast; `POST /invoices` in-flight 4s.
> **Interpret:** a second click creates a duplicate invoice (H1 + H5, money path).
> **Classify:** heuristic fail on a trust-sensitive write.
> **Severity:** P0 — double-submit on money.
> **Finding:** `/invoices/new` | H1/H5 | P0 | no pending state | disable + toast.

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Evidenced** — screenshot or quoted copy, not "feels confusing"
2. **Per-page** — cross-page IA/stories → `audit-ux-journeys`
3. **Severity justified** — P0 blocks the recorded success moment
4. **Right owner** — breakpoints → `audit-responsive`; empty/error → `audit-ui-states`
5. **Context first** — no finding without Step 0 human + pipeline

## Context-First

Before scoring a heuristic: who is the human (state, not "users"), where this
page sits in the journey, how data moves input → API → DB → screen, and the
emotional arc. Step 0 is mandatory.

---

## Step 0: Deep Product and Pipeline Understanding

### 0a. Understand the Business and Human Context

Read README, landing page, marketing copy, and any onboarding flows to answer:

- **What problem does this solve?** (Not features — the human pain it alleviates)
- **Who is the primary human?** (Demographics, technical skill, emotional state when using)
- **What's the alternative?** (What do people do without this product? Spreadsheets? Phone calls? Nothing?)
- **What's the success moment?** (The "aha" — when the human gets what they came for)
- **What's the trust model?** (Does the user trust this product with money? Health data? Business data?)

### 0b. Map pipeline, routes, and emotional arc

For each core task, trace how data moves from the human's input through
client validation, the API call, server processing, the database, the
response, and the client update to the feedback the human sees (`api/`,
`actions/`, `hooks/use*`, `lib/`, and `fetch|axios|ky|useSWR|useQuery|trpc`
call sites locate the integration points). Mark the latency-sensitive,
error-prone, and trust-sensitive points — H1, H5, and H9 findings come from
there. Discover routes by framework (`app/**/page.tsx`, `pages/**/*.tsx`,
`src/routes/`, `router.*`) and note nav shape (flat / hierarchical /
hub-and-spoke), depth, cross-links, and dead ends for the pages in scope;
cross-page IA belongs to `audit-ux-journeys`. For each core flow, note the
entry emotion, where confusion or anxiety spikes, where the product earns
trust, the peak moment (best or worst), and how the flow ends.

### 0c. Record discovery

One short block in whatever shape fits: product type, the human problem,
the primary human and their emotional context, the top core tasks, the
success moment, trust level (money / data / time / reputation), page count,
auth pattern, locale/i18n, and known latency or error-prone points.

---

## Step 1: Research Current UX Standards

### 1a. NN/g — Usability Heuristics and Methods

```json
firecrawl:firecrawl_search
{
 "query": "site:nngroup.com heuristic evaluation checklist [current year]",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

### 1b. Intuit Content Design — Microcopy Principles

```json
firecrawl:firecrawl_search
{
 "query": "site:contentdesign.intuit.com UX writing principles",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Scrape the most relevant result for detailed writing guidelines.

### 1c. Laws of UX — Interaction Psychology

```json
firecrawl:firecrawl_scrape
{
 "url": "https://lawsofux.com",
 "formats": ["markdown"],
 "onlyMainContent": true
}
```

### 1d. Domain-Specific UX Research

```json
firecrawl:firecrawl_search
{
 "query": "<PRODUCT_TYPE> UX best practices usability patterns [current year]",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Scrape the best result for domain-specific UX patterns.

---

## Step 2: Nielsen's 10 Usability Heuristics (Deep Evaluation)

For each heuristic: code analysis and live browser verification.

### H1: Visibility of System Status

**What to find in code:**

Search `*.tsx` for feedback patterns: `loading|isLoading|isPending|skeleton|Skeleton|spinner|Spinner`
(loading states); `progress|Progress|step.*of|currentStep` (multi-step progress);
`toast|Toast|notification|Notification|snackbar` (user notifications).

**What to verify in browser:**

| Signal | Pass | Fail |
|--------|------|------|
| Loading states | Skeleton/spinner visible during data fetch | Blank screen or frozen UI |
| Form submission | Button shows loading, success/error feedback | No feedback, user clicks again |
| Progress indication | Multi-step flows show step count | User doesn't know where they are |
| Active navigation | Current page/section highlighted | No indication of current location |
| Real-time updates | Optimistic UI or polling feedback | Stale data, no refresh indication |

### H2: Match Between System and Real World

**What to find in code:**

Search `*.tsx` for copy-quality TODOs: `TODO.*wording|TODO.*copy|TODO.*label|TODO.*text` (case-insensitive).

**What to verify in browser:**

| Signal | Pass | Fail |
|--------|------|------|
| Labels and terminology | Domain-appropriate language users expect | Technical jargon, internal codenames |
| Icons | Universally recognized or labeled | Ambiguous icons without text labels |
| Data format | Dates, currency, numbers in user's locale | ISO dates, raw numbers, wrong currency |
| Logical grouping | Information organized by user mental model | Organized by database schema or dev convenience |
| Metaphors | Real-world analogies aid understanding | Forced metaphors that confuse |

### H3: User Control and Freedom

**What to find in code:**

Search `*.tsx` for emergency-exit patterns: `onCancel|handleCancel|onClose|handleClose|onDismiss`
(cancel/close handlers); `undo|Undo|revert|Revert` (undo actions);
`confirm.*delete|confirm.*remove|AlertDialog|ConfirmDialog` (destructive-action guards).

**What to verify in browser:**

| Signal | Pass | Fail |
|--------|------|------|
| Modal escape | Close button + Escape key + backdrop click | No way to close, trapped |
| Form abandonment | Back button works, drafts saved | Data lost on navigation |
| Destructive actions | Confirmation dialog with clear consequences | One-click delete, no undo |
| Multi-step flows | Back/previous step without data loss | Can only go forward |
| Undo | Undo available after significant actions | Irreversible changes without warning |

### H4: Consistency and Standards

**What to verify in browser:**

| Signal | Pass | Fail |
|--------|------|------|
| Button hierarchy | Primary/secondary/ghost used consistently | Random button styles |
| Terminology | Same action = same label everywhere | "Save" / "Submit" / "Confirm" / "Apply" for same action |
| Layout patterns | Consistent page structure across views | Each page has different layout logic |
| Interaction patterns | Same gesture = same result | Click sometimes navigates, sometimes opens modal |
| Platform conventions | Follows web conventions (links underlined, form patterns) | Custom patterns that break expectations |

### H5: Error Prevention

**What to find in code:**

Search `*.tsx` for prevention patterns: `disabled.*(!|=.*false)|isDisabled|isInvalid`
(disabled/invalid states); `required|min.*length|max.*length|pattern=` (input constraints).
Check `package.json` for validation libraries: `zod|yup|joi|superstruct|valibot`.

**What to verify in browser:**

| Signal | Pass | Fail |
|--------|------|------|
| Input constraints | Date pickers (not free text), dropdowns for known options | Free text for structured data |
| Inline validation | Validation on blur/change, before submit | Only validates on submit |
| Destructive guards | Requires confirmation, type-to-confirm for critical actions | One-click irreversible actions |
| Defaults | Smart defaults reduce input needed | All fields blank, user guesses |
| Disabled states | Buttons disabled when form invalid, with explanation | Enabled but silently fails |

### H6: Recognition Over Recall

**What to verify in browser:**

| Signal | Pass | Fail |
|--------|------|------|
| Navigation | All major sections visible in nav | Features hidden in deep menus |
| Search | Search available for large data sets | User must scroll/browse to find |
| Breadcrumbs | Breadcrumbs in hierarchical content | User loses context in deep pages |
| Recent items | Recently accessed items surfaced | Must remember and navigate from scratch |
| Contextual help | Tooltips, placeholders explain fields | Labels without context |

### H7: Flexibility and Efficiency of Use

**What to find in code:**

Search `*.tsx` for efficiency patterns: `keyboard|shortcut|hotkey|useHotkeys|Cmd\+|Ctrl\+`
(keyboard accelerators); `bulk|batch|selectAll|multiSelect` (bulk operations).

**What to verify in browser:**

| Signal | Pass | Fail |
|--------|------|------|
| Keyboard shortcuts | Power-user shortcuts available | Mouse-only interaction |
| Bulk actions | Multi-select, batch operations | One-at-a-time only |
| Filters and sort | Filter/sort on data-heavy pages | Must scan manually |
| Customization | Users can configure views/preferences | One-size-fits-all |
| Quick actions | Common tasks reachable in 1-2 clicks | Core tasks buried in menus |

### H8: Aesthetic and Minimalist Design

**What to verify in browser:**

| Signal | Pass | Fail |
|--------|------|------|
| Information density | Progressive disclosure, expand-on-demand | Everything visible at once |
| Visual hierarchy | Clear primary/secondary/tertiary content | Everything same visual weight |
| Whitespace | Breathing room between sections | Cramped, dense layout |
| CTAs | 1 primary action per view, clearly distinguished | Multiple competing CTAs |
| Content priority | Most important content first/prominent | Critical info buried below fold |

### H9: Help Users Recognize, Diagnose, and Recover from Errors

**What to find in code:**

Search `*.tsx` for error-handling patterns: `error.*message|errorMessage|Error.*:.*'` (error
message strings); `try.*catch|\.catch\(|onError` (catch sites); `fallback|ErrorBoundary|error\.tsx`
(fallback components — list files with matches, not just count).

**What to verify in browser:**

| Signal | Pass | Fail |
|--------|------|------|
| Error language | Plain language, no codes | "Error 500", "ECONNREFUSED", raw stack trace |
| Specificity | Says exactly what went wrong | "Something went wrong" |
| Recovery action | Suggests what user can do next | Dead end, user must guess |
| Inline errors | Field-level errors near the input | Single error at top of form |
| Empty states | Helpful empty states with next action | Blank page, "No data" |

### H10: Help and Documentation

**What to find in code:**

Search `*.tsx` for in-app help: `Tooltip|tooltip|HelpCircle|InfoIcon|help.*text|aria-describedby`
(contextual help); `onboarding|tour|walkthrough|guide|Onboarding` (guided flows).

**What to verify in browser:**

| Signal | Pass | Fail |
|--------|------|------|
| Contextual help | Tooltips on complex fields/features | No explanation, user must guess |
| Onboarding | First-time user guidance available | Dropped into complex UI cold |
| Documentation | Help accessible from within the app | Must search external docs |
| Input guidance | Placeholders, hint text, format examples | Bare input fields |

---

## Step 3: Laws of UX Evaluation

| Law | Principle | What to Check | How to Fix Violations |
|-----|-----------|---------------|----------------------|
| **Jakob's Law** | Users expect your site to work like other sites | Navigation, form patterns, checkout flows follow platform conventions | Research 3 competitors via Firecrawl, adopt their common patterns |
| **Fitts's Law** | Larger, closer targets are faster to click | Primary CTAs large enough, not in corners. Touch targets ≥44px | Increase CTA size, move primary actions to natural thumb zones on mobile |
| **Hick's Law** | More choices = longer decisions | Menus ≤7 items, option lists not overwhelming, progressive disclosure | Group options, add search/filter, hide advanced options behind "More" |
| **Miller's Law** | Working memory holds ~7 items | Groups of >7 chunked. Nav items ≤7 per level | Chunk long lists, add category headers, paginate |
| **Cognitive Load** | Minimize mental effort | No unnecessary fields, no memory burden between steps | Remove optional fields from default view, show only what's needed now |
| **Aesthetic-Usability** | Beautiful = perceived as easier | First impression inspires confidence | Visual polish on landing + key flows. Personality, not just correctness |
| **Tesler's Law** | Complexity can't be eliminated, only moved | Complex tasks simplified for the user, not pushed to them | Smart defaults, auto-detection, progressive disclosure of complexity |
| **Doherty Threshold** | Productivity rises when response <400ms | Do interactions feel instant? | Optimistic UI, skeleton screens, prefetching, perceived performance tricks |
| **Postel's Law** | Be liberal in what you accept | Flexible input parsing (phone, date, case) | Accept multiple input formats, auto-format, don't reject valid variations |
| **Peak-End Rule** | People judge by peaks and endings | Success moment satisfying? Error moments handled gracefully? | Celebrate completions (confetti, clear confirmation). Soften errors |

On a native mobile app also score: primary action in the thumb zone, targets ≥ 44pt / 48dp, 3–5 tab destinations, press feedback on every tappable, haptics on confirm only, body ≥ 16sp. The fix pass for those is `enhance-mobile-native-feel`.

---

## Step 4: Content and Microcopy Audit (Intuit Content Design Principles)

### 4a. Voice and Tone

| Principle | Pass | Fail |
|-----------|------|------|
| Conversational | Reads like talking to a friend | Reads like a legal document or robot |
| Active voice | "We saved your changes" | "Your changes have been saved by the system" |
| Second person | "You" for the user, "We" for the product | Third person, passive constructions |
| Contractions | Natural contractions used ("don't", "we'll") | Stilted formal language ("do not", "we will") |

### 4b. Clarity and Precision

| Principle | Pass | Fail |
|-----------|------|------|
| Specific language | "We can't connect to Square right now" | "Something went wrong. Try again later" |
| Consistent terms | Same word for same concept throughout | "Save" / "Submit" / "Confirm" / "Apply" used interchangeably |
| Simple verbs | Present/past/future simple tense | Progressive, perfect, complex tenses |
| Short sentences | ≤20 words per sentence | Run-on sentences with multiple clauses |

### 4c. Microcopy Quality

**Check these locations in the browser:**

| Location | What to Evaluate |
|----------|-----------------|
| Button labels | Action-oriented, specific ("Save invoice" not just "Submit") |
| Error messages | Plain language, specific cause, recovery action |
| Empty states | Helpful, guides next action, not just "No data" |
| Confirmations | Clear consequence ("Delete this invoice? This can't be undone") |
| Tooltips | Concise, answers one question, not paragraphs |
| Placeholders | Format hints ("e.g., john@example.com"), not labels |
| Loading text | Informative when possible ("Loading your invoices...") |
| Success messages | Confirms what happened ("Invoice sent to John") |

### 4d. Internationalization Readiness

| Check | Pass | Fail |
|-------|------|------|
| Hardcoded strings | All strings in i18n files | Strings inline in components |
| Cultural idioms | Neutral metaphors | Culture-specific slang or humor |
| Text expansion | UI handles 40% longer translated text | Layout breaks with longer strings |
| RTL readiness | Logical properties (`margin-inline-start`) | Physical properties (`margin-left`) |

**Find violations:** search `*.tsx` for `>([\w\s]{3,})<` to surface hardcoded visible text strings that may be i18n misses.

---

## Step 5: Emotional Design and Human-Centric Evaluation

### 5a. First Impression Test (5-Second Test)

Navigate to the landing/home page. In the first 5 seconds of the screenshot:

| Question | Evidence |
|----------|----------|
| Can you tell what this product does? | [yes/no — what's communicated] |
| Do you trust it? | [visual polish, credibility signals, brand presence] |
| Do you know what to do first? | [clear CTA, obvious starting point] |
| Does it feel like a real product or a template? | [personality, craft, vs generic bootstrap] |

## Further reading

- [5b. Emotional Friction Map and more](references/details.md)
