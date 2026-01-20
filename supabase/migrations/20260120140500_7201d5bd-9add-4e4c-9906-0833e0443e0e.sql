-- Create table to track challenge payments
CREATE TABLE public.challenge_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  amount integer NOT NULL DEFAULT 500, -- in cents
  status text NOT NULL DEFAULT 'pending', -- pending, completed, failed
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.challenge_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON public.challenge_payments
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own pending payments
CREATE POLICY "Users can create their own payments"
ON public.challenge_payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add payment_id to challenge_joins to link payment
ALTER TABLE public.challenge_joins 
ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES public.challenge_payments(id),
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';