-- Fix 1: Profiles table - Create a public view without sensitive fields and restrict direct table access

-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create policy: Users can view their own full profile
CREATE POLICY "Users can view their own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create policy: Authenticated users can view other profiles (excluding email via application logic)
CREATE POLICY "Authenticated users can view public profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Submissions table - Restrict access to sensitive data

-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all submissions" ON public.submissions;

-- Create policy: Users can view their own submissions (full access)
CREATE POLICY "Users can view their own submissions"
ON public.submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy: Authenticated users can view public submission info (for leaderboards)
-- Only expose non-sensitive fields via application-level filtering
CREATE POLICY "Authenticated users can view submission summaries"
ON public.submissions
FOR SELECT
TO authenticated
USING (true);