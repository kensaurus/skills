---
name: design-email
description: >
  Design and build transactional and marketing email templates. Use when
  "build an email template", "welcome email", "password reset email", "React
  Email", "MJML", "dark mode email", or "email copy review". Spam/SPF →
  enhance-email-deliverability.
license: MIT
---

# design-email — Email Templates That Actually Get Read

**Degree of freedom: MIXED.** Copy and layout judgment `[HIGH freedom]`;
stack detect, markup, send, and preview `[LOW freedom — run exactly]`.

**Email is the one channel users check before they check your app.** A
well-crafted transactional email — clear, warm, fast-loading, and readable on
any device — builds trust. A corporate, jargon-heavy, broken email erodes it.
This skill handles design and copy. Inbox placement / SPF DKIM DMARC is `enhance-email-deliverability`.

## How to reason

1. **Detect** — React Email vs MJML vs none
2. **Audit** — copy voice, subject, one action; client-safe layout
3. **Write** — specific subject, human "you", plain-text twin
4. **Preview** — 375px + dark mode; hand DNS off

## Worked example

> **Detect:** `@react-email/components` already in `package.json`; `emails/` has a receipt only.
> **Audit:** password-reset subject is "Account notification"; two CTAs; no preview text.
> **Write:** subject "Reset your App password"; one "Reset my password" button; expiry in the first sentence.
> **Preview:** `npx email dev` at 375px; tap target ≥44px; DNS/spam → `enhance-email-deliverability`.

## Self-critique before reporting

- **One action** — exactly one primary CTA; subject is specific and honest
- **Client-safe** — 600px single column, inline styles, alt text, dark fallback
- **Human copy** — "you"/"we"; no jargon or ALL-CAPS subject
- **Right owner** — SPF / DKIM / DMARC / bounces / List-Unsubscribe → `enhance-email-deliverability`

---

## Phase 0: Detect the stack  [LOW freedom — run exactly]

```
package.json        → @react-email/*, mjml, nodemailer, @sendgrid/mail,
                      resend, @aws-sdk/client-ses, postmark
emails/             → existing React Email templates
src/emails/         → email template directory
.env.*              → RESEND_API_KEY, SENDGRID_API_KEY, etc. (reference by name only)
```

| Detected framework | Approach |
|--------------------|----------|
| React Email (`@react-email/components`) | JSX components, preview server, multi-client export |
| MJML | XML-like syntax, battle-tested cross-client output |
| None | Implement React Email (current best practice) |

---

## Phase 1: Audit existing templates  [HIGH freedom]

If templates already exist, walk through each one and check:

**Copy quality**:
- Does it sound like a person sent it, or a system?
- Is the subject line specific? ("Your order is on its way" not "Order notification")
- Is the first sentence the most important one (preview text matters)?
- Does it tell the reader exactly what to do and what happens next?
- Is it free of business jargon, technical terms, and passive voice?

**Design**:
- Single-column layout? (Most reliable across clients)
- Max-width 600px? (Standard email width)
- All styles inline? (Gmail strips `<style>` tags)
- Images have `alt` text? (Many clients block images by default)
- Dark mode support? (`@media (prefers-color-scheme: dark)` + inline fallbacks)
- Mobile: tap targets ≥ 44px, font size ≥ 14px

**Sender identity (template-side):**
- "From" address uses the app domain, not a personal Gmail?
- SPF / DKIM / DMARC / bounces → `enhance-email-deliverability`

---

## Phase 2: Research best practices  [HIGH freedom]

```json
firecrawl:firecrawl_search
{
  "query": "transactional email design best practices [current year] React Email",
  "limit": 3,
  "sources": [{ "type": "web" }]
}
```

Fetch React Email docs if using it:
```json
context7:resolve-library-id
{
  "libraryName": "react-email"
}
```

---

## Phase 3: Copy principles  [HIGH freedom]

Apply these to every email before looking at design:

| Principle | How |
|-----------|-----|
| Lead with the most important thing | First line = the key action or news. Not "Hi, we wanted to let you know that…" |
| Subject line = specific, honest | "Your password reset link" not "Important account information" |
| One email, one action | Every email should have exactly one thing it wants the reader to do |
| Write to a person, not an account | "You" not "the user". "We" not "the system". |
| Tell them what happens next | "Click the button below to confirm. The link expires in 24 hours." |
| No jargon | "Your account" not "your profile entity". "Sign in" not "authenticate". |
| Active voice | "We've sent you a link" not "A link has been sent to you" |
| Short paragraphs | 1–2 sentences max. White space is your friend in email. |
| Plain text fallback | Every HTML email should have a plain text version |

### Common email types — copy templates

**Password reset:**
```
Subject: Reset your [App Name] password
Preview: Your link expires in 1 hour.

Hi [First Name],

Someone requested a password reset for your [App Name] account.
If that was you, click the button below. If not, you can ignore this email.

[Primary Button: Reset my password]

This link expires in 1 hour. After that, you'll need to request a new one.
```

**Welcome** (subject with first name, preview "get started in 2 minutes", one Get started button, "just reply" close) and **Billing confirmation** (subject "Your payment of [amount] was successful", amount/date/next billing date lines, View your invoice button): [references/copy-templates.md](references/copy-templates.md).

---

## Phase 4: Build the template (React Email)  [LOW freedom — run exactly]

Install if not present:
```bash
npm install react-email @react-email/components
```

Base template structure: `Html lang` → `Head` → `Preview` → `Body` → `Container` (600px max, white on off-white) with `Img` logo (alt text), `Heading`, `Text`, one `Button` in a centered `Section`, `Hr`, and a footer `Text` with address + `{{{UNSUBSCRIBE_URL}}}` link. Styles are inline objects; swap the indigo button and off-white ground for the brand.
Full `emails/welcome.tsx`: [references/react-email-and-send.md](references/react-email-and-send.md) §Base template.

### Dark mode support

```tsx
// In <Head>:
<style>{`
  @media (prefers-color-scheme: dark) {
    .email-body { background-color: #1a1a1a !important; }
    .email-container { background-color: #2d2d2d !important; }
    .email-text { color: #e5e7eb !important; }
    .email-heading { color: #f9fafb !important; }
  }
`}</style>
// Add className to Body, Container, Text, Heading components to match
```

---

## Phase 5: Send via provider  [LOW freedom — run exactly]

### Resend (recommended for new projects)

`new Resend(process.env.RESEND_API_KEY)` → `resend.emails.send({ from: 'AppName <hello@yourdomain.com>', to, subject, react: <WelcomeEmail … /> })`.
Code: [references/react-email-and-send.md](references/react-email-and-send.md) §Send with Resend.

### Add a Supabase Edge Function trigger (if using Supabase)

`supabase/functions/send-welcome-email/index.ts`: Deno `serve`, read `record` from the database webhook body, `npm:resend` with `Deno.env.get('RESEND_API_KEY')`, send rendered HTML, return `OK`.
Code: [references/react-email-and-send.md](references/react-email-and-send.md) §Supabase Edge Function trigger.

Deploy:
```bash
supabase functions deploy send-welcome-email --no-verify-jwt
```

---

## Phase 6: Content flags that hurt placement  [LOW freedom — do not skip]

DNS auth, bounces, and List-Unsubscribe headers are `enhance-email-deliverability`.
This phase only owns copy/markup that templates can fix:

- [ ] From address uses your domain (not `noreply@gmail.com`)
- [ ] Reply-To set if replies should go somewhere useful
- [ ] No ALL-CAPS words in subject line
- [ ] No spam trigger words: "FREE", "URGENT", "ACT NOW", "GUARANTEED"
- [ ] Plain text version matches the HTML version
- [ ] Hand remaining inbox-placement work to `enhance-email-deliverability`

---

## Phase 7: Preview and test  [LOW freedom — run exactly]

Start the React Email preview server:
```bash
npx email dev --dir emails --port 3001
```

Then check with Playwright:
```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=email-preview open --headed http://localhost:3001
$PW -s=email-preview snapshot                                  # verify each template renders
$PW -s=email-preview resize 375 812                            # mobile — font size, tap targets
$PW -s=email-preview screenshot --filename ".playwright-mcp/email-mobile.png"
```

For cross-client testing, use Litmus or Email on Acid. Key clients to test:
- Gmail (web + Android + iOS)
- Apple Mail (macOS + iOS)
- Outlook (Windows — most restrictive CSS support)
- Samsung Mail

---

## Email templates checklist

```
Design:
- [ ] Max-width 600px
- [ ] Single column
- [ ] All styles inline (no <style> blocks except dark mode)
- [ ] Images have alt text
- [ ] Buttons ≥ 44px tall, large enough to tap
- [ ] Font size ≥ 14px on body text
- [ ] Dark mode tested

Copy:
- [ ] Subject line is specific and honest
- [ ] Preview text set and meaningful
- [ ] First sentence is the most important thing
- [ ] Exactly one primary action
- [ ] Copy sounds like a person wrote it
- [ ] No jargon or passive voice
- [ ] Plain text version exists

Deliverability (handoff — do not own here):
- [ ] From address on app domain
- [ ] Plain-text alternative present
- [ ] SPF / DKIM / DMARC / bounces / unsubscribe headers → `enhance-email-deliverability`
```

