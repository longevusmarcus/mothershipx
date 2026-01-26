# Supabase Email Integration with Resend

## Overview

Custom auth emails (verification, password reset) using Resend SDK via Supabase Auth Hooks.

## Architecture

```
User signs up → Supabase Auth → Send Email Hook → auth-email function → Resend API → Email delivered
```

## Files Created

| File | Purpose |
|------|---------|
| `supabase/functions/auth-email/index.ts` | Auth hook for verification & password reset |
| `supabase/functions/send-email/index.ts` | Problem notifications (opt-in) |
| `supabase/migrations/20260126100000_create_email_logs.sql` | Email tracking table |
| `scripts/delete-test-user.sh` | Helper script for testing |

## Setup Steps

### 1. Deploy Edge Functions
```bash
supabase functions deploy auth-email --no-verify-jwt
supabase functions deploy send-email
```

### 2. Set Secrets
```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set SITE_URL=https://yourdomain.com
supabase secrets set SEND_EMAIL_HOOK_SECRET="v1,whsec_<secret-from-dashboard>"
```

### 3. Configure Auth Hook (Dashboard)
1. Go to **Auth → Hooks**
2. Enable **Send Email** hook
3. Set type: **HTTPS**
4. Set URI: `https://<project>.supabase.co/functions/v1/auth-email`
5. Click **Generate secret** and copy it
6. Save

### 4. Verify Domain in Resend
The `FROM_EMAIL` domain must be verified at https://resend.com/domains

---

## Gotchas & Lessons Learned

### 1. "Confirm email" must be enabled
**Problem:** Hook never fires, no logs, user created with `email_confirmed_at` already set.

**Solution:** Go to **Auth → Providers → Email** and enable **"Confirm email"** toggle. If disabled, Supabase skips confirmation entirely.

### 2. Webhook signature verification requires correct secret format
**Problem:** `Missing required headers` error in function logs.

**Solution:**
- Secret must be in format: `v1,whsec_<base64-encoded-secret>`
- Generate it in Dashboard when enabling the hook
- Set it via: `supabase secrets set SEND_EMAIL_HOOK_SECRET="v1,whsec_..."`

### 3. Use Resend SDK, not raw fetch
**Problem:** Reinventing the wheel with manual API calls.

**Solution:** Import Resend SDK in Deno:
```typescript
import { Resend } from "npm:resend@4.0.0";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
```

### 4. Auth hook requires `--no-verify-jwt` flag
**Problem:** Function returns 401 when called by Supabase Auth.

**Solution:** Deploy with:
```bash
supabase functions deploy auth-email --no-verify-jwt
```

### 5. SMTP warning is misleading
**Problem:** Dashboard shows "Set up custom SMTP" warning even with hook enabled.

**Reality:** This warning is irrelevant when using Send Email Hook - SMTP is bypassed entirely.

### 6. Function must return empty JSON `{}`
**Problem:** Auth flow hangs or fails after email sent.

**Solution:** Return exactly:
```typescript
return new Response(JSON.stringify({}), {
  status: 200,
  headers: { "Content-Type": "application/json" },
});
```

### 7. Check function logs for debugging
**Location:** https://supabase.com/dashboard/project/<ref>/functions/auth-email/logs

No CLI command for remote function logs - must use Dashboard.

---

## Testing

```bash
# Delete test users and try signup again
./scripts/delete-test-user.sh
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key |
| `SITE_URL` | Your app URL for email links |
| `FROM_EMAIL` | Sender email (domain must be verified) |
| `SEND_EMAIL_HOOK_SECRET` | Webhook signature secret |
