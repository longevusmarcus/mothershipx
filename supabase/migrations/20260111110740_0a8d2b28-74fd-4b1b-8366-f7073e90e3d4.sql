-- Fix 1: Restrict profiles table - users can only see their own profile
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Fix 2: Restrict submissions table - users can only see their own submissions
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.submissions;

CREATE POLICY "Users can view their own submissions"
ON public.submissions
FOR SELECT
USING (auth.uid() = user_id);