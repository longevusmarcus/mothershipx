-- Fix RLS policies for performance optimization

-- 1. Fix problems table
DROP POLICY IF EXISTS "Admins can delete problems" ON public.problems;
CREATE POLICY "Admins can delete problems" ON public.problems
FOR DELETE USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- 2. Fix user_roles table - drop both overlapping policies and create optimized ones
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create single optimized SELECT policy that handles both cases
CREATE POLICY "Users can view own roles or admins all" ON public.user_roles
FOR SELECT USING (
  ((SELECT auth.uid()) = user_id) 
  OR has_role((SELECT auth.uid()), 'admin'::app_role)
);

-- Create separate policies for INSERT, UPDATE, DELETE for admins only
CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- 3. Fix subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- 4. Fix paywall_events table
DROP POLICY IF EXISTS "Admins can view all paywall events" ON public.paywall_events;
CREATE POLICY "Admins can view all paywall events" ON public.paywall_events
FOR SELECT USING (has_role((SELECT auth.uid()), 'admin'::app_role));