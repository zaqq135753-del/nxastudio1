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
      affiliate_referrals: {
        Row: {
          affiliate_user_id: string
          code: string
          created_at: string
          id: string
          referred_user_id: string
          status: string
        }
        Insert: {
          affiliate_user_id: string
          code: string
          created_at?: string
          id?: string
          referred_user_id: string
          status?: string
        }
        Update: {
          affiliate_user_id?: string
          code?: string
          created_at?: string
          id?: string
          referred_user_id?: string
          status?: string
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          clicks: number
          code: string
          created_at: string
          paid_conversions: number
          signups: number
          user_id: string
        }
        Insert: {
          clicks?: number
          code: string
          created_at?: string
          paid_conversions?: number
          signups?: number
          user_id: string
        }
        Update: {
          clicks?: number
          code?: string
          created_at?: string
          paid_conversions?: number
          signups?: number
          user_id?: string
        }
        Relationships: []
      }
      app_entitlements: {
        Row: {
          app_slug: string
          expires_at: string | null
          granted_at: string
          plan: string
          status: string
          trial_ends_at: string | null
          user_id: string
        }
        Insert: {
          app_slug: string
          expires_at?: string | null
          granted_at?: string
          plan?: string
          status?: string
          trial_ends_at?: string | null
          user_id: string
        }
        Update: {
          app_slug?: string
          expires_at?: string | null
          granted_at?: string
          plan?: string
          status?: string
          trial_ends_at?: string | null
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
      cosmos_horoscopes: {
        Row: {
          content: Json
          created_at: string
          for_date: string
          id: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          for_date: string
          id?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          for_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      cosmos_profile: {
        Row: {
          birth_date: string | null
          birth_place: string | null
          birth_time: string | null
          chart: Json | null
          created_at: string
          id: string
          moon_sign: string | null
          rising_sign: string | null
          sun_sign: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          birth_place?: string | null
          birth_time?: string | null
          chart?: Json | null
          created_at?: string
          id?: string
          moon_sign?: string | null
          rising_sign?: string | null
          sun_sign?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          birth_place?: string | null
          birth_time?: string | null
          chart?: Json | null
          created_at?: string
          id?: string
          moon_sign?: string | null
          rising_sign?: string | null
          sun_sign?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cosmos_tarot_readings: {
        Row: {
          cards: Json
          created_at: string
          id: string
          interpretation: string
          question: string | null
          spread: string
          user_id: string
        }
        Insert: {
          cards: Json
          created_at?: string
          id?: string
          interpretation: string
          question?: string | null
          spread?: string
          user_id: string
        }
        Update: {
          cards?: Json
          created_at?: string
          id?: string
          interpretation?: string
          question?: string | null
          spread?: string
          user_id?: string
        }
        Relationships: []
      }
      feed_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          app_slug: string
          body: string | null
          created_at: string
          id: string
          kind: string
          likes_count: number
          media_url: string | null
          meta: Json
          title: string
          user_id: string
        }
        Insert: {
          app_slug: string
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          likes_count?: number
          media_url?: string | null
          meta?: Json
          title: string
          user_id: string
        }
        Update: {
          app_slug?: string
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          likes_count?: number
          media_url?: string | null
          meta?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      fin_budgets: {
        Row: {
          category: string
          created_at: string
          id: string
          monthly_limit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          monthly_limit: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          monthly_limit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fin_goals: {
        Row: {
          created_at: string
          deadline: string | null
          id: string
          saved_amount: number
          target_amount: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          id?: string
          saved_amount?: number
          target_amount: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          id?: string
          saved_amount?: number
          target_amount?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fin_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          kind: string
          occurred_on: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          occurred_on?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          occurred_on?: string
          user_id?: string
        }
        Relationships: []
      }
      fit_profile: {
        Row: {
          created_at: string
          equipment: string[] | null
          fitness_level: string | null
          goal: string | null
          height: number | null
          id: string
          restrictions: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          equipment?: string[] | null
          fitness_level?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          restrictions?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          equipment?: string[] | null
          fitness_level?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          restrictions?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      fit_sessions: {
        Row: {
          calories: number | null
          completed_on: string
          created_at: string
          duration_min: number
          id: string
          notes: string | null
          user_id: string
          workout_id: string | null
        }
        Insert: {
          calories?: number | null
          completed_on?: string
          created_at?: string
          duration_min?: number
          id?: string
          notes?: string | null
          user_id: string
          workout_id?: string | null
        }
        Update: {
          calories?: number | null
          completed_on?: string
          created_at?: string
          duration_min?: number
          id?: string
          notes?: string | null
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fit_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "fit_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      fit_workouts: {
        Row: {
          created_at: string
          difficulty: string | null
          duration_min: number | null
          exercises: Json
          focus: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: string | null
          duration_min?: number | null
          exercises: Json
          focus?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string | null
          duration_min?: number | null
          exercises?: Json
          focus?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      lang_profile: {
        Row: {
          created_at: string
          daily_goal_min: number
          id: string
          last_active: string | null
          level: string
          streak: number
          target_lang: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_goal_min?: number
          id?: string
          last_active?: string | null
          level?: string
          streak?: number
          target_lang?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_goal_min?: number
          id?: string
          last_active?: string | null
          level?: string
          streak?: number
          target_lang?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lang_sessions: {
        Row: {
          accuracy: number | null
          created_at: string
          duration_min: number
          id: string
          kind: string
          payload: Json | null
          target_lang: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          duration_min?: number
          id?: string
          kind: string
          payload?: Json | null
          target_lang: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          duration_min?: number
          id?: string
          kind?: string
          payload?: Json | null
          target_lang?: string
          user_id?: string
        }
        Relationships: []
      }
      lang_vocabulary: {
        Row: {
          created_at: string
          ease: number
          example: string | null
          id: string
          next_review: string
          target_lang: string
          term: string
          translation: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ease?: number
          example?: string | null
          id?: string
          next_review?: string
          target_lang: string
          term: string
          translation: string
          user_id: string
        }
        Update: {
          created_at?: string
          ease?: number
          example?: string | null
          id?: string
          next_review?: string
          target_lang?: string
          term?: string
          translation?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          app_slug: string | null
          body: string | null
          created_at: string
          id: string
          kind: string
          metadata: Json
          read_at: string | null
          route: string | null
          title: string
          user_id: string
        }
        Insert: {
          app_slug?: string | null
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          read_at?: string | null
          route?: string | null
          title: string
          user_id: string
        }
        Update: {
          app_slug?: string | null
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          read_at?: string | null
          route?: string | null
          title?: string
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
      pet_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          pet_id: string
          role: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          pet_id: string
          role: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          pet_id?: string
          role?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_chat_messages_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_health_records: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          pet_id: string
          record_date: string
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id: string
          record_date?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id?: string
          record_date?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_health_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_meals: {
        Row: {
          amount: string | null
          created_at: string
          id: string
          meal_date: string
          meal_time: string | null
          notes: string | null
          pet_id: string
          type: string | null
          user_id: string
        }
        Insert: {
          amount?: string | null
          created_at?: string
          id?: string
          meal_date?: string
          meal_time?: string | null
          notes?: string | null
          pet_id: string
          type?: string | null
          user_id: string
        }
        Update: {
          amount?: string | null
          created_at?: string
          id?: string
          meal_date?: string
          meal_time?: string | null
          notes?: string | null
          pet_id?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_meals_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_plans: {
        Row: {
          created_at: string
          id: string
          kind: string
          payload: Json
          pet_id: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          payload: Json
          pet_id: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          payload?: Json
          pet_id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_plans_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_vaccinations: {
        Row: {
          applied_on: string
          created_at: string
          id: string
          name: string
          next_booster: string | null
          notes: string | null
          pet_id: string
          user_id: string
        }
        Insert: {
          applied_on: string
          created_at?: string
          id?: string
          name: string
          next_booster?: string | null
          notes?: string | null
          pet_id: string
          user_id: string
        }
        Update: {
          applied_on?: string
          created_at?: string
          id?: string
          name?: string
          next_booster?: string | null
          notes?: string | null
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_vaccinations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          birth_date: string | null
          breed: string | null
          created_at: string
          gender: string | null
          id: string
          microchip: string | null
          name: string
          neutered: boolean | null
          notes: string | null
          photo_url: string | null
          type: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          microchip?: string | null
          name: string
          neutered?: boolean | null
          notes?: string | null
          photo_url?: string | null
          type: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          microchip?: string | null
          name?: string
          neutered?: boolean | null
          notes?: string | null
          photo_url?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
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
      skin_analyses: {
        Row: {
          created_at: string
          diagnosis: Json
          id: string
          image_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          diagnosis: Json
          id?: string
          image_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          diagnosis?: Json
          id?: string
          image_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      skin_profile: {
        Row: {
          age: number | null
          allergies: string[] | null
          climate: string | null
          concerns: string[] | null
          created_at: string
          id: string
          skin_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          allergies?: string[] | null
          climate?: string | null
          concerns?: string[] | null
          created_at?: string
          id?: string
          skin_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          allergies?: string[] | null
          climate?: string | null
          concerns?: string[] | null
          created_at?: string
          id?: string
          skin_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skin_routines: {
        Row: {
          created_at: string
          id: string
          period: string
          steps: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period: string
          steps: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period?: string
          steps?: Json
          updated_at?: string
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
      style_items: {
        Row: {
          category: string
          color: string | null
          created_at: string
          id: string
          image_url: string | null
          last_worn_at: string | null
          name: string
          season: string | null
          tags: string[] | null
          times_worn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          last_worn_at?: string | null
          name: string
          season?: string | null
          tags?: string[] | null
          times_worn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          last_worn_at?: string | null
          name?: string
          season?: string | null
          tags?: string[] | null
          times_worn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      style_looks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          item_ids: string[]
          name: string
          occasion: string | null
          updated_at: string
          user_id: string
          worn_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          item_ids?: string[]
          name: string
          occasion?: string | null
          updated_at?: string
          user_id: string
          worn_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          item_ids?: string[]
          name?: string
          occasion?: string | null
          updated_at?: string
          user_id?: string
          worn_at?: string | null
        }
        Relationships: []
      }
      style_profile: {
        Row: {
          body_type: string | null
          budget: string | null
          colors_avoid: string[] | null
          colors_favorite: string[] | null
          created_at: string
          id: string
          notes: string | null
          occasions: string[] | null
          style_words: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body_type?: string | null
          budget?: string | null
          colors_avoid?: string[] | null
          colors_favorite?: string[] | null
          created_at?: string
          id?: string
          notes?: string | null
          occasions?: string[] | null
          style_words?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body_type?: string | null
          budget?: string | null
          colors_avoid?: string[] | null
          colors_favorite?: string[] | null
          created_at?: string
          id?: string
          notes?: string | null
          occasions?: string[] | null
          style_words?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      travel_itineraries: {
        Row: {
          budget_breakdown: Json | null
          budget_brl: number | null
          cover_url: string | null
          created_at: string
          days: Json
          destination: string
          end_date: string | null
          id: string
          interests: string[] | null
          start_date: string | null
          status: string
          style: string | null
          travelers: number
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_breakdown?: Json | null
          budget_brl?: number | null
          cover_url?: string | null
          created_at?: string
          days?: Json
          destination: string
          end_date?: string | null
          id?: string
          interests?: string[] | null
          start_date?: string | null
          status?: string
          style?: string | null
          travelers?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_breakdown?: Json | null
          budget_brl?: number | null
          cover_url?: string | null
          created_at?: string
          days?: Json
          destination?: string
          end_date?: string | null
          id?: string
          interests?: string[] | null
          start_date?: string | null
          status?: string
          style?: string | null
          travelers?: number
          updated_at?: string
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
      user_badges: {
        Row: {
          app_slug: string | null
          badge_slug: string
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          app_slug?: string | null
          badge_slug: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          app_slug?: string | null
          badge_slug?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memories: {
        Row: {
          app_slug: string
          content: string
          created_at: string
          embedding: string | null
          id: string
          kind: string
          metadata: Json
          user_id: string
        }
        Insert: {
          app_slug: string
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          kind?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          app_slug?: string
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          kind?: string
          metadata?: Json
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
      user_streaks: {
        Row: {
          app_slug: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          app_slug: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          app_slug?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          level: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          level?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          level?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_trial: { Args: { _slug: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_user_memories: {
        Args: {
          _app_slugs?: string[]
          _match_count?: number
          _query_embedding: string
          _user_id: string
        }
        Returns: {
          app_slug: string
          content: string
          created_at: string
          id: string
          kind: string
          metadata: Json
          similarity: number
        }[]
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
