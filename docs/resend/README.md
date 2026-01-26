# Resend Documentation Reference

## Overview
Resend is "the email API for developers" - a modern email sending service.

## Supabase Edge Functions Integration

### Installation
Use npm specifier in Deno (no package.json needed):
```typescript
import { Resend } from 'npm:resend@4.0.0'
```

### Initialization
```typescript
const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
```

### Sending Emails
```typescript
const { data, error } = await resend.emails.send({
  from: 'Name <email@yourdomain.com>',
  to: ['recipient@example.com'],
  subject: 'Subject line',
  html: '<p>Email content</p>',
})
```

### With React Email Templates
```typescript
import React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'

const html = await renderAsync(
  React.createElement(MyEmailTemplate, { name: 'John' })
)

await resend.emails.send({
  from: 'welcome@yourdomain.com',
  to: [user.email],
  subject: 'Welcome!',
  html,
})
```

## API Reference

### Send Email Parameters

**Required:**
- `from` (string): Sender email, format: `Name <email@domain.com>`
- `to` (string | string[]): Up to 50 recipients
- `subject` (string): Email subject

**Content (one required):**
- `html` (string): HTML content
- `text` (string): Plain text (auto-generated from HTML if omitted)
- `react` (React.ReactNode): React component (Node.js SDK only)

**Optional:**
- `cc` (string | string[]): CC recipients
- `bcc` (string | string[]): BCC recipients
- `reply_to` (string | string[]): Reply-to addresses
- `scheduled_at` (string): Schedule delivery (ISO 8601 or natural language)
- `attachments` (array): File attachments (max 40MB total)
- `headers` (object): Custom headers
- `tags` (array): Metadata for tracking `[{name: 'category', value: 'welcome'}]`

### Response
```typescript
// Success
{ id: "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794" }

// Error
{ error: { message: "...", name: "..." } }
```

### Batch Sending
```typescript
const { data, error } = await resend.batch.send([
  { from: '...', to: ['...'], subject: '...', html: '...' },
  { from: '...', to: ['...'], subject: '...', html: '...' },
])
// Max 100 emails per batch
```

## Environment Variables
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

Set in Supabase:
```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
```

## Deployment
```bash
supabase functions deploy function-name
```

## Sources
- https://resend.com/docs/send-with-supabase-edge-functions
- https://supabase.com/docs/guides/functions/examples/auth-send-email-hook-react-email-resend
- https://resend.com/docs/api-reference/emails/send-email
