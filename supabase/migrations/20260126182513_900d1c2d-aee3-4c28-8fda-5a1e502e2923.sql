-- Delete upvotes and contributors for all dummy solutions first
DELETE FROM solution_upvotes 
WHERE solution_id IN (
  SELECT id FROM solutions 
  WHERE title IN (
    'Context Switching Defender',
    'Deep Work Session Manager', 
    'Energy-Based Task Scheduler',
    'AI-Powered Revenue Intelligence',
    'Customer Success Automation Hub',
    'Startup Metrics Command Center'
  )
  OR title LIKE '% AI Assistant'
  OR title LIKE '% Chrome Extension'
  OR title LIKE '% Community Platform'
);

DELETE FROM solution_contributors 
WHERE solution_id IN (
  SELECT id FROM solutions 
  WHERE title IN (
    'Context Switching Defender',
    'Deep Work Session Manager', 
    'Energy-Based Task Scheduler',
    'AI-Powered Revenue Intelligence',
    'Customer Success Automation Hub',
    'Startup Metrics Command Center'
  )
  OR title LIKE '% AI Assistant'
  OR title LIKE '% Chrome Extension'
  OR title LIKE '% Community Platform'
);

-- Delete all dummy solutions
DELETE FROM solutions 
WHERE title IN (
  'Context Switching Defender',
  'Deep Work Session Manager', 
  'Energy-Based Task Scheduler',
  'AI-Powered Revenue Intelligence',
  'Customer Success Automation Hub',
  'Startup Metrics Command Center'
)
OR title LIKE '% AI Assistant'
OR title LIKE '% Chrome Extension'
OR title LIKE '% Community Platform';