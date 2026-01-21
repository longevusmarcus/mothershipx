-- Delete existing incorrect competitors for Reddit and YouTube problems
-- so they can be refreshed with proper app/startup results
DELETE FROM public.problem_competitors
WHERE problem_id IN (
  SELECT id FROM public.problems 
  WHERE sources::text ILIKE '%"name":"reddit"%' 
     OR sources::text ILIKE '%"source":"reddit"%'
     OR sources::text ILIKE '%"name":"youtube"%'
);