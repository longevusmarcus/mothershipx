-- Create email_logs table for tracking sent emails
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL CHECK (email_type IN (
    'verification', 'password_reset', 'new_problem'
  )),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  resend_message_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_type_status ON public.email_logs(email_type, status);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);

-- Enable RLS (only service role can access)
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Change new_problems default to false (opt-in instead of opt-out)
ALTER TABLE public.user_settings
ALTER COLUMN new_problems SET DEFAULT false;
