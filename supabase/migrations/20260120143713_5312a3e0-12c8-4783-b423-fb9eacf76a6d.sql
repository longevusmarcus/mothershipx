-- Fix builder_verifications policies
DROP POLICY IF EXISTS "Users can view their own verification" ON public.builder_verifications;
DROP POLICY IF EXISTS "Users can create their own verification" ON public.builder_verifications;
DROP POLICY IF EXISTS "Users can update their own verification" ON public.builder_verifications;

CREATE POLICY "Users can view their own verification" 
ON public.builder_verifications 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own verification" 
ON public.builder_verifications 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own verification" 
ON public.builder_verifications 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

-- Fix search_interests policy
DROP POLICY IF EXISTS "Users can view their own search interests" ON public.search_interests;

CREATE POLICY "Users can view their own search interests" 
ON public.search_interests 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

-- Fix challenge_payments policies
DROP POLICY IF EXISTS "Users can view their own payments" ON public.challenge_payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.challenge_payments;

CREATE POLICY "Users can view their own payments" 
ON public.challenge_payments 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.challenge_payments 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);