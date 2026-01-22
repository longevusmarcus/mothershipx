-- Create a secure view for public profile data that excludes sensitive fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  name,
  avatar_url,
  bio,
  location,
  website,
  twitter,
  github,
  created_at,
  updated_at
FROM public.profiles
WHERE is_profile_public(id);

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Update the profiles RLS policy to only allow users to see their own full profile
-- Others should use the public_profiles view
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Users can only view their own full profile (including email)
-- For other users' profiles, they should use the public_profiles view
CREATE POLICY "Users can only view their own full profile"
ON public.profiles
FOR SELECT
USING (( SELECT auth.uid() AS uid) = id);