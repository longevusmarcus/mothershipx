-- Allow admins to delete any solution
CREATE POLICY "Admins can delete any solution"
ON public.solutions
FOR DELETE
USING (has_role((SELECT auth.uid()), 'admin'::app_role));