-- Fix RLS performance: wrap auth.uid() with (select auth.uid())

-- ============ challenge_joins ============
DROP POLICY IF EXISTS "Users can create their own challenge joins" ON public.challenge_joins;
CREATE POLICY "Users can create their own challenge joins" ON public.challenge_joins
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own challenge joins" ON public.challenge_joins;
CREATE POLICY "Users can delete their own challenge joins" ON public.challenge_joins
FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own challenge joins" ON public.challenge_joins;
CREATE POLICY "Users can view their own challenge joins" ON public.challenge_joins
FOR SELECT USING ((select auth.uid()) = user_id);

-- ============ profiles ============
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;
CREATE POLICY "Users can view their own full profile" ON public.profiles
FOR SELECT USING ((select auth.uid()) = id);

-- ============ waitlist ============
DROP POLICY IF EXISTS "Users can view their own waitlist entries" ON public.waitlist;
CREATE POLICY "Users can view their own waitlist entries" ON public.waitlist
FOR SELECT USING ((user_id = (select auth.uid())) OR (user_id IS NULL));

-- ============ squads ============
DROP POLICY IF EXISTS "Authenticated users can create squads" ON public.squads;
CREATE POLICY "Authenticated users can create squads" ON public.squads
FOR INSERT WITH CHECK (((select auth.uid()) IS NOT NULL) AND ((select auth.uid()) = lead_id));

DROP POLICY IF EXISTS "Squad leads can delete their squads" ON public.squads;
CREATE POLICY "Squad leads can delete their squads" ON public.squads
FOR DELETE USING ((select auth.uid()) = lead_id);

DROP POLICY IF EXISTS "Squad leads can update their squads" ON public.squads;
CREATE POLICY "Squad leads can update their squads" ON public.squads
FOR UPDATE USING ((select auth.uid()) = lead_id);

-- ============ squad_members ============
DROP POLICY IF EXISTS "Members can leave or leads can remove" ON public.squad_members;
CREATE POLICY "Members can leave or leads can remove" ON public.squad_members
FOR DELETE USING (
  ((select auth.uid()) = user_id) OR 
  (EXISTS (SELECT 1 FROM squads WHERE squads.id = squad_members.squad_id AND squads.lead_id = (select auth.uid())))
);

DROP POLICY IF EXISTS "Members can update their own status" ON public.squad_members;
CREATE POLICY "Members can update their own status" ON public.squad_members
FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Squad leads can add members" ON public.squad_members;
CREATE POLICY "Squad leads can add members" ON public.squad_members
FOR INSERT WITH CHECK (
  ((select auth.uid()) IS NOT NULL) AND 
  (((select auth.uid()) = user_id) OR 
   (EXISTS (SELECT 1 FROM squads WHERE squads.id = squad_members.squad_id AND squads.lead_id = (select auth.uid()))))
);

-- ============ solutions ============
DROP POLICY IF EXISTS "Authenticated users can create solutions" ON public.solutions;
CREATE POLICY "Authenticated users can create solutions" ON public.solutions
FOR INSERT WITH CHECK (((select auth.uid()) IS NOT NULL) AND ((select auth.uid()) = created_by));

DROP POLICY IF EXISTS "Authenticated users can update solutions" ON public.solutions;
CREATE POLICY "Authenticated users can update solutions" ON public.solutions
FOR UPDATE USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Creators can delete solutions" ON public.solutions;
CREATE POLICY "Creators can delete solutions" ON public.solutions
FOR DELETE USING ((select auth.uid()) = created_by);

-- ============ solution_contributors ============
DROP POLICY IF EXISTS "Authenticated users can become contributors" ON public.solution_contributors;
CREATE POLICY "Authenticated users can become contributors" ON public.solution_contributors
FOR INSERT WITH CHECK (((select auth.uid()) IS NOT NULL) AND ((select auth.uid()) = user_id));

-- ============ solution_upvotes ============
DROP POLICY IF EXISTS "Authenticated users can upvote" ON public.solution_upvotes;
CREATE POLICY "Authenticated users can upvote" ON public.solution_upvotes
FOR INSERT WITH CHECK (((select auth.uid()) IS NOT NULL) AND ((select auth.uid()) = user_id));

DROP POLICY IF EXISTS "Users can remove their upvotes" ON public.solution_upvotes;
CREATE POLICY "Users can remove their upvotes" ON public.solution_upvotes
FOR DELETE USING ((select auth.uid()) = user_id);

-- ============ squad_messages ============
DROP POLICY IF EXISTS "Squad members can send messages" ON public.squad_messages;
CREATE POLICY "Squad members can send messages" ON public.squad_messages
FOR INSERT WITH CHECK (
  ((select auth.uid()) IS NOT NULL) AND 
  ((user_id = (select auth.uid())) OR (is_ai = true)) AND 
  (EXISTS (SELECT 1 FROM squad_members WHERE squad_members.squad_id = squad_messages.squad_id AND squad_members.user_id = (select auth.uid())))
);

DROP POLICY IF EXISTS "Squad messages viewable by members" ON public.squad_messages;
CREATE POLICY "Squad messages viewable by members" ON public.squad_messages
FOR SELECT USING (
  EXISTS (SELECT 1 FROM squad_members WHERE squad_members.squad_id = squad_messages.squad_id AND squad_members.user_id = (select auth.uid()))
);

DROP POLICY IF EXISTS "Authors can delete their own messages" ON public.squad_messages;
CREATE POLICY "Authors can delete their own messages" ON public.squad_messages
FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Squad leads can delete messages" ON public.squad_messages;
CREATE POLICY "Squad leads can delete messages" ON public.squad_messages
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.squads WHERE squads.id = squad_messages.squad_id AND squads.lead_id = (select auth.uid()))
);

DROP POLICY IF EXISTS "Authors can update their own messages" ON public.squad_messages;
CREATE POLICY "Authors can update their own messages" ON public.squad_messages
FOR UPDATE USING ((select auth.uid()) = user_id);

-- ============ submissions ============
DROP POLICY IF EXISTS "Users can create their own submissions" ON public.submissions;
CREATE POLICY "Users can create their own submissions" ON public.submissions
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own submissions" ON public.submissions;
CREATE POLICY "Users can delete their own submissions" ON public.submissions
FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own submissions" ON public.submissions;
CREATE POLICY "Users can update their own submissions" ON public.submissions
FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;
CREATE POLICY "Users can view their own submissions" ON public.submissions
FOR SELECT USING ((select auth.uid()) = user_id);

-- ============ problem_builders ============
DROP POLICY IF EXISTS "Users can join problems" ON public.problem_builders;
CREATE POLICY "Users can join problems" ON public.problem_builders
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can leave problems" ON public.problem_builders;
CREATE POLICY "Users can leave problems" ON public.problem_builders
FOR DELETE USING ((select auth.uid()) = user_id);

-- ============ user_settings ============
DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
CREATE POLICY "Users can create their own settings" ON public.user_settings
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
CREATE POLICY "Users can update their own settings" ON public.user_settings
FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
CREATE POLICY "Users can view their own settings" ON public.user_settings
FOR SELECT USING ((select auth.uid()) = user_id);