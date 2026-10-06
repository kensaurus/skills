# React Email template and provider send

The base React Email component from SKILL.md §Phase 4 and the Resend / Supabase Edge Function send paths from §Phase 5.

## Contents

- Base template (React Email)
- Send with Resend
- Supabase Edge Function trigger

## Base template (React Email)

Illustrative — swap the indigo button and off-white ground for the brand:

```tsx
// emails/welcome.tsx
import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Link, Preview, Section, Text, Img,
} from '@react-email/components';

interface WelcomeEmailProps {
  firstName: string;
  ctaUrl: string;
}

export function WelcomeEmail({ firstName, ctaUrl }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to AppName — here's how to get started.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Img src="https://yourdomain.com/logo.png" width="48" height="48" alt="AppName" />
          <Heading style={h1}>Welcome, {firstName}</Heading>
          <Text style={text}>
            You're in. AppName helps you [core value in one sentence].
          </Text>
          <Text style={text}>
            Here's the first thing to do:
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={ctaUrl}>
              Get started
            </Button>
          </Section>
          <Text style={text}>
            If you have any questions, just reply to this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            AppName · 123 Street · City · {' '}
            <Link href="{{{UNSUBSCRIBE_URL}}}">Unsubscribe</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '40px auto', padding: '40px', maxWidth: '600px', borderRadius: '8px' };
const h1 = { fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '16px' };
const text = { fontSize: '16px', lineHeight: '1.6', color: '#444', marginBottom: '16px' };
const btnContainer = { textAlign: 'center' as const, marginBottom: '24px' };
const button = { backgroundColor: '#6366f1', borderRadius: '6px', color: '#fff', fontSize: '16px', fontWeight: '600', padding: '12px 28px', textDecoration: 'none', display: 'inline-block' };
const hr = { borderColor: '#e5e7eb', marginTop: '32px', marginBottom: '32px' };
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const };
```

## Send with Resend

```typescript
import { Resend } from 'resend';
import { WelcomeEmail } from '../emails/welcome';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'AppName <hello@yourdomain.com>',
  to: user.email,
  subject: `Welcome to AppName, ${user.firstName}`,
  react: <WelcomeEmail firstName={user.firstName} ctaUrl={ctaUrl} />,
});
```

## Supabase Edge Function trigger

```typescript
// supabase/functions/send-welcome-email/index.ts
import { serve } from 'https://deno.land/std/http/server.ts';
import { Resend } from 'npm:resend';

serve(async (req) => {
  const { record } = await req.json(); // from a database webhook
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  await resend.emails.send({
    from: 'AppName <hello@yourdomain.com>',
    to: record.email,
    subject: `Welcome to AppName!`,
    html: '...', // rendered HTML
  });
  return new Response('OK');
});
```
