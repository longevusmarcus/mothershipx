-- Add username column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Update the public_profiles view to include username
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  p.id,
  p.username,
  p.name,
  p.avatar_url,
  p.bio,
  p.location,
  p.website,
  p.twitter,
  p.github,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE public.is_profile_public(p.id);

-- Grant select on the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;