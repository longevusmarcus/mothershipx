-- Drop the problematic trigger on solutions if it exists
DROP TRIGGER IF EXISTS auto_record_activity_on_solution ON public.solutions;

-- Create a new trigger function specifically for solutions
CREATE OR REPLACE FUNCTION public.auto_record_activity_on_solution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM record_user_activity(NEW.created_by);
  RETURN NEW;
END;
$$;

-- Create the trigger using the correct column
CREATE TRIGGER auto_record_activity_on_solution
  AFTER INSERT ON public.solutions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_record_activity_on_solution();