-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON public.user_activity;

-- Recreate with optimized auth.uid() wrapped in subquery
CREATE POLICY "Users can view their own activity" 
ON public.user_activity 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own activity" 
ON public.user_activity 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own activity" 
ON public.user_activity 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);