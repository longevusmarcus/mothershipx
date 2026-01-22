-- Drop the existing view
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view WITHOUT security_invoker so it uses definer permissions
-- This allows the view to access profiles table for public viewing
CREATE VIEW public.public_profiles AS
SELECT 
  p.id,
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

-- Grant select on the view to anon and authenticated roles
GRANT SELECT ON public.public_profiles TO anon, authenticated;