-- Fix user_problem_pins RLS policies for performance
DROP POLICY IF EXISTS "Users can view their own pins" ON public.user_problem_pins;
DROP POLICY IF EXISTS "Users can create their own pins" ON public.user_problem_pins;
DROP POLICY IF EXISTS "Users can delete their own pins" ON public.user_problem_pins;

CREATE POLICY "Users can view their own pins" 
ON public.user_problem_pins 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own pins" 
ON public.user_problem_pins 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own pins" 
ON public.user_problem_pins 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

-- Consolidate duplicate SELECT policies on profiles
DROP POLICY IF EXISTS "Users can only view their own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING ((SELECT auth.uid()) = id);