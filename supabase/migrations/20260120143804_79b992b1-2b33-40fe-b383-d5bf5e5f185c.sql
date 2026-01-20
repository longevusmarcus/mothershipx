-- Fix search_interests INSERT policy to be more restrictive
-- Allow anonymous submissions but ensure user_id matches if provided
DROP POLICY IF EXISTS "Anyone can submit search interests" ON public.search_interests;

CREATE POLICY "Anyone can submit search interests" 
ON public.search_interests 
FOR INSERT 
WITH CHECK (
  -- Email must be valid
  (email IS NOT NULL AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
  AND 
  -- Query must not be empty
  (query IS NOT NULL AND length(query) > 0 AND length(query) <= 500)
  AND 
  -- If user_id is provided, it must match the authenticated user
  (user_id IS NULL OR user_id = (SELECT auth.uid()))
);