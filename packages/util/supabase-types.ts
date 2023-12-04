export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          cast_hash: string
          created_at: string
          user_id: string
        }
        Insert: {
          cast_hash: string
          created_at?: string
          user_id: string
        }
        Update: {
          cast_hash?: string
          created_at?: string
          user_id?: string
        }
      }
      cast_reports: {
        Row: {
          created_at: string
          id: number
          reported_by_user_id: string
          reported_cast_hash: string
        }
        Insert: {
          created_at?: string
          id?: number
          reported_by_user_id: string
          reported_cast_hash: string
        }
        Update: {
          created_at?: string
          id?: number
          reported_by_user_id?: string
          reported_cast_hash?: string
        }
      }
      casts: {
        Row: {
          author_fid: number
          avatar_url: string | null
          avatar_verified: boolean | null
          custom_metrics: Json | null
          deleted: boolean
          display_name: string | null
          hash: string
          is_recast: boolean
          last_reindexed_at: string
          mentions: Json | null
          og: Json
          published_at: string | null
          reactions: number | null
          recast_data: Json | null
          recasted_cast_hash: string | null
          recasters: Json | null
          recasts: number | null
          replies: number | null
          reply_parent_fid: number | null
          reply_parent_hash: string | null
          reply_parent_username: string | null
          reply_to_data: Json | null
          text: string | null
          thread_hash: string | null
          type: string | null
          username: string | null
          watches: number | null
          weighted_keywords: unknown | null
        }
        Insert: {
          author_fid: number
          avatar_url?: string | null
          avatar_verified?: boolean | null
          custom_metrics?: Json | null
          deleted?: boolean
          display_name?: string | null
          hash: string
          is_recast?: boolean
          last_reindexed_at?: string
          mentions?: Json | null
          og?: Json
          published_at?: string | null
          reactions?: number | null
          recast_data?: Json | null
          recasted_cast_hash?: string | null
          recasters?: Json | null
          recasts?: number | null
          replies?: number | null
          reply_parent_fid?: number | null
          reply_parent_hash?: string | null
          reply_parent_username?: string | null
          reply_to_data?: Json | null
          text?: string | null
          thread_hash?: string | null
          type?: string | null
          username?: string | null
          watches?: number | null
          weighted_keywords?: unknown | null
        }
        Update: {
          author_fid?: number
          avatar_url?: string | null
          avatar_verified?: boolean | null
          custom_metrics?: Json | null
          deleted?: boolean
          display_name?: string | null
          hash?: string
          is_recast?: boolean
          last_reindexed_at?: string
          mentions?: Json | null
          og?: Json
          published_at?: string | null
          reactions?: number | null
          recast_data?: Json | null
          recasted_cast_hash?: string | null
          recasters?: Json | null
          recasts?: number | null
          replies?: number | null
          reply_parent_fid?: number | null
          reply_parent_hash?: string | null
          reply_parent_username?: string | null
          reply_to_data?: Json | null
          text?: string | null
          thread_hash?: string | null
          type?: string | null
          username?: string | null
          watches?: number | null
          weighted_keywords?: unknown | null
        }
      }
      cove_favorites: {
        Row: {
          created_at: string
          feedname: string
          last_read_notification_date: string
          subscribed_to_notifications: boolean
          title: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          feedname: string
          last_read_notification_date?: string
          subscribed_to_notifications?: boolean
          title: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          feedname?: string
          last_read_notification_date?: string
          subscribed_to_notifications?: boolean
          title?: string
          user_id?: string
          username?: string
        }
      }
      coves: {
        Row: {
          config: Json | null
          created_at: string
          feedname: string
          fid: number
          username: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          feedname: string
          fid: number
          username: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          feedname?: string
          fid?: number
          username?: string
        }
      }
      email_subscriptions: {
        Row: {
          cove_slug: string | null
          created_at: string
          email: string
          updated_at: string
        }
        Insert: {
          cove_slug?: string | null
          created_at?: string
          email: string
          updated_at?: string
        }
        Update: {
          cove_slug?: string | null
          created_at?: string
          email?: string
          updated_at?: string
        }
      }
      entity_mentions: {
        Row: {
          begin_offset: number | null
          cast_hash: string
          end_offset: number | null
          entity_text: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          score: number | null
        }
        Insert: {
          begin_offset?: number | null
          cast_hash: string
          end_offset?: number | null
          entity_text: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          score?: number | null
        }
        Update: {
          begin_offset?: number | null
          cast_hash?: string
          end_offset?: number | null
          entity_text?: string
          entity_type?: Database["public"]["Enums"]["entity_type"]
          score?: number | null
        }
      }
      event: {
        Row: {
          created_at: string | null
          id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
        }
        Update: {
          created_at?: string | null
          id?: number
        }
      }
      farcaster_signers: {
        Row: {
          fid: number | null
          has_signed: boolean
          private_key: string
          public_key: string
          user_id: string
          username: string | null
          deadline: number | null
          signature: string | null
        }
        Insert: {
          fid?: number | null
          has_signed?: boolean
          private_key: string
          public_key: string
          user_id: string
          username?: string | null
          deadline: number | null
          signature: string | null
        }
        Update: {
          fid?: number | null
          has_signed?: boolean
          private_key?: string
          public_key?: string
          user_id?: string
          username?: string | null
          deadline: number | null
          signature: string | null
        }
      }
      fc_auth_tokens: {
        Row: {
          auth_token: string
          user_id: string
        }
        Insert: {
          auth_token: string
          user_id: string
        }
        Update: {
          auth_token?: string
          user_id?: string
        }
      }
      fc_verifications: {
        Row: {
          fid: number
          has_auth_token: boolean
          user_id: string
          username: string
          verification_cast_hash: string
        }
        Insert: {
          fid: number
          has_auth_token?: boolean
          user_id: string
          username: string
          verification_cast_hash: string
        }
        Update: {
          fid?: number
          has_auth_token?: boolean
          user_id?: string
          username?: string
          verification_cast_hash?: string
        }
      }
      following: {
        Row: {
          created_at: string
          follower_fid: number
          following_fid: number
        }
        Insert: {
          created_at?: string
          follower_fid: number
          following_fid: number
        }
        Update: {
          created_at?: string
          follower_fid?: number
          following_fid?: number
        }
      }
      likes: {
        Row: {
          cast_hash: string
          created_at: string
          fid: number
          type: string
        }
        Insert: {
          cast_hash: string
          created_at?: string
          fid: number
          type: string
        }
        Update: {
          cast_hash?: string
          created_at?: string
          fid?: number
          type?: string
        }
      }
      muted_users: {
        Row: {
          created_at: string
          id: number
          muted_by_user_id: string
          muted_user_fid: number
        }
        Insert: {
          created_at?: string
          id?: number
          muted_by_user_id: string
          muted_user_fid: number
        }
        Update: {
          created_at?: string
          id?: number
          muted_by_user_id?: string
          muted_user_fid?: number
        }
      }
      profile_reports: {
        Row: {
          created_at: string
          id: number
          reported_by_user_id: string | null
          reported_user_fid: number
        }
        Insert: {
          created_at?: string
          id?: number
          reported_by_user_id?: string | null
          reported_user_fid: number
        }
        Update: {
          created_at?: string
          id?: number
          reported_by_user_id?: string | null
          reported_user_fid?: number
        }
      }
      profiles: {
        Row: {
          address: string
          avatar_url: string | null
          avatar_verified: boolean | null
          bio: string | null
          custom_metrics: Json
          display_name: string | null
          fid: number
          followers: number | null
          following: number | null
          referrer: string | null
          registered_at: string | null
          updated_at: string | null
          username: string | null
          weighted_keywords: unknown | null
        }
        Insert: {
          address: string
          avatar_url?: string | null
          avatar_verified?: boolean | null
          bio?: string | null
          custom_metrics?: Json
          display_name?: string | null
          fid: number
          followers?: number | null
          following?: number | null
          referrer?: string | null
          registered_at?: string | null
          updated_at?: string | null
          username?: string | null
          weighted_keywords?: unknown | null
        }
        Update: {
          address?: string
          avatar_url?: string | null
          avatar_verified?: boolean | null
          bio?: string | null
          custom_metrics?: Json
          display_name?: string | null
          fid?: number
          followers?: number | null
          following?: number | null
          referrer?: string | null
          registered_at?: string | null
          updated_at?: string | null
          username?: string | null
          weighted_keywords?: unknown | null
        }
      }
      render_plugins: {
        Row: {
          created_at: string
          description: string
          fid: number
          matches: Json | null
          name: string
          slug: string
          username: string
        }
        Insert: {
          created_at?: string
          description: string
          fid: number
          matches?: Json | null
          name: string
          slug: string
          username: string
        }
        Update: {
          created_at?: string
          description?: string
          fid?: number
          matches?: Json | null
          name?: string
          slug?: string
          username?: string
        }
      }
      sentiment_entity_mentions: {
        Row: {
          begin_offset: number | null
          cast_hash: string
          end_offset: number | null
          entity_text: string
          entity_type: Database["public"]["Enums"]["sentiment_entity_type"]
          group_score: number | null
          score: number | null
          sentiment: Database["public"]["Enums"]["sentiment"]
          sentiment_score_mixed: number | null
          sentiment_score_negative: number | null
          sentiment_score_neutral: number | null
          sentiment_score_positive: number | null
        }
        Insert: {
          begin_offset?: number | null
          cast_hash: string
          end_offset?: number | null
          entity_text: string
          entity_type: Database["public"]["Enums"]["sentiment_entity_type"]
          group_score?: number | null
          score?: number | null
          sentiment: Database["public"]["Enums"]["sentiment"]
          sentiment_score_mixed?: number | null
          sentiment_score_negative?: number | null
          sentiment_score_neutral?: number | null
          sentiment_score_positive?: number | null
        }
        Update: {
          begin_offset?: number | null
          cast_hash?: string
          end_offset?: number | null
          entity_text?: string
          entity_type?: Database["public"]["Enums"]["sentiment_entity_type"]
          group_score?: number | null
          score?: number | null
          sentiment?: Database["public"]["Enums"]["sentiment"]
          sentiment_score_mixed?: number | null
          sentiment_score_negative?: number | null
          sentiment_score_neutral?: number | null
          sentiment_score_positive?: number | null
        }
      }
      task_completions: {
        Row: {
          created_at: string
          hash: string
          task_id: number
        }
        Insert: {
          created_at?: string
          hash: string
          task_id: number
        }
        Update: {
          created_at?: string
          hash?: string
          task_id?: number
        }
      }
      user_settings: {
        Row: {
          enabled_plugins: Json | null
          fid: number | null
          last_read_notification_date: string
          metadata: Json
          user_id: string
        }
        Insert: {
          enabled_plugins?: Json | null
          fid?: number | null
          last_read_notification_date?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          enabled_plugins?: Json | null
          fid?: number | null
          last_read_notification_date?: string
          metadata?: Json
          user_id?: string
        }
      }
      verifications: {
        Row: {
          fid: number
          timestamp: number
          verified_address: string
        }
        Insert: {
          fid: number
          timestamp: number
          verified_address: string
        }
        Update: {
          fid?: number
          timestamp?: number
          verified_address?: string
        }
      }
    }
    Views: {
      coves_with_count: {
        Row: {
          config: Json | null
          created_at: string | null
          custom_metrics: Json | null
          favorites: number | null
          feedname: string | null
          fid: number | null
          username: string | null
        }
      }
    }
    Functions: {
      casts_regex: {
        Args: {
          regex: string
        }
        Returns: {
          author_fid: number
          avatar_url: string | null
          avatar_verified: boolean | null
          custom_metrics: Json | null
          deleted: boolean
          display_name: string | null
          hash: string
          is_recast: boolean
          last_reindexed_at: string
          mentions: Json | null
          og: Json
          published_at: string | null
          reactions: number | null
          recast_data: Json | null
          recasted_cast_hash: string | null
          recasters: Json | null
          recasts: number | null
          replies: number | null
          reply_parent_fid: number | null
          reply_parent_hash: string | null
          reply_parent_username: string | null
          reply_to_data: Json | null
          text: string | null
          thread_hash: string | null
          type: string | null
          username: string | null
          watches: number | null
          weighted_keywords: unknown | null
        }[]
      }
      execute_arbitrary_sql: {
        Args: {
          "": string
        }
        Returns: Record<string, unknown>[]
      }
      execute_arbitrary_sql_casts: {
        Args: {
          sql_query: string
        }
        Returns: {
          author_fid: number
          avatar_url: string | null
          avatar_verified: boolean | null
          custom_metrics: Json | null
          deleted: boolean
          display_name: string | null
          hash: string
          is_recast: boolean
          last_reindexed_at: string
          mentions: Json | null
          og: Json
          published_at: string | null
          reactions: number | null
          recast_data: Json | null
          recasted_cast_hash: string | null
          recasters: Json | null
          recasts: number | null
          replies: number | null
          reply_parent_fid: number | null
          reply_parent_hash: string | null
          reply_parent_username: string | null
          reply_to_data: Json | null
          text: string | null
          thread_hash: string | null
          type: string | null
          username: string | null
          watches: number | null
          weighted_keywords: unknown | null
        }[]
      }
      execute_arbitrary_sql_coves: {
        Args: {
          sql_query: string
        }
        Returns: {
          config: Json | null
          created_at: string | null
          custom_metrics: Json | null
          favorites: number | null
          feedname: string | null
          fid: number | null
          username: string | null
        }[]
      }
      execute_arbitrary_sql_profiles: {
        Args: {
          sql_query: string
        }
        Returns: {
          address: string
          avatar_url: string | null
          avatar_verified: boolean | null
          bio: string | null
          custom_metrics: Json
          display_name: string | null
          fid: number
          followers: number | null
          following: number | null
          referrer: string | null
          registered_at: string | null
          updated_at: string | null
          username: string | null
          weighted_keywords: unknown | null
        }[]
      }
      execute_arbitrary_sql_texts: {
        Args: {
          sql_query: string
        }
        Returns: Database["public"]["CompositeTypes"]["discove_text_query"][]
      }
      feed_of_user: {
        Args: {
          username: string
        }
        Returns: {
          author_fid: number
          avatar_url: string | null
          avatar_verified: boolean | null
          custom_metrics: Json | null
          deleted: boolean
          display_name: string | null
          hash: string
          is_recast: boolean
          last_reindexed_at: string
          mentions: Json | null
          og: Json
          published_at: string | null
          reactions: number | null
          recast_data: Json | null
          recasted_cast_hash: string | null
          recasters: Json | null
          recasts: number | null
          replies: number | null
          reply_parent_fid: number | null
          reply_parent_hash: string | null
          reply_parent_username: string | null
          reply_to_data: Json | null
          text: string | null
          thread_hash: string | null
          type: string | null
          username: string | null
          watches: number | null
          weighted_keywords: unknown | null
        }[]
      }
      get_render_plugins: {
        Args: {
          plugin_slugs: string[]
        }
        Returns: {
          created_at: string
          description: string
          fid: number
          matches: Json | null
          name: string
          slug: string
          username: string
        }[]
      }
      recent_user_like_notifications: {
        Args: {
          fid: number
        }
        Returns: string[]
      }
      search_coves: {
        Args: {
          search_usernames: string
          search_feednames: string
        }
        Returns: {
          result_type: string
          feedname: string
          username: string
          config: Json
          levenshtein_distance: number
        }[]
      }
      search_profiles: {
        Args: {
          search_query: string
        }
        Returns: {
          result_type: string
          bio: string
          fid: number
          display_name: string
          username: string
          avatar_url: string
          levenshtein_distance: number
        }[]
      }
      user_all_follower_profiles: {
        Args: {
          fid_to_match: number
        }
        Returns: number[]
      }
      user_all_following_profiles: {
        Args: {
          fid_to_match: number
        }
        Returns: number[]
      }
    }
    Enums: {
      entity_type:
        | "COMMERCIAL_ITEM"
        | "DATE"
        | "EVENT"
        | "LOCATION"
        | "ORGANIZATION"
        | "OTHER"
        | "PERSON"
        | "TITLE"
        | "QUANTITY"
      sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED"
      sentiment_entity_type:
        | "PERSON"
        | "LOCATION"
        | "ORGANIZATION"
        | "FACILITY"
        | "BRAND"
        | "COMMERCIAL_ITEM"
        | "MOVIE"
        | "MUSIC"
        | "BOOK"
        | "SOFTWARE"
        | "GAME"
        | "PERSONAL_TITLE"
        | "EVENT"
        | "DATE"
        | "QUANTITY"
        | "ATTRIBUTE"
        | "OTHER"
    }
    CompositeTypes: {
      discove_text_query: {
        discove_item_type: string
        title: string
        text: string
        id: string
        url: string
        image: string
        imagew: string
        imageh: string
      }
      farcaster_identity: {
        username: string
        fid: number
        avatar_url: string
        verified_address: string
      }
    }
  }
}
