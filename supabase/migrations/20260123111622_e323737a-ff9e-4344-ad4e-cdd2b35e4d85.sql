-- Drop the existing policy
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;

-- Recreate with optimized subquery pattern
CREATE POLICY "Users can delete their own settings" 
ON public.user_settings 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);