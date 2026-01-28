-- Remove the scheduled cron job for auto-generating ideas
SELECT cron.unschedule('generate-weekly-ideas');

-- Delete duplicate fake ideas with generic titles
DELETE FROM solutions 
WHERE title IN (
  'Sleep Optimization System',
  'Habit Stacking Assistant', 
  'Personalized Wellness Coach',
  'Energy-Based Task Scheduler',
  'Deep Work Session Manager',
  'Context Switching Defender'
);