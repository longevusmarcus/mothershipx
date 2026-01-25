-- Fix: remove legacy trigger on public.solutions that calls auto_record_activity() expecting NEW.user_id
-- This trigger conflicts with solutions schema (uses created_by instead).
DROP TRIGGER IF EXISTS record_activity_on_solution_create ON public.solutions;

-- Ensure the correct trigger/function exists for solutions
CREATE OR REPLACE FUNCTION public.auto_record_activity_on_solution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.record_user_activity(NEW.created_by);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_record_activity_on_solution ON public.solutions;
CREATE TRIGGER auto_record_activity_on_solution
  AFTER INSERT ON public.solutions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_record_activity_on_solution();
