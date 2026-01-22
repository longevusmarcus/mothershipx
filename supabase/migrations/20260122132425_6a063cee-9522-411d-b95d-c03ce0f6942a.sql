-- Function to notify existing builders when someone new joins a problem
CREATE OR REPLACE FUNCTION public.notify_problem_builders_on_join()
RETURNS TRIGGER AS $$
DECLARE
  problem_title TEXT;
  new_builder_name TEXT;
  existing_builder RECORD;
BEGIN
  -- Get the problem title
  SELECT title INTO problem_title FROM public.problems WHERE id = NEW.problem_id;
  
  -- Get the new builder's name
  SELECT COALESCE(name, email, 'Someone') INTO new_builder_name 
  FROM public.profiles WHERE id = NEW.user_id;
  
  -- Notify all existing builders on this problem (except the one who just joined)
  FOR existing_builder IN 
    SELECT pb.user_id 
    FROM public.problem_builders pb
    WHERE pb.problem_id = NEW.problem_id 
    AND pb.user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, action_url)
    VALUES (
      existing_builder.user_id,
      'collab_request',
      'New Builder Joined',
      new_builder_name || ' joined "' || COALESCE(problem_title, 'a problem') || '" you''re building.',
      '/problem/' || NEW.problem_id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new problem builder joins
CREATE TRIGGER on_problem_builder_join_notify
AFTER INSERT ON public.problem_builders
FOR EACH ROW
EXECUTE FUNCTION public.notify_problem_builders_on_join();

-- Function to notify participants when a challenge ends
CREATE OR REPLACE FUNCTION public.notify_challenge_ended()
RETURNS TRIGGER AS $$
DECLARE
  participant RECORD;
BEGIN
  -- Only trigger when status changes to 'completed' or 'voting'
  IF OLD.status = 'active' AND (NEW.status = 'completed' OR NEW.status = 'voting') THEN
    -- Notify all participants of this challenge
    FOR participant IN 
      SELECT DISTINCT user_id FROM public.challenge_joins WHERE challenge_id = NEW.id
      UNION
      SELECT DISTINCT user_id FROM public.submissions WHERE challenge_id = NEW.id
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, action_url)
      VALUES (
        participant.user_id,
        'success',
        CASE WHEN NEW.status = 'voting' THEN 'Challenge Voting Started' ELSE 'Challenge Ended' END,
        '"' || NEW.title || '" has ' || CASE WHEN NEW.status = 'voting' THEN 'entered the voting phase!' ELSE 'ended! Check out the results.' END,
        '/challenges/' || NEW.id || '/results'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for challenge status changes
CREATE TRIGGER on_challenge_status_change_notify
AFTER UPDATE OF status ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.notify_challenge_ended();

-- Function to send welcome notification on new user signup
CREATE OR REPLACE FUNCTION public.send_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, action_url)
  VALUES (
    NEW.id,
    'success',
    'Welcome to Mothership!',
    'Start exploring opportunities and building solutions.',
    '/problems'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for welcome notification on profile creation
CREATE TRIGGER on_profile_created_welcome
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.send_welcome_notification();