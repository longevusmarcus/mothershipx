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
      challenge_joins: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          join_type: Database["public"]["Enums"]["join_type"]
          team_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          join_type?: Database["public"]["Enums"]["join_type"]
          team_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          join_type?: Database["public"]["Enums"]["join_type"]
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
          email: string | null
          github: string | null
          id: string
          location: string | null
          name: string | null
          twitter: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          github?: string | null
          id: string
          location?: string | null
          name?: string | null
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          github?: string | null
          id?: string
          location?: string | null
          name?: string | null
          twitter?: string | null
          updated_at?: string
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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
