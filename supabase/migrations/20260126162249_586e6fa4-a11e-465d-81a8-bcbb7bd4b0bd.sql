-- Clear template-based hidden insights so they get regenerated with AI
UPDATE problems SET hidden_insight = NULL WHERE 
  hidden_insight->>'hiddenSignal' ILIKE '%simplification is the new premium%' 
  OR hidden_insight->>'hiddenSignal' ILIKE '%community-driven solutions outperform%' 
  OR hidden_insight->>'hiddenSignal' ILIKE '%market gap exists for human-centered%' 
  OR hidden_insight->>'realProblem' ILIKE '%emotional burden%is underestimated%' 
  OR hidden_insight->>'realProblem' ILIKE '%people seek validation%'
  OR hidden_insight->>'realProblem' ILIKE '%Users feel overwhelmed by existing solutions%'
  OR hidden_insight->>'surfaceAsk' ILIKE '%How do I solve%'
  OR hidden_insight->>'surfaceAsk' ILIKE '%What''s the best%solution%'
  OR hidden_insight->>'surfaceAsk' ILIKE '%I need help with%';