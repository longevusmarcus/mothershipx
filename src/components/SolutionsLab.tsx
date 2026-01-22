import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  ThumbsUp,
  MessageSquare,
  GitBranch,
  Clock,
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
  History,
  Trophy,
  Target,
  Zap,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useSolutions, type Solution } from "@/hooks/useSolutions";
import { useVerifiedBuilders } from "@/hooks/useVerifiedBuilders";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface SolutionsLabProps {
  problemId: string;
  problemTitle: string;
  problemTrend?: string;
  problemPainPoints?: string[];
  problemCategory?: string;
  opportunityScore?: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  concept: { label: "Concept", color: "bg-muted text-muted-foreground" },
  validated: { label: "Validated", color: "bg-blue-500/10 text-blue-500" },
  building: { label: "Building", color: "bg-amber-500/10 text-amber-500" },
  launched: { label: "Launched", color: "bg-green-500/10 text-green-500" },
};

// Generate smart AI-suggested solutions based on problem data
function generateAISuggestions(
  problemTitle: string, 
  trend?: string, 
  painPoints?: string[],
  category?: string,
  opportunityScore?: number
): Solution[] {
  // Extract key themes from problem data
  const mainPainPoint = painPoints?.[0] || "user frustration";
  const secondPainPoint = painPoints?.[1] || "lack of automation";
  const thirdPainPoint = painPoints?.[2] || "poor user experience";
  const fourthPainPoint = painPoints?.[3] || "time constraints";
  const trendContext = trend || problemTitle;
  const categoryContext = category || "SaaS";
  
  // Determine solution archetypes based on category and problem context
  const problemLower = problemTitle.toLowerCase();
  const categoryLower = categoryContext.toLowerCase();
  
  // Category-specific solution templates
  const isMentalHealth = categoryLower.includes("mental") || problemLower.includes("anxiety") || problemLower.includes("adhd");
  const isWeight = categoryLower.includes("weight") || categoryLower.includes("fitness") || problemLower.includes("glp") || problemLower.includes("ozempic");
  const isSkin = categoryLower.includes("skin") || categoryLower.includes("beauty") || problemLower.includes("ingredient");
  const isGut = categoryLower.includes("gut") || problemLower.includes("gut") || problemLower.includes("probiotic");
  const isProductivity = categoryLower.includes("productivity") || problemLower.includes("focus") || problemLower.includes("context");
  const isCareer = categoryLower.includes("career") || problemLower.includes("pivot") || problemLower.includes("career");
  const isConnections = categoryLower.includes("connection") || problemLower.includes("dating") || problemLower.includes("connection");
  const isBusiness = categoryLower.includes("business") || categoryLower.includes("entrepreneur") || problemLower.includes("startup") || problemLower.includes("saas") || problemLower.includes("revenue") || problemLower.includes("customer") || problemLower.includes("churn") || problemLower.includes("pricing") || problemLower.includes("market") || problemLower.includes("launch");

  // Generate unique solutions based on problem type
  let suggestions: Partial<Solution>[] = [];

  if (isMentalHealth) {
    const isADHD = problemLower.includes("adhd");
    suggestions = [
      {
        id: "ai-suggestion-1",
        title: isADHD ? "Emotional Co-Regulation Companion" : "Vibe-Based Mood Resets",
        description: isADHD 
          ? `AI-powered emotional support system that provides real-time co-regulation for ADHD brains. Addresses "${mainPainPoint}" with body doubling features and rejection sensitivity support.`
          : `Aesthetic-first wellness moments that match your energy. Forget clinical CBT—this is "${mainPainPoint}" solved with 2-minute vibe shifts and sensory resets.`,
        approach: isADHD
          ? `**Phase 1 - Emotional First Aid** (Week 1-2)
• Build panic button for rejection sensitivity spirals
• AI voice companion for real-time emotional grounding
• Virtual body doubling rooms available 24/7

**Phase 2 - Pattern Recognition** (Week 3-4)
• Track emotional triggers and energy patterns
• Proactive alerts before burnout hits
• "${secondPainPoint}" - medication + mood correlation insights

**Phase 3 - Community** (Week 5+)
• Matching system for accountability buddies
• Shared body doubling sessions
• Expert Q&As with ADHD coaches`
          : `**Phase 1 - Vibe Library** (Week 1-2)
• Curate 50+ aesthetic mood reset videos (2 min each)
• Match content to current energy state with AI
• "${mainPainPoint}" - no homework, just vibes

**Phase 2 - Personalization** (Week 3-4)
• Learn user's aesthetic preferences and triggers
• Create personalized wellness playlists
• Add quick breathing exercises with visual flair

**Phase 3 - Social** (Week 5+)
• Share your resets with friends
• Trending vibes leaderboard
• Creator tools for user-generated content`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 15) + 12,
        forks: Math.floor(Math.random() * 5) + 3,
        comments: Math.floor(Math.random() * 8) + 4,
        edit_count: 1,
        market_fit: Math.min(94, (opportunityScore || 75) + Math.floor(Math.random() * 10)),
        status: "concept",
        tech_stack: ["React Native", "Supabase", "ElevenLabs", "OpenAI"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-2",
        title: isADHD ? "ADHD Task Gamification Engine" : "Anxiety Pocket Companion",
        description: isADHD
          ? `Turn overwhelming tasks into dopamine-friendly micro-wins. Not another to-do app—this gamifies "${secondPainPoint}" with streaks, rewards, and ADHD-friendly task chunking.`
          : `Your pocket friend for anxious moments. Quick grounding exercises, breathing patterns, and comfort scripts for when "${thirdPainPoint}" hits hard.`,
        approach: isADHD
          ? `**Core Mechanic**
• Break any task into 5-min "quests"
• Earn XP and unlock cosmetics
• Body doubling mode with live players

**ADHD-Specific Features**
• Visual progress bars (dopamine hits)
• Random reward drops to maintain interest
• "${thirdPainPoint}" - no guilt for skipped days

**Monetization**
• Free tier with basic gamification
• $8/month for premium cosmetics + features
• Family plans for ADHD households`
          : `**Core Features**
• SOS button for panic moments
• AI-generated comfort messages
• Haptic breathing patterns on Apple Watch

**Personalization**
• Learn what calms YOU specifically
• Track anxiety patterns over time
• Export insights for therapists

**Why This Works**
• "${fourthPainPoint}" - ultra-quick interventions
• No login required in crisis moments
• Works offline for reliability`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 12) + 8,
        forks: Math.floor(Math.random() * 4) + 2,
        comments: Math.floor(Math.random() * 6) + 3,
        edit_count: 1,
        market_fit: Math.min(88, (opportunityScore || 70) + Math.floor(Math.random() * 8)),
        status: "concept",
        tech_stack: isADHD ? ["Unity", "Supabase", "RevenueCat"] : ["Swift", "HealthKit", "Supabase"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-3",
        title: isADHD ? "Neural Buddy Matching" : "Wellness Content Curator",
        description: isADHD
          ? `Match with other ADHD brains for mutual support. Addresses "${fourthPainPoint}" through structured peer connections and shared experiences.`
          : `AI that curates mental wellness content from TikTok, YouTube, and podcasts that actually resonates. No clinical stuff—just "${mainPainPoint}" content that gets you.`,
        approach: isADHD
          ? `**Matching Algorithm**
• Pair users by ADHD subtype and interests
• Scheduled check-ins with matched buddies
• Group sessions for common struggles

**Features**
• Async voice messages for support
• Shared wins celebration board
• "${secondPainPoint}" - peer medication experiences

**Safety**
• AI moderation for crisis detection
• Professional escalation paths
• Community guidelines enforcement`
          : `**Content Engine**
• Scrape trending wellness content daily
• AI filters for aesthetic match + actual helpfulness
• Personalized daily digest

**Discovery**
• Swipe interface for content
• Save to mood-specific playlists
• Share with wellness circles

**Creator Side**
• Analytics for wellness creators
• Trend predictions for content planning`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 10) + 5,
        forks: Math.floor(Math.random() * 3) + 1,
        comments: Math.floor(Math.random() * 5) + 2,
        edit_count: 1,
        market_fit: Math.min(82, (opportunityScore || 65) + Math.floor(Math.random() * 6)),
        status: "concept",
        tech_stack: isADHD ? ["Next.js", "Supabase", "Stream Chat"] : ["React", "TikTok API", "YouTube API", "Gemini"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  } else if (isWeight) {
    suggestions = [
      {
        id: "ai-suggestion-1",
        title: "GLP-1 Habit Stacking Coach",
        description: `Personal AI coach for GLP-1 users rebuilding their relationship with food. Tackles "${mainPainPoint}" with gentle, sustainable habit formation during and after treatment.`,
        approach: `**Phase 1 - Foundation** (Week 1-2)
• Onboarding that captures current medication phase
• Daily micro-habits tailored to energy levels
• "${mainPainPoint}" - focus on protein-first eating

**Phase 2 - Movement** (Week 3-4)
• Low-effort movement library (walks, stretches)
• Energy-based workout suggestions
• "${secondPainPoint}" - no gym required

**Phase 3 - Food Joy** (Week 5+)
• Rediscover foods you love in smaller portions
• Recipe suggestions for reduced appetite
• Community recipes from other GLP-1 users`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 18) + 15,
        forks: Math.floor(Math.random() * 6) + 4,
        comments: Math.floor(Math.random() * 10) + 6,
        edit_count: 1,
        market_fit: Math.min(95, (opportunityScore || 80) + Math.floor(Math.random() * 8)),
        status: "concept",
        tech_stack: ["React Native", "Supabase", "OpenAI", "HealthKit"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-2",
        title: "Metabolic Rehabilitation Tracker",
        description: `Track your metabolic journey beyond the scale. Addresses "${thirdPainPoint}" by focusing on NSVs (non-scale victories) and sustainable lifestyle metrics.`,
        approach: `**Core Tracking**
• Weight + measurements + photos
• Energy levels and mood correlation
• Sleep quality impact on hunger

**GLP-1 Specific**
• Medication dose tracking
• Side effect logging
• "${fourthPainPoint}" - tapering guidance

**Insights**
• AI-generated weekly summaries
• Predict plateau phases
• Celebrate NSVs automatically`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 12) + 8,
        forks: Math.floor(Math.random() * 4) + 2,
        comments: Math.floor(Math.random() * 6) + 3,
        edit_count: 1,
        market_fit: Math.min(89, (opportunityScore || 75) + Math.floor(Math.random() * 7)),
        status: "concept",
        tech_stack: ["Flutter", "Supabase", "RevenueCat", "Charts"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-3",
        title: "Post-GLP-1 Maintenance Community",
        description: `Community platform for users transitioning off or maintaining after GLP-1. Tackles "${fourthPainPoint}" with peer support and evidence-based maintenance strategies.`,
        approach: `**Community Features**
• Success stories from maintainers
• Anonymous Q&A with doctors
• Weekly challenges for habit building

**Education**
• Why regain happens (science-backed)
• Maintenance calorie calculators
• Exercise for weight maintenance

**Monetization**
• Free community access
• $15/month for dietitian chat
• $49 one-time for maintenance course`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 10) + 6,
        forks: Math.floor(Math.random() * 3) + 1,
        comments: Math.floor(Math.random() * 5) + 2,
        edit_count: 1,
        market_fit: Math.min(84, (opportunityScore || 70) + Math.floor(Math.random() * 6)),
        status: "concept",
        tech_stack: ["Next.js", "Supabase", "Stripe", "Stream"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  } else if (isSkin) {
    suggestions = [
      {
        id: "ai-suggestion-1",
        title: "Instant Ingredient Scanner",
        description: `Point your camera at any skincare product and get instant ingredient analysis. Solves "${mainPainPoint}" in seconds with AI-powered safety ratings and conflict detection.`,
        approach: `**Core Feature**
• Camera scan → instant breakdown
• Ingredient conflict warnings
• Personalized safety scores

**Personalization**
• Set your skin type + concerns
• Flag allergens and irritants
• "${secondPainPoint}" - remember your routine

**Database**
• 50,000+ ingredient profiles
• User-reported reactions
• Dermatologist-verified ratings`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 16) + 12,
        forks: Math.floor(Math.random() * 5) + 3,
        comments: Math.floor(Math.random() * 8) + 5,
        edit_count: 1,
        market_fit: Math.min(92, (opportunityScore || 78) + Math.floor(Math.random() * 8)),
        status: "concept",
        tech_stack: ["React Native", "Google Vision", "Supabase", "OpenAI"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-2",
        title: "Evidence-Based Product Curator",
        description: `Cut through influencer noise with science-backed product recommendations. Addresses "${thirdPainPoint}" by only suggesting products with clinical evidence.`,
        approach: `**Curation Engine**
• Only products with clinical studies
• Transparent ingredient sourcing
• Price-to-efficacy ratings

**Discovery**
• Quiz → personalized recs
• Compare products side-by-side
• "${fourthPainPoint}" - seasonal routine adjustments

**Trust**
• No paid placements
• Revenue from affiliate (disclosed)
• Community reviews from verified buyers`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 11) + 7,
        forks: Math.floor(Math.random() * 4) + 2,
        comments: Math.floor(Math.random() * 6) + 3,
        edit_count: 1,
        market_fit: Math.min(86, (opportunityScore || 72) + Math.floor(Math.random() * 7)),
        status: "concept",
        tech_stack: ["Next.js", "PostgreSQL", "Algolia", "Stripe"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-3",
        title: "Skincare Routine Builder",
        description: `AI that builds your complete routine step-by-step. Tackles "${secondPainPoint}" by ensuring ingredients work together and are applied in the right order.`,
        approach: `**Routine Engine**
• Input what you own → get order
• Flag conflicts automatically
• AM vs PM optimization

**Education**
• Why this order matters (video)
• Ingredient deep-dives
• When to add new products

**Sharing**
• Share routines with friends
• "Shop my routine" affiliate links
• Before/after progress tracking`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 9) + 5,
        forks: Math.floor(Math.random() * 3) + 1,
        comments: Math.floor(Math.random() * 5) + 2,
        edit_count: 1,
        market_fit: Math.min(80, (opportunityScore || 68) + Math.floor(Math.random() * 6)),
        status: "concept",
        tech_stack: ["React", "Supabase", "OpenAI", "TailwindCSS"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  } else if (isGut) {
    suggestions = [
      {
        id: "ai-suggestion-1",
        title: "Gut-Brain Pattern Tracker",
        description: `Finally understand your gut with AI-powered pattern recognition. Tackles "${mainPainPoint}" by correlating food, stress, sleep, and symptoms automatically.`,
        approach: `**Smart Logging**
• Photo-based meal logging (AI identifies foods)
• Symptom quick-log with severity
• "${secondPainPoint}" - auto-track from calendar/health apps

**Pattern AI**
• Find hidden triggers in 2 weeks
• Stress-gut correlation insights
• Sleep impact on digestion

**Recommendations**
• Personalized food suggestions
• Optimal eating windows
• When to see a specialist`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 14) + 10,
        forks: Math.floor(Math.random() * 5) + 3,
        comments: Math.floor(Math.random() * 7) + 4,
        edit_count: 1,
        market_fit: Math.min(88, (opportunityScore || 75) + Math.floor(Math.random() * 8)),
        status: "concept",
        tech_stack: ["React Native", "TensorFlow Lite", "Supabase", "HealthKit"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-2",
        title: "Probiotic Match Engine",
        description: `Stop the probiotic lottery. AI matches you with the right strains based on your symptoms and goals. Solves "${fourthPainPoint}" with evidence-based recommendations.`,
        approach: `**Matching Quiz**
• Symptoms + goals + history
• Current diet and lifestyle
• Previous probiotic experiences

**Recommendations**
• Top 3 products with reasoning
• Strain-by-strain breakdown
• "${thirdPainPoint}" - dosing protocols

**Tracking**
• Log your experience
• Compare with similar users
• Suggest adjustments over time`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 11) + 7,
        forks: Math.floor(Math.random() * 4) + 2,
        comments: Math.floor(Math.random() * 5) + 3,
        edit_count: 1,
        market_fit: Math.min(83, (opportunityScore || 70) + Math.floor(Math.random() * 7)),
        status: "concept",
        tech_stack: ["Next.js", "Supabase", "OpenAI", "Stripe"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-3",
        title: "Elimination Diet Coach",
        description: `Guided elimination protocols without the guesswork. Addresses "${thirdPainPoint}" with structured phases and AI-powered reintroduction tracking.`,
        approach: `**Protocol Builder**
• Choose from proven protocols
• Customize based on preferences
• Meal plans for each phase

**Tracking**
• Daily check-ins
• Symptom severity over time
• Reintroduction reactions

**Support**
• Community of others in protocol
• Dietitian Q&A access
• Recipe database per phase`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 9) + 5,
        forks: Math.floor(Math.random() * 3) + 1,
        comments: Math.floor(Math.random() * 4) + 2,
        edit_count: 1,
        market_fit: Math.min(79, (opportunityScore || 65) + Math.floor(Math.random() * 6)),
        status: "concept",
        tech_stack: ["React Native", "Supabase", "RevenueCat"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  } else if (isProductivity) {
    suggestions = [
      {
        id: "ai-suggestion-1",
        title: "Context Switch Guardian",
        description: `Protect your focus from interruptions intelligently. Solves "${mainPainPoint}" by understanding work context and filtering disruptions accordingly.`,
        approach: `**Smart Blocking**
• Learns your focus patterns
• Allows truly urgent messages through
• "${secondPainPoint}" - calendar-aware blocking

**Integration**
• Slack/Teams status sync
• Calendar deep integration
• Auto-respond with ETA

**Analytics**
• Focus time reports
• Interruption patterns
• Cost of context switching`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 13) + 9,
        forks: Math.floor(Math.random() * 5) + 3,
        comments: Math.floor(Math.random() * 7) + 4,
        edit_count: 1,
        market_fit: Math.min(90, (opportunityScore || 76) + Math.floor(Math.random() * 8)),
        status: "concept",
        tech_stack: ["Electron", "React", "Supabase", "Slack API"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-2",
        title: "Energy-First Scheduler",
        description: `Schedule work around your energy, not just time. Tackles "${fourthPainPoint}" by matching task difficulty to your biological rhythms.`,
        approach: `**Energy Tracking**
• Quick 3x daily energy check-ins
• Learn your chronotype patterns
• "${thirdPainPoint}" - predict low-energy windows

**Smart Scheduling**
• Suggest when to do deep work
• Auto-move meetings from peak hours
• Buffer time recommendations

**Team Features**
• Shared energy patterns
• Optimal meeting time finder
• Async-first culture tools`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 11) + 7,
        forks: Math.floor(Math.random() * 4) + 2,
        comments: Math.floor(Math.random() * 6) + 3,
        edit_count: 1,
        market_fit: Math.min(85, (opportunityScore || 72) + Math.floor(Math.random() * 7)),
        status: "concept",
        tech_stack: ["Next.js", "Google Calendar API", "Supabase", "OpenAI"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-3",
        title: "Creative Work Timer",
        description: `Timer built for non-linear work. Forget Pomodoro—this adapts to "${mainPainPoint}" with flexible sessions for creative and knowledge work.`,
        approach: `**Flexible Sessions**
• No fixed intervals
• "Flow lock" mode when you're in it
• Gentle nudges, not hard stops

**Work Types**
• Different modes for creative/admin/meetings
• Track time by project automatically
• "${secondPainPoint}" - no guilt for long sessions

**Insights**
• When you do your best work
• Session patterns over time
• Shareable focus summaries`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 9) + 5,
        forks: Math.floor(Math.random() * 3) + 1,
        comments: Math.floor(Math.random() * 5) + 2,
        edit_count: 1,
        market_fit: Math.min(81, (opportunityScore || 68) + Math.floor(Math.random() * 6)),
        status: "concept",
        tech_stack: ["React", "Electron", "Supabase", "TailwindCSS"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  } else if (isCareer) {
    suggestions = [
      {
        id: "ai-suggestion-1",
        title: "Skills Translation Engine",
        description: `AI that translates your experience into new career paths. Solves "${mainPainPoint}" by showing transferable skills you didn't know you had.`,
        approach: `**Profile Builder**
• Import LinkedIn + resume
• AI extracts hidden skills
• "${secondPainPoint}" - translate to new industries

**Career Paths**
• Show realistic pivot options
• Salary comparisons
• Skills gap analysis

**Action Plan**
• Learning roadmap
• Portfolio suggestions
• Network introductions`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 14) + 10,
        forks: Math.floor(Math.random() * 5) + 3,
        comments: Math.floor(Math.random() * 7) + 4,
        edit_count: 1,
        market_fit: Math.min(87, (opportunityScore || 74) + Math.floor(Math.random() * 8)),
        status: "concept",
        tech_stack: ["Next.js", "OpenAI", "LinkedIn API", "Supabase"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-2",
        title: "Career Pivot Community",
        description: `Connect with others who've made the leap. Tackles "${thirdPainPoint}" with real stories from successful career changers in your target field.`,
        approach: `**Story Database**
• Filter by origin → destination career
• Salary journey transparency
• Time to transition data

**Mentorship**
• Match with successful pivoters
• Paid 1:1 sessions
• "${fourthPainPoint}" - honest advice on salary cuts

**Resources**
• Industry-specific guides
• Resume before/after examples
• Interview prep by field`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 11) + 7,
        forks: Math.floor(Math.random() * 4) + 2,
        comments: Math.floor(Math.random() * 6) + 3,
        edit_count: 1,
        market_fit: Math.min(83, (opportunityScore || 70) + Math.floor(Math.random() * 7)),
        status: "concept",
        tech_stack: ["Next.js", "Supabase", "Stripe Connect", "Cal.com"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-3",
        title: "Portfolio Project Generator",
        description: `AI generates portfolio projects that prove your new skills. Addresses "${secondPainPoint}" by creating tangible proof for hiring managers.`,
        approach: `**Project Briefs**
• Industry-specific project ideas
• Clear learning outcomes
• Estimated time to complete

**Build Support**
• Step-by-step guides
• Code templates to start
• Peer review matching

**Showcase**
• Beautiful project pages
• Shareable links for applications
• Track views and interest`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 9) + 5,
        forks: Math.floor(Math.random() * 3) + 1,
        comments: Math.floor(Math.random() * 5) + 2,
        edit_count: 1,
        market_fit: Math.min(79, (opportunityScore || 66) + Math.floor(Math.random() * 6)),
        status: "concept",
        tech_stack: ["Next.js", "Supabase", "OpenAI", "Vercel"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  } else if (isConnections) {
    suggestions = [
      {
        id: "ai-suggestion-1",
        title: "Structured Serendipity App",
        description: `Create organic connections through curated IRL activities. Solves "${mainPainPoint}" by matching people for low-pressure group experiences, not dates.`,
        approach: `**Activity Matching**
• Interest-based group activities
• 4-8 person optimal group sizes
• "${secondPainPoint}" - no 1:1 pressure

**Event Types**
• Coffee walks, museum trips, game nights
• Skill-sharing sessions
• Neighborhood exploration

**Connection Flow**
• Activity first, connection second
• Post-event optional chat unlock
• Repeat attendance builds familiarity`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 16) + 12,
        forks: Math.floor(Math.random() * 6) + 4,
        comments: Math.floor(Math.random() * 9) + 5,
        edit_count: 1,
        market_fit: Math.min(93, (opportunityScore || 80) + Math.floor(Math.random() * 8)),
        status: "concept",
        tech_stack: ["React Native", "Supabase", "Mapbox", "Stripe"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-2",
        title: "Third Place Finder",
        description: `Discover and create community spaces in your area. Tackles "${thirdPainPoint}" by mapping and rating venues for connection potential.`,
        approach: `**Venue Discovery**
• Community-rated "vibe" scores
• Best times for solo visitors
• "${fourthPainPoint}" - connection-friendly venues

**Regular Events**
• Weekly recurring meetups
• Become a "regular" digitally
• Host your own gatherings

**Gamification**
• Check-in streaks
• Meet X new people challenges
• Neighborhood connection scores`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 12) + 8,
        forks: Math.floor(Math.random() * 4) + 2,
        comments: Math.floor(Math.random() * 6) + 3,
        edit_count: 1,
        market_fit: Math.min(86, (opportunityScore || 74) + Math.floor(Math.random() * 7)),
        status: "concept",
        tech_stack: ["React Native", "Supabase", "Google Places API", "Mapbox"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-3",
        title: "Friend-Making Accountability",
        description: `Weekly challenges to expand your social circle. Addresses "${fourthPainPoint}" with structured prompts and peer accountability for adult friend-making.`,
        approach: `**Weekly Challenges**
• Small, doable social actions
• Report back to accountability group
• Progressive difficulty

**Accountability Groups**
• 5-person pods
• Weekly check-ins
• "${secondPainPoint}" - celebrate small wins

**Content**
• Scripts for starting conversations
• Venue suggestions by challenge
• Success stories for motivation`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 10) + 6,
        forks: Math.floor(Math.random() * 3) + 1,
        comments: Math.floor(Math.random() * 5) + 2,
        edit_count: 1,
        market_fit: Math.min(81, (opportunityScore || 68) + Math.floor(Math.random() * 6)),
        status: "concept",
        tech_stack: ["React Native", "Supabase", "Push Notifications"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  } else if (isBusiness) {
    suggestions = [
      {
        id: "ai-suggestion-1",
        title: "AI-Powered Customer Churn Predictor",
        description: `Predict and prevent customer churn before it happens. Tackles "${mainPainPoint}" with ML-driven early warning signals and automated retention playbooks.`,
        approach: `**Phase 1 - Data Integration** (Week 1-2)
• Connect to your CRM, billing, and support tools
• Build unified customer health scoring
• "${mainPainPoint}" - identify at-risk accounts automatically

**Phase 2 - Prediction Engine** (Week 3-4)
• Train ML model on historical churn data
• Real-time risk scoring dashboard
• Automated alerts for CS team

**Phase 3 - Retention Playbooks** (Week 5+)
• Trigger personalized win-back campaigns
• A/B test retention offers
• ROI tracking per intervention`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 18) + 14,
        forks: Math.floor(Math.random() * 7) + 5,
        comments: Math.floor(Math.random() * 10) + 6,
        edit_count: 1,
        market_fit: Math.min(94, (opportunityScore || 82) + Math.floor(Math.random() * 8)),
        status: "concept",
        tech_stack: ["Python", "FastAPI", "PostgreSQL", "React", "Stripe API"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-2",
        title: "Dynamic Pricing Intelligence Tool",
        description: `Stop leaving money on the table with data-driven pricing. Addresses "${secondPainPoint}" by analyzing competitor prices, demand signals, and willingness-to-pay in real-time.`,
        approach: `**Core Features**
• Competitor price monitoring across 50+ sources
• Dynamic pricing recommendations by segment
• A/B testing framework for price experiments

**Business Intelligence**
• Price elasticity analysis
• Revenue impact simulations
• "${thirdPainPoint}" - optimal discount strategies

**Implementation**
• API for e-commerce platforms
• Shopify/WooCommerce plugins
• Custom enterprise integrations`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 14) + 10,
        forks: Math.floor(Math.random() * 5) + 3,
        comments: Math.floor(Math.random() * 8) + 4,
        edit_count: 1,
        market_fit: Math.min(90, (opportunityScore || 78) + Math.floor(Math.random() * 7)),
        status: "concept",
        tech_stack: ["Next.js", "Python", "Supabase", "Puppeteer", "OpenAI"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-3",
        title: "Founder-Market Fit Validator",
        description: `Validate your startup idea before building. Solves "${fourthPainPoint}" with AI-powered market research, competitor analysis, and founder-market fit scoring.`,
        approach: `**Validation Process**
• 20-minute structured interview about your idea
• AI analyzes market size, competition, timing
• Founder background vs. problem domain matching

**Deliverables**
• Comprehensive market report
• Top 5 risks with mitigation strategies
• "${secondPainPoint}" - concrete next steps

**Community**
• Connect with others in same space
• Find co-founders with complementary skills
• Expert office hours for feedback`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 12) + 8,
        forks: Math.floor(Math.random() * 4) + 2,
        comments: Math.floor(Math.random() * 6) + 3,
        edit_count: 1,
        market_fit: Math.min(86, (opportunityScore || 72) + Math.floor(Math.random() * 6)),
        status: "concept",
        tech_stack: ["Next.js", "OpenAI", "Supabase", "Stripe"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  } else {
    // Fallback generic solutions using the actual problem data
    suggestions = [
      {
        id: "ai-suggestion-1",
        title: `${trendContext} AI Assistant`,
        description: `Directly addresses "${mainPainPoint}" with intelligent automation tailored for ${categoryContext} users.`,
        approach: `**Phase 1 - Core Problem** (Week 1-2)
• Build MVP focusing on "${mainPainPoint}"
• Simple onboarding capturing user context
• Core AI engine for personalized recommendations

**Phase 2 - Expand Value** (Week 3-4)
• Address "${secondPainPoint}"
• Add analytics and progress tracking
• Implement sharing features

**Phase 3 - Retention** (Week 5+)
• Smart notifications and reminders
• Community features
• Premium tier with advanced AI`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 12) + 8,
        forks: Math.floor(Math.random() * 5) + 2,
        comments: Math.floor(Math.random() * 7) + 3,
        edit_count: 1,
        market_fit: Math.min(88, (opportunityScore || 72) + Math.floor(Math.random() * 8)),
        status: "concept",
        tech_stack: ["React", "Supabase", "OpenAI", "TailwindCSS"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-2",
        title: `${trendContext} Chrome Extension`,
        description: `Browser-based solution for "${secondPainPoint}". Works where users already spend time.`,
        approach: `**Why Browser Extension?**
• Zero friction adoption
• Enhance existing workflows
• "${thirdPainPoint}" - contextual help

**Core Features**
• Overlay UI for quick actions
• Keyboard shortcuts
• Cross-site functionality

**Monetization**
• Freemium model
• $9/month Pro tier`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 10) + 5,
        forks: Math.floor(Math.random() * 4) + 1,
        comments: Math.floor(Math.random() * 5) + 2,
        edit_count: 1,
        market_fit: Math.min(82, (opportunityScore || 68) + Math.floor(Math.random() * 6)),
        status: "concept",
        tech_stack: ["Chrome Extension", "React", "Supabase"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ai-suggestion-3",
        title: `${trendContext} Community Platform`,
        description: `Connect people solving "${mainPainPoint}" together. Network effects create defensibility.`,
        approach: `**Community Features**
• Discussion forums by topic
• Resource sharing
• Expert AMAs

**Marketplace**
• Templates and tools
• Paid consulting connections
• "${fourthPainPoint}" - peer learning

**Revenue**
• Free to browse
• $15/month creator tier
• Transaction fees`,
        ai_generated: true,
        upvotes: Math.floor(Math.random() * 8) + 4,
        forks: Math.floor(Math.random() * 3) + 1,
        comments: Math.floor(Math.random() * 4) + 2,
        edit_count: 1,
        market_fit: Math.min(76, (opportunityScore || 64) + Math.floor(Math.random() * 5)),
        status: "concept",
        tech_stack: ["Next.js", "Supabase", "Stripe Connect"],
        contributors: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  return suggestions as Solution[];
}

// Render approach text with proper formatting
function ApproachDisplay({ approach }: { approach: string | null }) {
  if (!approach) {
    return (
      <p className="text-muted-foreground italic">No approach defined yet. Click Edit to add one.</p>
    );
  }

  // Parse the approach into sections
  const lines = approach.split('\n').filter(line => line.trim());
  
  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        // Phase headers (bold text like **Phase 1 - Core Problem**)
        if (trimmedLine.startsWith('**') && trimmedLine.includes('**')) {
          const headerText = trimmedLine.replace(/\*\*/g, '').replace(/\(Week.*?\)/, (match) => match);
          const weekMatch = headerText.match(/\((Week.*?)\)/);
          const title = headerText.replace(/\(Week.*?\)/, '').trim();
          
          return (
            <div key={index} className="flex items-center gap-2 pt-2 first:pt-0">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Target className="h-3 w-3 text-primary" />
              </div>
              <h6 className="font-semibold text-sm text-foreground">{title}</h6>
              {weekMatch && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {weekMatch[1]}
                </span>
              )}
            </div>
          );
        }
        
        // Bullet points (lines starting with • or -)
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
          const bulletText = trimmedLine.replace(/^[•-]\s*/, '');
          
          // Check for quoted pain points
          const hasQuote = bulletText.includes('"');
          
          return (
            <div key={index} className="flex items-start gap-2 pl-2">
              <Zap className="h-3 w-3 text-primary mt-1 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {hasQuote ? (
                  bulletText.split('"').map((part, i) => 
                    i % 2 === 1 ? (
                      <span key={i} className="text-foreground font-medium">"{part}"</span>
                    ) : part
                  )
                ) : bulletText}
              </p>
            </div>
          );
        }
        
        // Regular text
        return (
          <p key={index} className="text-sm text-muted-foreground pl-2">
            {trimmedLine}
          </p>
        );
      })}
    </div>
  );
}

export const SolutionsLab = ({ problemId, problemTitle, problemTrend, problemPainPoints, problemCategory, opportunityScore }: SolutionsLabProps) => {
  const { user } = useAuth();
  const { solutions: dbSolutions, isLoading, createSolution, updateSolution, toggleUpvote, forkSolution } = useSolutions(problemId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: "", description: "", approach: "" });

  // Collect all contributor user IDs for verification check
  const allContributorIds = dbSolutions
    .flatMap((s) => s.contributors?.map((c) => c.user_id) || [])
    .filter((id): id is string => !!id);
  const { data: verifiedBuilders } = useVerifiedBuilders(allContributorIds);

  const handleUpvote = (solution: Solution) => {
    if (!user) return;
    toggleUpvote.mutate({ solutionId: solution.id, hasUpvoted: solution.has_upvoted || false });
  };

  const handleFork = (id: string) => {
    forkSolution.mutate(id);
  };

  const handleStartEdit = (solution: Solution) => {
    setEditingId(solution.id);
    setEditContent(solution.approach || "");
  };

  const handleSaveEdit = (id: string) => {
    updateSolution.mutate(
      { id, approach: editContent },
      {
        onSuccess: () => {
          setEditingId(null);
        },
      }
    );
  };

  const handleCreateIdea = () => {
    if (!newIdea.title || !newIdea.description) return;
    
    createSolution.mutate(
      {
        title: newIdea.title,
        description: newIdea.description,
        approach: newIdea.approach || undefined,
      },
      {
        onSuccess: () => {
          setShowNewIdea(false);
          setNewIdea({ title: "", description: "", approach: "" });
        },
      }
    );
  };

  // Combine real solutions with AI suggestions when empty
  const aiSuggestions = generateAISuggestions(problemTitle, problemTrend, problemPainPoints, problemCategory, opportunityScore);
  const solutions = dbSolutions.length > 0 ? dbSolutions : aiSuggestions;
  const showingAISuggestions = dbSolutions.length === 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg">Solutions Lab</h3>
          <p className="text-sm text-muted-foreground">
            Wiki-style collaborative ideas • {solutions.length} solutions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewIdea(true)}
          className="gap-2"
          disabled={!user}
        >
          <Plus className="h-3.5 w-3.5" />
          New Idea
        </Button>
      </div>


      {/* New Idea Form */}
      <AnimatePresence>
        {showNewIdea && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="p-4 rounded-lg border border-border/50 bg-background space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Create New Idea</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowNewIdea(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Idea title..."
                value={newIdea.title}
                onChange={(e) => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Describe your solution concept..."
                value={newIdea.description}
                onChange={(e) => setNewIdea(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px]"
              />
              <Textarea
                placeholder="Implementation approach (optional)..."
                value={newIdea.approach}
                onChange={(e) => setNewIdea(prev => ({ ...prev, approach: e.target.value }))}
                className="min-h-[60px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowNewIdea(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreateIdea} disabled={createSolution.isPending}>
                  {createSolution.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solutions List */}
      <div className="space-y-3">
        {showingAISuggestions && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-suggested ideas based on trend analysis. Add your own to get started!</span>
          </div>
        )}
        {solutions.map((solution, index) => (
          <motion.div
            key={solution.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className={`rounded-lg border ${expandedId === solution.id ? "border-foreground/20" : "border-border/50"} bg-background overflow-hidden`}>
              {/* Header Row */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === solution.id ? null : solution.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-medium
                    ${index === 0 ? "bg-foreground/10 text-foreground" : 
                      index === 1 ? "bg-foreground/5 text-foreground/70" :
                      index === 2 ? "bg-foreground/5 text-foreground/60" :
                      "bg-secondary text-muted-foreground"}
                  `}>
                    {index === 0 ? <Trophy className="h-4 w-4" /> : `#${index + 1}`}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm">{solution.title}</h4>
                      {solution.ai_generated && (
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">AI</span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusConfig[solution.status].color}`}>
                        {statusConfig[solution.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {solution.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className={`flex items-center gap-1 ${solution.has_upvoted ? "text-foreground" : ""}`}>
                        <ThumbsUp className={`h-3 w-3 ${solution.has_upvoted ? "fill-current" : ""}`} />
                        {solution.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {solution.forks}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {solution.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <History className="h-3 w-3" />
                        {solution.edit_count} edits
                      </span>
                    </div>
                  </div>

                  {/* Market Fit */}
                  <div className="text-right shrink-0">
                    <div className="text-lg font-semibold">{solution.market_fit}%</div>
                    <div className="text-[10px] text-muted-foreground">Market Fit</div>
                  </div>

                  {/* Expand */}
                  <div className="shrink-0">
                    {expandedId === solution.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === solution.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                      {/* Approach Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs text-muted-foreground uppercase tracking-wide">
                            Implementation Approach
                          </h5>
                          {editingId !== solution.id && user && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEdit(solution)}
                              className="h-7 text-xs gap-1"
                            >
                              <Edit3 className="h-3 w-3" />
                              Edit
                            </Button>
                          )}
                        </div>

                        {editingId === solution.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[100px] text-sm"
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(solution.id)}
                                disabled={updateSolution.isPending}
                              >
                                {updateSolution.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-secondary/30">
                            <ApproachDisplay approach={solution.approach} />
                          </div>
                        )}
                      </div>

                      {/* Tech Stack */}
                      {solution.tech_stack && solution.tech_stack.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs text-muted-foreground uppercase tracking-wide">
                            Suggested Tech Stack
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {solution.tech_stack.map((tech) => (
                              <span key={tech} className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground/80">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contributors */}
                      {solution.contributors && solution.contributors.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs text-muted-foreground uppercase tracking-wide">
                            Contributors ({solution.contributors.length})
                          </h5>
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {solution.contributors.slice(0, 5).map((contributor) => {
                                const isVerified = verifiedBuilders?.has(contributor.user_id || "");
                                return (
                                  <TooltipProvider key={contributor.id} delayDuration={200}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="relative">
                                          <Avatar className="h-7 w-7 border-2 border-background">
                                            <AvatarFallback className="text-[10px] bg-secondary">
                                              {contributor.profile?.name?.[0] || "?"}
                                            </AvatarFallback>
                                          </Avatar>
                                          {isVerified && (
                                            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-background flex items-center justify-center">
                                              <VerifiedBadge size="xs" showTooltip={false} />
                                            </div>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">
                                        <p>{contributor.profile?.name || "Anonymous"}{isVerified ? " ✓ Verified" : ""}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })}
                            </div>
                            {solution.contributors.length > 5 && (
                              <span className="text-xs text-muted-foreground">
                                +{solution.contributors.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Last Edited */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Last edited {formatDistanceToNow(new Date(solution.updated_at), { addSuffix: true })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Button
                          variant={solution.has_upvoted ? "default" : "outline"}
                          size="sm"
                          className="gap-1.5 text-xs h-8"
                          onClick={() => handleUpvote(solution)}
                          disabled={!user}
                        >
                          <ThumbsUp className={`h-3 w-3 ${solution.has_upvoted ? "fill-current" : ""}`} />
                          {solution.has_upvoted ? "Upvoted" : "Upvote"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs h-8"
                          onClick={() => handleFork(solution.id)}
                          disabled={!user || forkSolution.isPending}
                        >
                          <GitBranch className="h-3 w-3" />
                          Fork
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
