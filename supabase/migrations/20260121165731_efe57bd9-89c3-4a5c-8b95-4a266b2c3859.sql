-- Fix overly permissive INSERT policy on paywall_events
DROP POLICY IF EXISTS "Anyone can insert paywall events" ON public.paywall_events;

-- Only authenticated users can insert, and user_id must match their auth.uid() if provided
CREATE POLICY "Authenticated users can insert paywall events" ON public.paywall_events
FOR INSERT WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL 
  AND (user_id IS NULL OR user_id = (SELECT auth.uid()))
);