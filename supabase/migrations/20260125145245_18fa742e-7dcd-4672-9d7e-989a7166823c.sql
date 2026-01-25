-- Delete all old AI-generated solutions to make room for new high-quality ones with proper landing pages and images
DELETE FROM solutions WHERE ai_generated = true;