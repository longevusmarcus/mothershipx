# MothershipX - Project Overview

## What It Does

**MothershipX** is a market intelligence platform for indie builders. It helps users discover pre-validated market demand by aggregating real signals from TikTok, Reddit, YouTube, and Google Trends.

### Key Features

- **Market Intelligence Dashboard** - Browse trending problems across niches (Mental Health, Fitness, Productivity, etc.)
- **Quick Market Scans** - Search multiple niches for opportunities
- **Market Auditions** - Competitive challenges where builders ship solutions for prizes
- **Leaderboard & Rankings** - Track builder performance
- **Builder Verification** - Validate credentials via GitHub, Stripe, Supabase
- **Team Formation** - Collaborate with other builders on challenges
- **Subscription Model** - Premium tiers for advanced market intelligence

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Build** | Vite 5.4, TypeScript 5.8 |
| **UI** | React 18, Tailwind CSS, shadcn/ui, Radix UI, Framer Motion |
| **State** | React Query (server state), React Context (auth/subscription) |
| **Forms** | React Hook Form + Zod validation |
| **Routing** | React Router DOM 7 |
| **Backend** | Supabase (PostgreSQL + Edge Functions + Auth) |
| **Payments** | Stripe |
| **APIs** | TikTok, YouTube, Reddit, Google Trends |

---

## Architecture

```
React Frontend (Vite)
    |
React Query + Context (caching & state)
    |
Supabase Client
    |
Supabase Backend
├── PostgreSQL (profiles, problems, challenges, submissions)
├── 18 Edge Functions (search APIs, Stripe webhooks, verification)
└── Auth (email/password)
    |
External APIs (Stripe, TikTok, Reddit, YouTube)
```

### Data Flow Example: Market Problem Discovery

1. **User initiates search** - User selects a niche on Index page
2. **Authentication check** - AuthContext verifies user is logged in
3. **Subscription gate** - SubscriptionContext checks if user has premium access
4. **API call** - Edge function queries TikTok/Google Trends/Reddit
5. **Cache update** - React Query stores results with caching
6. **UI update** - MasonryGrid displays problem cards with animations
7. **User interaction** - Click problem to navigate to ProblemDetail page

---

## Project Structure

```
src/
├── pages/                  # Route components (11 pages)
│   ├── Index.tsx          # Home page with search & market scanning
│   ├── Problems.tsx       # Dashboard with problem grid
│   ├── ProblemDetail.tsx  # Detailed problem view
│   ├── Challenges.tsx     # Market auditions listing
│   ├── ChallengeResults.tsx # Challenge voting & results
│   ├── Builds.tsx         # User builds/solutions gallery
│   ├── SubmitSolution.tsx # Solution submission form
│   ├── LeaderboardPage.tsx # Competition rankings
│   ├── Profile.tsx        # User profile & settings
│   ├── PublicProfile.tsx  # Public builder profiles
│   └── Auth.tsx           # Authentication
│
├── components/            # Reusable UI components (90+ files)
│   ├── ui/                # shadcn/ui primitives (50+ base components)
│   ├── AppLayout.tsx      # Main layout wrapper with sidebar
│   ├── AppSidebar.tsx     # Navigation sidebar
│   ├── MasonryGrid.tsx    # Responsive grid layout for problems
│   ├── MarketProblemCard.tsx # Problem card component
│   ├── ChallengeCard.tsx  # Challenge display component
│   ├── AuthModal.tsx      # Login/signup modal
│   ├── PaywallModal.tsx   # Subscription paywall
│   └── ...
│
├── hooks/                 # Custom React hooks (25+ hooks)
│   ├── useProblems.ts     # Problem fetching with caching
│   ├── useChallenges.ts   # Challenge queries
│   ├── useAuth.ts         # Authentication context hook
│   ├── useSubscription.ts # Subscription status
│   ├── useLeaderboard.ts  # Leaderboard data
│   └── ...
│
├── contexts/              # React context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── SubscriptionContext.tsx # Subscription status & Stripe
│
├── data/                  # Mock data & constants
│   ├── marketIntelligence.ts # Market problem types & mock data
│   ├── challengesData.ts  # Challenge data structure
│   └── nichePainPoints.ts # Niche-specific pain points
│
├── integrations/supabase/ # Supabase integration
│   ├── types.ts           # Full database type definitions
│   └── client.ts          # Supabase client setup
│
├── lib/                   # Utility functions
│   ├── utils.ts           # Helper utilities
│   └── validations.ts     # Zod validation schemas
│
├── App.tsx                # Main app component with routing
├── main.tsx               # React entry point
└── index.css              # Global styles & Tailwind setup

supabase/
└── functions/             # 18 Edge Functions
    ├── search-tiktok/     # TikTok API integration
    ├── search-youtube/    # YouTube API integration
    ├── search-reddit/     # Reddit API integration
    ├── search-competitors/# Competitor analysis
    ├── verify-builder/    # GitHub/Stripe/Supabase check
    ├── check-subscription/# Stripe verification
    ├── create-subscription-checkout/
    ├── stripe-webhook/    # Webhook handling
    └── ...
```

---

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Index | Home page - search & quick scan |
| `/problems` | Problems | Dashboard with problem grid |
| `/problems/:id` | ProblemDetail | Detailed problem view |
| `/challenges` | Challenges | Market auditions listing |
| `/challenges/:id/results` | ChallengeResults | Voting & results |
| `/builds` | Builds | User solutions gallery |
| `/submit` | SubmitSolution | Submit a solution |
| `/leaderboard` | LeaderboardPage | Rankings |
| `/profile` | Profile | User profile & settings |
| `/profile/:userId` | PublicProfile | Public builder profile |
| `/auth` | Auth | Login/signup |

---

## Database Tables

Key tables in Supabase PostgreSQL:

- **profiles** - User profiles with bio, social links, streaks
- **problems** - Market opportunities with sentiment, scores, sources
- **challenges** - Daily market auditions with prizes & participation
- **submissions** - User solutions submissions
- **solutions** - Detailed solution information
- **challenge_joins** - User participation in challenges
- **builder_verifications** - GitHub/Stripe/Supabase credential verification
- **audit_logs** - Activity tracking

---

## Scripts

```bash
npm run dev          # Start Vite dev server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build with sourcemaps
npm run lint         # ESLint code checking
npm run preview      # Preview production build locally
```

---

## External Integrations

1. **Stripe** - Subscription billing & checkout
2. **TikTok API** - Trending content & creator data
3. **YouTube API** - Video trends & engagement
4. **Reddit API** - Community discussions & trends
5. **Google Trends API** - Search trend data
6. **GitHub API** - Builder verification & repository analysis
7. **Supabase** - Database, auth, and edge functions

---

## Styling

- **CSS Variables** - HSL-based color system
- **Dark Mode** - Class-based theme with next-themes
- **Animations** - Framer Motion + custom Tailwind animations
- **Fonts** - Inter (sans), Newsreader (display), Playfair Display (accent)
- **Responsive** - Mobile-first design with Tailwind breakpoints
