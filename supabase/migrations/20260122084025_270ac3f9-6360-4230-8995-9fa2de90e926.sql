-- Create a security definer function to check if a profile is publicly viewable
CREATE OR REPLACE FUNCTION public.is_profile_public(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_settings
    WHERE user_id = _profile_id
      AND profile_visibility = 'public'
  )
$$;

-- Add policy allowing public profile viewing (respects profile_visibility setting)
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (
  (SELECT auth.uid() AS uid) = id  -- User can always see their own profile
  OR is_profile_public(id)          -- Or profile is set to public
);