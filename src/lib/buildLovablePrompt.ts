/**
 * Generates a production-ready prompt for Lovable's Build with URL feature.
 * Uses the same expert prompt engineering format as the PromptsGenerator.
 */

interface ProblemData {
  title: string;
  subtitle?: string;
  category: string;
  niche: string;
  painPoints?: string[];
  marketSize?: string;
  opportunityScore: number;
  sentiment: string;
  hiddenInsight?: {
    surfaceAsk?: string;
    realProblem?: string;
    hiddenSignal?: string;
  };
}

interface Solution {
  title: string;
  description: string;
  approach?: string;
  techStack?: string[];
}

interface Competitor {
  name: string;
  description?: string;
  rating_label?: string;
}

interface BuildPromptOptions {
  problem: ProblemData;
  solutions?: Solution[];
  competitors?: Competitor[];
}

export function generateLovablePrompt({ problem, solutions, competitors }: BuildPromptOptions): string {
  // Build pain points section
  const painPointsSection = problem.painPoints?.length 
    ? problem.painPoints.map(p => `• ${p}`).join('\n')
    : '• Core problem-solving functionality\n• Intuitive user experience\n• Fast and reliable performance';

  // Build hidden insight section if available
  let insightSection = '';
  if (problem.hiddenInsight) {
    const { surfaceAsk, realProblem, hiddenSignal } = problem.hiddenInsight;
    if (realProblem || hiddenSignal) {
      insightSection = `

## Hidden Market Intelligence
${realProblem ? `**The Real Problem:** ${realProblem}` : ''}
${hiddenSignal ? `**Hidden Signal:** ${hiddenSignal}` : ''}`;
    }
  }

  // Build existing solutions section for inspiration
  let solutionsSection = '';
  if (solutions?.length) {
    const topSolutions = solutions.slice(0, 3);
    solutionsSection = `

## Solution Concepts to Consider
${topSolutions.map(s => `### ${s.title}
${s.description}
${s.approach ? `**Approach:** ${s.approach}` : ''}
${s.techStack?.length ? `**Tech:** ${s.techStack.join(', ')}` : ''}`).join('\n\n')}`;
  }

  // Build competitor analysis section
  let competitorSection = '';
  if (competitors?.length) {
    const topCompetitors = competitors.slice(0, 3);
    competitorSection = `

## Competitive Landscape
Build something that differentiates from:
${topCompetitors.map(c => `• **${c.name}**: ${c.description || 'Existing player'} (${c.rating_label || 'Unknown'})`).join('\n')}

Focus on gaps these competitors haven't addressed.`;
  }

  // Build the comprehensive prompt
  const prompt = `# Build a Production-Ready SaaS for: ${problem.title}

## Market Opportunity
**Category:** ${problem.category}
**Niche:** ${problem.niche}
**Market Size:** ${problem.marketSize || 'Growing market'}
**Opportunity Score:** ${problem.opportunityScore}/100
**Market Sentiment:** ${problem.sentiment}

## Problem Statement
${problem.subtitle || problem.title}

## Key Pain Points to Solve
${painPointsSection}${insightSection}${solutionsSection}${competitorSection}

---

## Technical Requirements

### Stack
- **Framework:** React + Vite + TypeScript
- **Styling:** Tailwind CSS with shadcn/ui components
- **Backend:** Supabase (auth, database, realtime)
- **State:** React Query for server state
- **Animations:** Framer Motion for micro-interactions

### Core Features (MVP)
1. **User Authentication**
   - Email/password signup and login
   - Password reset flow
   - Protected routes with auth guards

2. **Main Dashboard**
   - Clean, modern UI with the problem's core value proposition
   - Responsive design (mobile-first)
   - Dark mode support with system preference detection

3. **Core Functionality**
   - Primary feature that directly addresses the main pain point
   - Secondary features that enhance the user experience
   - Progress tracking and user feedback

4. **Data Management**
   - Supabase database with proper RLS policies
   - CRUD operations for user data
   - Real-time updates where applicable

### Design System
- Modern SaaS aesthetic with clean whitespace
- Subtle gradients and smooth transitions
- Rounded corners (lg/xl) for cards and buttons
- Professional color palette with single accent color
- Consistent spacing using Tailwind's spacing scale

### Quality Requirements
- Loading states for all async operations
- Error handling with user-friendly messages
- Form validation with helpful feedback
- Accessible (proper ARIA labels, keyboard nav)
- SEO-ready with proper meta tags

### File Structure
\`\`\`
src/
├── components/
│   ├── ui/           # shadcn components
│   ├── layout/       # Header, Footer, Layout
│   └── features/     # Feature-specific components
├── pages/            # Route pages
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── contexts/         # React contexts
└── integrations/     # Supabase client
\`\`\`

Build this as a complete, production-ready application that I can deploy immediately.`;

  return prompt;
}

export function openLovableBuilder(prompt: string): void {
  const encodedPrompt = encodeURIComponent(prompt);
  const lovableUrl = `https://lovable.dev/?autosubmit=true#prompt=${encodedPrompt}`;
  window.open(lovableUrl, '_blank');
}
