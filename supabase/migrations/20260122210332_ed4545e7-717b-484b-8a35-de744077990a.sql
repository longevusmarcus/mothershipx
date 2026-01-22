-- Fix 1: Recreate public_profiles view with SECURITY INVOKER (default, safer)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.name,
  p.username,
  p.avatar_url,
  p.bio,
  p.location,
  p.website,
  p.github,
  p.twitter,
  p.created_at,
  p.updated_at
FROM public.profiles p
JOIN public.user_settings us ON us.user_id = p.id
WHERE us.profile_visibility = 'public';

-- Fix 2: Replace overly permissive notifications INSERT policy
-- Only allow system/service role or triggers to insert notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a more restrictive policy that only allows inserts via database functions/triggers
-- Users cannot directly insert notifications - only the system can via SECURITY DEFINER functions
CREATE POLICY "Notifications inserted via system only" 
ON public.notifications 
FOR INSERT 
WITH CHECK (false);

-- Note: Notifications are inserted via SECURITY DEFINER trigger functions like:
-- send_welcome_notification, notify_problem_builders_on_join, notify_challenge_ended
-- These bypass RLS, so we can safely set the policy to false for direct user inserts