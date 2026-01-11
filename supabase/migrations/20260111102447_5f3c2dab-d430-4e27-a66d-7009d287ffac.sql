-- Squads table for team formation
CREATE TABLE public.squads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  max_members INTEGER NOT NULL DEFAULT 4,
  momentum INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  is_hiring BOOLEAN NOT NULL DEFAULT true,
  streak INTEGER NOT NULL DEFAULT 0,
  lead_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Squad members table
CREATE TABLE public.squad_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  is_online BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(squad_id, user_id)
);

-- Squad messages for team chat
CREATE TABLE public.squad_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID,
  content TEXT NOT NULL,
  is_ai BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Solutions table for the solutions lab
CREATE TABLE public.solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  approach TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  market_fit INTEGER NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  forks INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  edit_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'concept' CHECK (status IN ('concept', 'validated', 'building', 'launched')),
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  last_editor_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Solution contributors (many-to-many)
CREATE TABLE public.solution_contributors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  contributed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(solution_id, user_id)
);

-- Solution upvotes (track who upvoted)
CREATE TABLE public.solution_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(solution_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_upvotes ENABLE ROW LEVEL SECURITY;

-- Squads policies
CREATE POLICY "Squads are viewable by everyone" ON public.squads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create squads" ON public.squads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = lead_id);
CREATE POLICY "Squad leads can update their squads" ON public.squads FOR UPDATE USING (auth.uid() = lead_id);
CREATE POLICY "Squad leads can delete their squads" ON public.squads FOR DELETE USING (auth.uid() = lead_id);

-- Squad members policies
CREATE POLICY "Squad members are viewable by everyone" ON public.squad_members FOR SELECT USING (true);
CREATE POLICY "Squad leads can add members" ON public.squad_members FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.squads WHERE id = squad_id AND lead_id = auth.uid())
  )
);
CREATE POLICY "Members can leave or leads can remove" ON public.squad_members FOR DELETE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.squads WHERE id = squad_id AND lead_id = auth.uid())
);
CREATE POLICY "Members can update their own status" ON public.squad_members FOR UPDATE USING (auth.uid() = user_id);

-- Squad messages policies
CREATE POLICY "Squad messages viewable by members" ON public.squad_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.squad_members WHERE squad_id = squad_messages.squad_id AND user_id = auth.uid())
);
CREATE POLICY "Squad members can send messages" ON public.squad_messages FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR is_ai = true
  ) AND EXISTS (SELECT 1 FROM public.squad_members WHERE squad_id = squad_messages.squad_id AND user_id = auth.uid())
);

-- Solutions policies
CREATE POLICY "Solutions are viewable by everyone" ON public.solutions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create solutions" ON public.solutions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);
CREATE POLICY "Authenticated users can update solutions" ON public.solutions FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Creators can delete solutions" ON public.solutions FOR DELETE USING (auth.uid() = created_by);

-- Solution contributors policies
CREATE POLICY "Contributors viewable by everyone" ON public.solution_contributors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can become contributors" ON public.solution_contributors FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Solution upvotes policies
CREATE POLICY "Upvotes viewable by everyone" ON public.solution_upvotes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upvote" ON public.solution_upvotes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
CREATE POLICY "Users can remove their upvotes" ON public.solution_upvotes FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for chat
ALTER TABLE public.squad_messages REPLICA IDENTITY FULL;

-- Trigger to update squad member count
CREATE OR REPLACE FUNCTION public.update_squad_on_member_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.squads SET updated_at = now() WHERE id = NEW.squad_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.squads SET updated_at = now() WHERE id = OLD.squad_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_squad_member_change
AFTER INSERT OR DELETE ON public.squad_members
FOR EACH ROW
EXECUTE FUNCTION public.update_squad_on_member_change();

-- Trigger to increment upvotes count
CREATE OR REPLACE FUNCTION public.update_solution_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.solutions SET upvotes = upvotes + 1 WHERE id = NEW.solution_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.solutions SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.solution_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_solution_upvote_change
AFTER INSERT OR DELETE ON public.solution_upvotes
FOR EACH ROW
EXECUTE FUNCTION public.update_solution_upvotes();

-- Trigger to update solutions updated_at
CREATE TRIGGER update_solutions_updated_at
BEFORE UPDATE ON public.solutions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update squads updated_at
CREATE TRIGGER update_squads_updated_at
BEFORE UPDATE ON public.squads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();