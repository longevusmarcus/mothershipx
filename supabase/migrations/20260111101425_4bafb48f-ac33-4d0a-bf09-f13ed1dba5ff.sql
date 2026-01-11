-- Create waitlist table for feature signups
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  feature TEXT NOT NULL CHECK (feature IN ('builds', 'leaderboard', 'general')),
  user_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (email, feature)
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can join the waitlist (even unauthenticated)
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist
FOR INSERT
WITH CHECK (true);

-- Users can view their own waitlist entries
CREATE POLICY "Users can view their own waitlist entries"
ON public.waitlist
FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

-- Index for faster lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_feature ON public.waitlist(feature);