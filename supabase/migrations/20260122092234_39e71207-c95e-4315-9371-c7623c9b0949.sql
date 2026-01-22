-- Drop and recreate the view with security_invoker to fix the security warning
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
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