-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Recreate with optimized subquery pattern
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (user_id = (SELECT auth.uid()));