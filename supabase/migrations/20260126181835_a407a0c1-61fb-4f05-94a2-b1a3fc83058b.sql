-- Delete dummy solutions that were auto-generated with generic titles
DELETE FROM solution_upvotes 
WHERE solution_id IN (
  SELECT id FROM solutions 
  WHERE title IN ('Personalized Wellness Coach', 'Habit Stacking Assistant', 'Sleep Optimization System')
);

DELETE FROM solution_contributors 
WHERE solution_id IN (
  SELECT id FROM solutions 
  WHERE title IN ('Personalized Wellness Coach', 'Habit Stacking Assistant', 'Sleep Optimization System')
);

DELETE FROM solutions 
WHERE title IN ('Personalized Wellness Coach', 'Habit Stacking Assistant', 'Sleep Optimization System');