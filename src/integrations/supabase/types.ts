export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      builder_verifications: {
        Row: {
          created_at: string
          github_username: string | null
          id: string
          stripe_public_key: string | null
          supabase_project_key: string | null
          updated_at: string
          user_id: string
          verification_result: Json | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          github_username?: string | null
          id?: string
          stripe_public_key?: string | null
          supabase_project_key?: string | null
          updated_at?: string
          user_id: string
          verification_result?: Json | null
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          github_username?: string | null
          id?: string
          stripe_public_key?: string | null
          supabase_project_key?: string | null
          updated_at?: string
          user_id?: string
          verification_result?: Json | null
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      challenge_joins: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          join_type: Database["public"]["Enums"]["join_type"]
          payment_id: string | null
          payment_status: string | null
          team_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          join_type?: Database["public"]["Enums"]["join_type"]
          payment_id?: string | null
          payment_status?: string | null
          team_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          join_type?: Database["public"]["Enums"]["join_type"]
          payment_id?: string | null
          payment_status?: string | null
          team_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_joins_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_joins_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "challenge_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_payments: {
        Row: {
          amount: number
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_payments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          audience_size: string | null
          created_at: string
          description: string
          difficulty: Database["public"]["Enums"]["challenge_difficulty"]
          ends_at: string
          entry_fee: number
          example: string | null
          id: string
          max_participants: number
          participants: number
          prize_pool: number
          problem_id: string | null
          solo_participants: number
          sources: Json | null
          starts_at: string
          status: Database["public"]["Enums"]["challenge_status"]
          tags: string[] | null
          team_count: number
          title: string
          trend: string
          trend_growth: string | null
          updated_at: string
          why_relevant: string | null
          winner_prize: number
        }
        Insert: {
          audience_size?: string | null
          created_at?: string
          description: string
          difficulty?: Database["public"]["Enums"]["challenge_difficulty"]
          ends_at: string
          entry_fee?: number
          example?: string | null
          id?: string
          max_participants?: number
          participants?: number
          prize_pool?: number
          problem_id?: string | null
          solo_participants?: number
          sources?: Json | null
          starts_at?: string
          status?: Database["public"]["Enums"]["challenge_status"]
          tags?: string[] | null
          team_count?: number
          title: string
          trend: string
          trend_growth?: string | null
          updated_at?: string
          why_relevant?: string | null
          winner_prize?: number
        }
        Update: {
          audience_size?: string | null
          created_at?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["challenge_difficulty"]
          ends_at?: string
          entry_fee?: number
          example?: string | null
          id?: string
          max_participants?: number
          participants?: number
          prize_pool?: number
          problem_id?: string | null
          solo_participants?: number
          sources?: Json | null
          starts_at?: string
          status?: Database["public"]["Enums"]["challenge_status"]
          tags?: string[] | null
          team_count?: number
          title?: string
          trend?: string
          trend_growth?: string | null
          updated_at?: string
          why_relevant?: string | null
          winner_prize?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenges_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_scans: {
        Row: {
          channel_id: string
          channel_name: string
          created_at: string
          id: string
          last_scanned_at: string
          problems_found: number
          updated_at: string
          videos_analyzed: number
        }
        Insert: {
          channel_id: string
          channel_name: string
          created_at?: string
          id?: string
          last_scanned_at?: string
          problems_found?: number
          updated_at?: string
          videos_analyzed?: number
        }
        Update: {
          channel_id?: string
          channel_name?: string
          created_at?: string
          id?: string
          last_scanned_at?: string
          problems_found?: number
          updated_at?: string
          videos_analyzed?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      paywall_events: {
        Row: {
          created_at: string
          event_type: string
          feature: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          feature: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          feature?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      problem_builders: {
        Row: {
          id: string
          joined_at: string
          last_active_at: string
          problem_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_active_at?: string
          problem_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_active_at?: string
          problem_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_builders_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_competitors: {
        Row: {
          created_at: string
          description: string | null
          first_seen_at: string
          id: string
          last_seen_at: string
          name: string
          position: number | null
          previous_rating: number | null
          problem_id: string
          rating: number
          rating_change: number | null
          rating_label: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          name: string
          position?: number | null
          previous_rating?: number | null
          problem_id: string
          rating?: number
          rating_change?: number | null
          rating_label?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          name?: string
          position?: number | null
          previous_rating?: number | null
          problem_id?: string
          rating?: number
          rating_change?: number | null
          rating_label?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_competitors_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      problems: {
        Row: {
          active_builders_last_24h: number | null
          category: string
          competition_gap: number | null
          created_at: string
          demand_velocity: number | null
          discovered_at: string
          hidden_insight: Json | null
          id: string
          is_viral: boolean | null
          market_size: string | null
          niche: string
          opportunity_score: number
          pain_points: string[] | null
          peak_prediction: string | null
          saves: number | null
          sentiment: Database["public"]["Enums"]["trend_sentiment"]
          shares: number | null
          slots_filled: number
          slots_total: number
          sources: Json | null
          subtitle: string | null
          title: string
          trending_rank: number | null
          updated_at: string
          views: number | null
        }
        Insert: {
          active_builders_last_24h?: number | null
          category: string
          competition_gap?: number | null
          created_at?: string
          demand_velocity?: number | null
          discovered_at?: string
          hidden_insight?: Json | null
          id?: string
          is_viral?: boolean | null
          market_size?: string | null
          niche: string
          opportunity_score?: number
          pain_points?: string[] | null
          peak_prediction?: string | null
          saves?: number | null
          sentiment?: Database["public"]["Enums"]["trend_sentiment"]
          shares?: number | null
          slots_filled?: number
          slots_total?: number
          sources?: Json | null
          subtitle?: string | null
          title: string
          trending_rank?: number | null
          updated_at?: string
          views?: number | null
        }
        Update: {
          active_builders_last_24h?: number | null
          category?: string
          competition_gap?: number | null
          created_at?: string
          demand_velocity?: number | null
          discovered_at?: string
          hidden_insight?: Json | null
          id?: string
          is_viral?: boolean | null
          market_size?: string | null
          niche?: string
          opportunity_score?: number
          pain_points?: string[] | null
          peak_prediction?: string | null
          saves?: number | null
          sentiment?: Database["public"]["Enums"]["trend_sentiment"]
          shares?: number | null
          slots_filled?: number
          slots_total?: number
          sources?: Json | null
          subtitle?: string | null
          title?: string
          trending_rank?: number | null
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_streak: number
          email: string | null
          github: string | null
          id: string
          last_activity_date: string | null
          location: string | null
          longest_streak: number
          name: string | null
          twitter: string | null
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_streak?: number
          email?: string | null
          github?: string | null
          id: string
          last_activity_date?: string | null
          location?: string | null
          longest_streak?: number
          name?: string | null
          twitter?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_streak?: number
          email?: string | null
          github?: string | null
          id?: string
          last_activity_date?: string | null
          location?: string | null
          longest_streak?: number
          name?: string | null
          twitter?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      rankings: {
        Row: {
          bonus_score: number | null
          challenge_id: string
          created_at: string
          github_score: number | null
          id: string
          is_winner: boolean | null
          previous_rank: number | null
          prize_won: number | null
          problem_coverage_score: number | null
          rank: number
          revenue_score: number | null
          sentiment_fit_score: number | null
          submission_id: string
          total_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_score?: number | null
          challenge_id: string
          created_at?: string
          github_score?: number | null
          id?: string
          is_winner?: boolean | null
          previous_rank?: number | null
          prize_won?: number | null
          problem_coverage_score?: number | null
          rank: number
          revenue_score?: number | null
          sentiment_fit_score?: number | null
          submission_id: string
          total_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_score?: number | null
          challenge_id?: string
          created_at?: string
          github_score?: number | null
          id?: string
          is_winner?: boolean | null
          previous_rank?: number | null
          prize_won?: number | null
          problem_coverage_score?: number | null
          rank?: number
          revenue_score?: number | null
          sentiment_fit_score?: number | null
          submission_id?: string
          total_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rankings_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          request_count: number
          window_key: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          window_key: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          window_key?: string
          window_start?: string
        }
        Relationships: []
      }
      search_cache: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          niche: string
          queries_used: string[]
          results: Json
          videos_analyzed: number
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          niche: string
          queries_used?: string[]
          results: Json
          videos_analyzed?: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          niche?: string
          queries_used?: string[]
          results?: Json
          videos_analyzed?: number
        }
        Relationships: []
      }
      search_interests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          query: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          query: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          query?: string
          user_id?: string | null
        }
        Relationships: []
      }
      solution_contributors: {
        Row: {
          contributed_at: string
          id: string
          solution_id: string
          user_id: string
        }
        Insert: {
          contributed_at?: string
          id?: string
          solution_id: string
          user_id: string
        }
        Update: {
          contributed_at?: string
          id?: string
          solution_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_contributors_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_upvotes: {
        Row: {
          created_at: string
          id: string
          solution_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          solution_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          solution_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_upvotes_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          ai_generated: boolean
          approach: string | null
          comments: number
          created_at: string
          created_by: string
          description: string
          edit_count: number
          forks: number
          id: string
          landing_page: Json | null
          last_editor_id: string | null
          market_fit: number
          problem_id: string | null
          status: string
          tech_stack: string[] | null
          title: string
          updated_at: string
          upvotes: number
        }
        Insert: {
          ai_generated?: boolean
          approach?: string | null
          comments?: number
          created_at?: string
          created_by: string
          description: string
          edit_count?: number
          forks?: number
          id?: string
          landing_page?: Json | null
          last_editor_id?: string | null
          market_fit?: number
          problem_id?: string | null
          status?: string
          tech_stack?: string[] | null
          title: string
          updated_at?: string
          upvotes?: number
        }
        Update: {
          ai_generated?: boolean
          approach?: string | null
          comments?: number
          created_at?: string
          created_by?: string
          description?: string
          edit_count?: number
          forks?: number
          id?: string
          landing_page?: Json | null
          last_editor_id?: string | null
          market_fit?: number
          problem_id?: string | null
          status?: string
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "solutions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_members: {
        Row: {
          id: string
          is_online: boolean
          joined_at: string
          role: string
          squad_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean
          joined_at?: string
          role?: string
          squad_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean
          joined_at?: string
          role?: string
          squad_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_ai: boolean
          is_pinned: boolean
          squad_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_ai?: boolean
          is_pinned?: boolean
          squad_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_ai?: boolean
          is_pinned?: boolean
          squad_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "squad_messages_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squads: {
        Row: {
          created_at: string
          id: string
          is_hiring: boolean
          lead_id: string
          max_members: number
          momentum: number
          name: string
          problem_id: string | null
          rank: number | null
          streak: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_hiring?: boolean
          lead_id: string
          max_members?: number
          momentum?: number
          name: string
          problem_id?: string | null
          rank?: number | null
          streak?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_hiring?: boolean
          lead_id?: string
          max_members?: number
          momentum?: number
          name?: string
          problem_id?: string | null
          rank?: number | null
          streak?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "squads_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          adoption_velocity_score: number | null
          ai_feedback: string | null
          challenge_id: string | null
          created_at: string
          demo_url: string | null
          github_activity_score: number | null
          github_repo: string | null
          has_revenue: boolean | null
          id: string
          join_type: Database["public"]["Enums"]["join_type"]
          misalignment_warnings: string[] | null
          payment_info: string | null
          problem_coverage_percent: number | null
          problem_id: string | null
          product_name: string
          product_url: string
          revenue_amount: number | null
          sentiment_fit_score: number | null
          status: Database["public"]["Enums"]["submission_status"]
          stripe_public_key: string | null
          supabase_project_url: string | null
          team_name: string | null
          total_score: number | null
          updated_at: string
          user_id: string
          validated_at: string | null
        }
        Insert: {
          adoption_velocity_score?: number | null
          ai_feedback?: string | null
          challenge_id?: string | null
          created_at?: string
          demo_url?: string | null
          github_activity_score?: number | null
          github_repo?: string | null
          has_revenue?: boolean | null
          id?: string
          join_type?: Database["public"]["Enums"]["join_type"]
          misalignment_warnings?: string[] | null
          payment_info?: string | null
          problem_coverage_percent?: number | null
          problem_id?: string | null
          product_name: string
          product_url: string
          revenue_amount?: number | null
          sentiment_fit_score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          stripe_public_key?: string | null
          supabase_project_url?: string | null
          team_name?: string | null
          total_score?: number | null
          updated_at?: string
          user_id: string
          validated_at?: string | null
        }
        Update: {
          adoption_velocity_score?: number | null
          ai_feedback?: string | null
          challenge_id?: string | null
          created_at?: string
          demo_url?: string | null
          github_activity_score?: number | null
          github_repo?: string | null
          has_revenue?: boolean | null
          id?: string
          join_type?: Database["public"]["Enums"]["join_type"]
          misalignment_warnings?: string[] | null
          payment_info?: string | null
          problem_coverage_percent?: number | null
          problem_id?: string | null
          product_name?: string
          product_url?: string
          revenue_amount?: number | null
          sentiment_fit_score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          stripe_public_key?: string | null
          supabase_project_url?: string | null
          team_name?: string | null
          total_score?: number | null
          updated_at?: string
          user_id?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          price_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activities_count: number
          activity_date: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activities_count?: number
          activity_date?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activities_count?: number
          activity_date?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_problem_pins: {
        Row: {
          id: string
          pinned_at: string
          problem_id: string
          user_id: string
        }
        Insert: {
          id?: string
          pinned_at?: string
          problem_id: string
          user_id: string
        }
        Update: {
          id?: string
          pinned_at?: string
          problem_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_problem_pins_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          allow_collab_requests: boolean
          build_verification: boolean
          created_at: string
          email_digest: boolean
          id: string
          in_app_notifications: boolean
          leaderboard_updates: boolean
          marketing_emails: boolean
          new_problems: boolean
          profile_visibility: string
          push_notifications: boolean
          show_builds: boolean
          show_email: boolean
          show_on_leaderboard: boolean
          show_stats: boolean
          updated_at: string
          user_id: string
          weekly_report: boolean
        }
        Insert: {
          allow_collab_requests?: boolean
          build_verification?: boolean
          created_at?: string
          email_digest?: boolean
          id?: string
          in_app_notifications?: boolean
          leaderboard_updates?: boolean
          marketing_emails?: boolean
          new_problems?: boolean
          profile_visibility?: string
          push_notifications?: boolean
          show_builds?: boolean
          show_email?: boolean
          show_on_leaderboard?: boolean
          show_stats?: boolean
          updated_at?: string
          user_id: string
          weekly_report?: boolean
        }
        Update: {
          allow_collab_requests?: boolean
          build_verification?: boolean
          created_at?: string
          email_digest?: boolean
          id?: string
          in_app_notifications?: boolean
          leaderboard_updates?: boolean
          marketing_emails?: boolean
          new_problems?: boolean
          profile_visibility?: string
          push_notifications?: boolean
          show_builds?: boolean
          show_email?: boolean
          show_on_leaderboard?: boolean
          show_stats?: boolean
          updated_at?: string
          user_id?: string
          weekly_report?: boolean
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          feature: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          feature: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          feature?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          github: string | null
          id: string | null
          location: string | null
          name: string | null
          twitter: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_user_streak: { Args: { p_user_id: string }; Returns: number }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      cleanup_rate_limits: { Args: never; Returns: number }
      has_premium_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_audit_log: {
        Args: {
          p_action: string
          p_entity_id?: string
          p_entity_type: string
          p_ip_address?: string
          p_metadata?: Json
          p_new_value?: Json
          p_old_value?: Json
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      insert_paywall_event: {
        Args: {
          p_event_type: string
          p_feature: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: undefined
      }
      is_profile_public: { Args: { _profile_id: string }; Returns: boolean }
      record_user_activity: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "subscriber" | "user"
      challenge_difficulty: "beginner" | "intermediate" | "advanced"
      challenge_status: "active" | "voting" | "completed"
      join_type: "solo" | "team"
      submission_status: "pending" | "validated" | "ranked" | "winner"
      trend_sentiment: "exploding" | "rising" | "stable" | "declining"
      trend_source:
        | "tiktok"
        | "google_trends"
        | "freelancer"
        | "reddit"
        | "hackernews"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "subscriber", "user"],
      challenge_difficulty: ["beginner", "intermediate", "advanced"],
      challenge_status: ["active", "voting", "completed"],
      join_type: ["solo", "team"],
      submission_status: ["pending", "validated", "ranked", "winner"],
      trend_sentiment: ["exploding", "rising", "stable", "declining"],
      trend_source: [
        "tiktok",
        "google_trends",
        "freelancer",
        "reddit",
        "hackernews",
      ],
    },
  },
} as const
