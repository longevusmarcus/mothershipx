-- Seed problems table with mock market intelligence data
-- Using deterministic UUIDs based on the original string IDs for consistency

INSERT INTO public.problems (id, title, subtitle, category, niche, sentiment, opportunity_score, market_size, demand_velocity, competition_gap, views, saves, shares, trending_rank, is_viral, slots_total, slots_filled, active_builders_last_24h, sources, pain_points, hidden_insight, discovered_at, peak_prediction)
VALUES
  -- mh-001: Anxiety apps feel clinical
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Anxiety apps feel clinical, not human', 'Gen Z wants vibe-based mental wellness, not therapy-lite', 'Mental Health', 'mental-health', 'exploding', 94, '$4.2B', 156, 72, 2400000, 89000, 34000, 1, true, 25, 8, 5,
   '[{"source": "tiktok", "metric": "Videos", "value": "847K", "change": 234}, {"source": "google_trends", "metric": "Search Volume", "value": "89/100", "change": 45}, {"source": "reddit", "metric": "Mentions", "value": "12.4K", "change": 67}]'::jsonb,
   ARRAY['Meditation apps feel like homework', 'CBT exercises are too textbook', 'Want something that matches my aesthetic/vibe', 'Need quick 2-min resets, not 20-min sessions'],
   '{"surfaceAsk": "I need a better meditation app", "realProblem": "I want emotional regulation that does not feel like I am broken", "hiddenSignal": "Mental wellness is becoming lifestyle content, not healthcare"}'::jsonb,
   '2026-01-02', 'Feb 2026'),

  -- ob-001: GLP-1 users need habit stacking
  ('a1b2c3d4-0002-4000-8000-000000000002', 'GLP-1 users need habit stacking support', 'Ozempic/Wegovy users struggle to build sustainable habits during treatment', 'Weight & Fitness', 'obesity', 'exploding', 91, '$8.1B', 189, 85, 5200000, 156000, 78000, 2, true, 30, 12, 8,
   '[{"source": "tiktok", "metric": "Videos", "value": "2.1M", "change": 312}, {"source": "google_trends", "metric": "Search Volume", "value": "94/100", "change": 78}, {"source": "freelancer", "metric": "Job Posts", "value": "234", "change": 156}]'::jsonb,
   ARRAY['Lost weight but do not know how to eat normally', 'No energy for gym, need low-effort movement', 'Food noise is gone but so is all food joy', 'Scared of regaining when I stop medication'],
   '{"surfaceAsk": "I need a meal plan for Ozempic users", "realProblem": "I need to rebuild my entire relationship with food and movement", "hiddenSignal": "GLP-1 is creating a new category: metabolic rehabilitation"}'::jsonb,
   '2026-01-01', 'Mar 2026'),

  -- sk-001: Ingredient-checking is exhausting
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Ingredient-checking is exhausting', 'Skincare-obsessed users want AI to decode products instantly', 'Skin & Beauty', 'skin', 'rising', 87, '$2.8B', 98, 65, 890000, 45000, 21000, 5, false, 20, 6, 3,
   '[{"source": "tiktok", "metric": "Videos", "value": "456K", "change": 89}, {"source": "google_trends", "metric": "Search Volume", "value": "72/100", "change": 34}, {"source": "reddit", "metric": "r/SkincareAddiction", "value": "8.9K", "change": 45}]'::jsonb,
   ARRAY['Cannot remember which ingredients conflict', 'Every product has 30+ ingredients to research', 'Do not trust influencer recommendations anymore', 'My skin type changes seasonally'],
   '{"surfaceAsk": "Is this product good for acne?", "realProblem": "I need a trusted filter for an overwhelming market", "hiddenSignal": "Beauty consumers want evidence-based curation, not more options"}'::jsonb,
   '2026-01-03', NULL),

  -- gt-001: Gut health feels like pseudoscience
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Gut health feels like pseudoscience', 'People want gut-brain connection tools that actually work', 'Gut Health', 'gut', 'rising', 82, '$1.9B', 76, 78, 1200000, 67000, 28000, 4, false, 15, 4, 2,
   '[{"source": "tiktok", "metric": "Videos", "value": "678K", "change": 112}, {"source": "google_trends", "metric": "Search Volume", "value": "68/100", "change": 28}, {"source": "hackernews", "metric": "Discussions", "value": "89", "change": 34}]'::jsonb,
   ARRAY['Too many supplements, no clear protocol', 'Bloating tracking apps are too manual', 'Want to understand my triggers without elimination diets', 'Probiotics feel like a lottery'],
   '{"surfaceAsk": "Which probiotic should I take?", "realProblem": "I want personalized gut optimization without becoming a biohacker", "hiddenSignal": "Gut health is the next frontier of personalized wellness"}'::jsonb,
   '2026-01-04', NULL),

  -- pr-001: Focus apps don't understand context switching
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Focus apps do not understand context switching', 'Knowledge workers need flow protection, not just timers', 'Productivity', 'productivity', 'rising', 85, '$6.2B', 67, 45, 780000, 56000, 19000, 6, false, 25, 18, 4,
   '[{"source": "tiktok", "metric": "Videos", "value": "234K", "change": 45}, {"source": "reddit", "metric": "r/productivity", "value": "15.6K", "change": 23}, {"source": "freelancer", "metric": "Tool Requests", "value": "456", "change": 89}]'::jsonb,
   ARRAY['Pomodoro does not work for creative work', 'My calendar is lies—meetings bleed into focus time', 'Notifications are the enemy but I cannot go dark', 'Energy management > time management'],
   '{"surfaceAsk": "I need a better focus app", "realProblem": "I need protection from my environment, not self-discipline tools", "hiddenSignal": "Productivity is shifting from optimization to boundary enforcement"}'::jsonb,
   '2026-01-05', NULL),

  -- cr-001: Career pivots feel impossible after 30
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Career pivots feel impossible after 30', 'Mid-career professionals need skill translation, not job boards', 'Career', 'career', 'stable', 79, '$3.4B', 54, 68, 450000, 89000, 34000, NULL, false, 20, 11, 3,
   '[{"source": "tiktok", "metric": "Videos", "value": "312K", "change": 67}, {"source": "google_trends", "metric": "Search Volume", "value": "61/100", "change": 12}, {"source": "freelancer", "metric": "Career Coaching", "value": "789", "change": 34}]'::jsonb,
   ARRAY['LinkedIn is performative, not helpful', 'Resume does not show transferable skills', 'Do not know what I am qualified for anymore', 'Afraid to start over at lower salary'],
   '{"surfaceAsk": "How do I update my resume?", "realProblem": "I need someone to see my potential, not my job titles", "hiddenSignal": "Career transition is an identity crisis, not a logistics problem"}'::jsonb,
   '2026-01-03', NULL),

  -- cn-001: Dating apps killed spontaneous connection
  ('a1b2c3d4-0007-4000-8000-000000000007', 'Dating apps killed spontaneous connection', 'People crave IRL meetups but do not know how to start', 'Connections', 'connections', 'exploding', 88, '$5.1B', 134, 82, 3100000, 178000, 92000, 3, true, 20, 7, 6,
   '[{"source": "tiktok", "metric": "Videos", "value": "1.4M", "change": 189}, {"source": "google_trends", "metric": "Search Volume", "value": "81/100", "change": 56}, {"source": "reddit", "metric": "r/dating", "value": "23.4K", "change": 78}]'::jsonb,
   ARRAY['App fatigue is real—swiping feels like a job', 'Want to meet people but not go out', 'Third places are disappearing', 'Making friends as an adult is harder than dating'],
   '{"surfaceAsk": "Which dating app should I use?", "realProblem": "I want organic connection without the performance pressure", "hiddenSignal": "The loneliness epidemic is creating demand for structured serendipity"}'::jsonb,
   '2026-01-01', 'Feb 2026'),

  -- mh-002: ADHD tools ignore emotional dysregulation
  ('a1b2c3d4-0008-4000-8000-000000000008', 'ADHD tools ignore emotional dysregulation', 'Beyond task management—ADHD brains need emotional co-regulation', 'Mental Health', 'mental-health', 'rising', 86, '$2.1B', 89, 76, 1800000, 123000, 67000, 7, false, 15, 9, 4,
   '[{"source": "tiktok", "metric": "Videos", "value": "567K", "change": 123}, {"source": "reddit", "metric": "r/ADHD", "value": "34.5K", "change": 89}, {"source": "google_trends", "metric": "Search Volume", "value": "76/100", "change": 34}]'::jsonb,
   ARRAY['To-do apps make me feel worse, not better', 'Rejection sensitivity spirals ruin my day', 'Need body doubling but cannot always find people', 'Medication helps focus but not emotional storms'],
   '{"surfaceAsk": "What is the best ADHD planner?", "realProblem": "I need emotional scaffolding, not more productivity hacks", "hiddenSignal": "ADHD community is redefining the condition as neurotype, not disorder"}'::jsonb,
   '2026-01-02', NULL)

ON CONFLICT (id) DO NOTHING;