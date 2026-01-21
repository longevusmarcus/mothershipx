-- Create paywall_events table for analytics tracking
CREATE TABLE public.paywall_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  feature text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.paywall_events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (anonymous for non-logged-in users)
CREATE POLICY "Anyone can insert paywall events"
ON public.paywall_events
FOR INSERT
WITH CHECK (true);

-- Only admins can view all events (for analytics)
CREATE POLICY "Admins can view all paywall events"
ON public.paywall_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for analytics queries
CREATE INDEX idx_paywall_events_created_at ON public.paywall_events(created_at DESC);
CREATE INDEX idx_paywall_events_event_type ON public.paywall_events(event_type);
CREATE INDEX idx_paywall_events_feature ON public.paywall_events(feature);