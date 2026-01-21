-- Allow admins to delete problems from the library
CREATE POLICY "Admins can delete problems"
ON public.problems
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));