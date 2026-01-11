-- Fix RLS performance for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING ((SELECT auth.uid()) = id);

-- Fix RLS performance for submissions table
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;

CREATE POLICY "Users can view their own submissions"
ON public.submissions
FOR SELECT
USING ((SELECT auth.uid()) = user_id);