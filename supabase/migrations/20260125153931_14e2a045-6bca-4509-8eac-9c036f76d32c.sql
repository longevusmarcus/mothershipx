-- Drop the two existing DELETE policies
DROP POLICY IF EXISTS "Admins can delete any solution" ON public.solutions;
DROP POLICY IF EXISTS "Creators can delete solutions" ON public.solutions;

-- Create a single consolidated DELETE policy
CREATE POLICY "Admins or creators can delete solutions" 
ON public.solutions 
FOR DELETE 
USING (
  (( SELECT auth.uid() AS uid) = created_by) 
  OR has_role(( SELECT auth.uid() AS uid), 'admin'::app_role)
);