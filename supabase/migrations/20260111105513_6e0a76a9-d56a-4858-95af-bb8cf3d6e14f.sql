-- Consolidate overlapping policies

-- ============ profiles: Merge SELECT policies ============
DROP POLICY IF EXISTS "Authenticated users can view public profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" ON public.profiles
FOR SELECT TO authenticated
USING (true);

-- ============ squad_messages: Merge DELETE policies ============
DROP POLICY IF EXISTS "Authors can delete their own messages" ON public.squad_messages;
DROP POLICY IF EXISTS "Squad leads can delete messages" ON public.squad_messages;

CREATE POLICY "Authors or leads can delete messages" ON public.squad_messages
FOR DELETE TO authenticated
USING (
  ((select auth.uid()) = user_id) OR 
  EXISTS (SELECT 1 FROM public.squads WHERE squads.id = squad_messages.squad_id AND squads.lead_id = (select auth.uid()))
);

-- ============ submissions: Merge SELECT policies ============
DROP POLICY IF EXISTS "Authenticated users can view submission summaries" ON public.submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;

CREATE POLICY "Authenticated users can view submissions" ON public.submissions
FOR SELECT TO authenticated
USING (true);