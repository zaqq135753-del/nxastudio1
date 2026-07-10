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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_entitlements: {
        Row: {
          app_slug: string
          expires_at: string | null
          granted_at: string
          status: string
          user_id: string
        }
        Insert: {
          app_slug: string
          expires_at?: string | null
          granted_at?: string
          status?: string
          user_id: string
        }
        Update: {
          app_slug?: string
          expires_at?: string | null
          granted_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      palate_profile: {
        Row: {
          budget_weekly: string | null
          cooking_level: Database["public"]["Enums"]["cooking_level"]
          dislikes: string[]
          goal: Database["public"]["Enums"]["goal_type"]
          household_size: number
          loves: string[]
          notes: string | null
          restrictions: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_weekly?: string | null
          cooking_level?: Database["public"]["Enums"]["cooking_level"]
          dislikes?: string[]
          goal?: Database["public"]["Enums"]["goal_type"]
          household_size?: number
          loves?: string[]
          notes?: string | null
          restrictions?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_weekly?: string | null
          cooking_level?: Database["public"]["Enums"]["cooking_level"]
          dislikes?: string[]
          goal?: Database["public"]["Enums"]["goal_type"]
          household_size?: number
          loves?: string[]
          notes?: string | null
          restrictions?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pantry_items: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          name: string
          quantity: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          name: string
          quantity?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          name?: string
          quantity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarded: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          onboarded?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      saved_recipes: {
        Row: {
          calories: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          emoji: string | null
          id: string
          image_url: string | null
          ingredients: Json
          is_favorite: boolean
          is_public: boolean
          name: string
          servings: string | null
          slug: string
          source: string | null
          steps: Json
          time: string | null
          user_id: string
        }
        Insert: {
          calories?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          is_favorite?: boolean
          is_public?: boolean
          name: string
          servings?: string | null
          slug?: string
          source?: string | null
          steps?: Json
          time?: string | null
          user_id: string
        }
        Update: {
          calories?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          is_favorite?: boolean
          is_public?: boolean
          name?: string
          servings?: string | null
          slug?: string
          source?: string | null
          steps?: Json
          time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_calendars: {
        Row: {
          created_at: string
          duration: string | null
          frequency: string | null
          goals: Json | null
          id: string
          name: string
          niche: string | null
          posts: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: string | null
          frequency?: string | null
          goals?: Json | null
          id?: string
          name: string
          niche?: string | null
          posts: Json
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: string | null
          frequency?: string | null
          goals?: Json | null
          id?: string
          name?: string
          niche?: string | null
          posts?: Json
          user_id?: string
        }
        Relationships: []
      }
      social_contents: {
        Row: {
          created_at: string
          id: string
          kind: string
          payload: Json
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          payload: Json
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          payload?: Json
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_hashtag_sets: {
        Row: {
          created_at: string
          hashtags: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hashtags: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          hashtags?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_counters: {
        Row: {
          ai_calls: number
          day: string
          user_id: string
        }
        Insert: {
          ai_calls?: number
          day?: string
          user_id: string
        }
        Update: {
          ai_calls?: number
          day?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "pro" | "admin"
      cooking_level: "iniciante" | "intermediario" | "avancado"
      goal_type:
        | "saudavel"
        | "emagrecimento"
        | "ganho_massa"
        | "economia"
        | "pratico"
        | "gourmet"
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
      app_role: ["user", "pro", "admin"],
      cooking_level: ["iniciante", "intermediario", "avancado"],
      goal_type: [
        "saudavel",
        "emagrecimento",
        "ganho_massa",
        "economia",
        "pratico",
        "gourmet",
      ],
    },
  },
} as const
