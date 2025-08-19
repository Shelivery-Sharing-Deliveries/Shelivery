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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analytics_event: {
        Row: {
          event_type: string
          id: string
          metadata: Json | null
          occurred_at: string | null
          user_id: string | null
        }
        Insert: {
          event_type: string
          id?: string
          metadata?: Json | null
          occurred_at?: string | null
          user_id?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_event_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      banner: {
        Row: {
          date: string
          id: number
          image: string | null
          link: string | null
          shop_id: number | null
        }
        Insert: {
          date?: string
          id?: number
          image?: string | null
          link?: string | null
          shop_id?: number | null
        }
        Update: {
          date?: string
          id?: number
          image?: string | null
          link?: string | null
          shop_id?: number | null
        }
        Relationships: []
      }
      basket: {
        Row: {
          amount: number
          chatroom_id: string | null
          created_at: string | null
          id: string
          is_delivered_by_user: boolean | null
          is_ready: boolean | null
          link: string | null
          note: string | null
          pool_id: string | null
          shop_id: string
          status: Database["public"]["Enums"]["basket_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          chatroom_id?: string | null
          created_at?: string | null
          id?: string
          is_delivered_by_user?: boolean | null
          is_ready?: boolean | null
          link?: string | null
          note?: string | null
          pool_id?: string | null
          shop_id?: string
          status?: Database["public"]["Enums"]["basket_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          chatroom_id?: string | null
          created_at?: string | null
          id?: string
          is_delivered_by_user?: boolean | null
          is_ready?: boolean | null
          link?: string | null
          note?: string | null
          pool_id?: string | null
          shop_id?: string
          status?: Database["public"]["Enums"]["basket_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "basket_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatroom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "basket_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "basket_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "basket_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_membership: {
        Row: {
          chatroom_id: string
          joined_at: string | null
          left_at: string | null
          user_id: string
        }
        Insert: {
          chatroom_id: string
          joined_at?: string | null
          left_at?: string | null
          user_id: string
        }
        Update: {
          chatroom_id?: string
          joined_at?: string | null
          left_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_membership_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatroom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_membership_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      chatroom: {
        Row: {
          admin_id: string | null
          created_at: string | null
          expire_at: string | null
          extended_once_before_ordered: boolean | null
          id: string
          last_amount: number | null
          pool_id: string
          state: Database["public"]["Enums"]["chatroom_state"] | null
          total_extension_days_delivered_state: number | null
          total_extension_days_ordered_state: number | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          expire_at?: string | null
          extended_once_before_ordered?: boolean | null
          id?: string
          last_amount?: number | null
          pool_id: string
          state?: Database["public"]["Enums"]["chatroom_state"] | null
          total_extension_days_delivered_state?: number | null
          total_extension_days_ordered_state?: number | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          expire_at?: string | null
          extended_once_before_ordered?: boolean | null
          id?: string
          last_amount?: number | null
          pool_id?: string
          state?: Database["public"]["Enums"]["chatroom_state"] | null
          total_extension_days_delivered_state?: number | null
          total_extension_days_ordered_state?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatroom_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatroom_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["id"]
          },
        ]
      }
      dormitory: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      event: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      invitation: {
        Row: {
          code: string
          counter: number | null
          created_at: string | null
          expires_at: string
          id: string
          invited_by: string | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          counter?: number | null
          created_at?: string | null
          expires_at: string
          id?: string
          invited_by?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          counter?: number | null
          created_at?: string | null
          expires_at?: string
          id?: string
          invited_by?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      log_basket_insertions: {
        Row: {
          chatroom_id: string | null
          context: string | null
          created_at: string | null
          id: number
          message: string | null
          pool_id: string | null
          shop_id: string | null
          user_id: string | null
        }
        Insert: {
          chatroom_id?: string | null
          context?: string | null
          created_at?: string | null
          id?: number
          message?: string | null
          pool_id?: string | null
          shop_id?: string | null
          user_id?: string | null
        }
        Update: {
          chatroom_id?: string | null
          context?: string | null
          created_at?: string | null
          id?: number
          message?: string | null
          pool_id?: string | null
          shop_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      message: {
        Row: {
          chatroom_id: string
          content: string
          id: number
          read_at: string | null
          sent_at: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          chatroom_id: string
          content: string
          id?: number
          read_at?: string | null
          sent_at?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          chatroom_id?: string
          content?: string
          id?: number
          read_at?: string | null
          sent_at?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatroom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          chatroom_id: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          chatroom_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          chatroom_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatroom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      order: {
        Row: {
          chatroom_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          chatroom_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          chatroom_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatroom"
            referencedColumns: ["id"]
          },
        ]
      }
      pool: {
        Row: {
          created_at: string | null
          current_amount: number | null
          dormitory_id: number
          id: string
          min_amount: number
          shop_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          dormitory_id: number
          id?: string
          min_amount: number
          shop_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          dormitory_id?: number
          id?: string
          min_amount?: number
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_dormitory_id_fkey"
            columns: ["dormitory_id"]
            isOneToOne: false
            referencedRelation: "dormitory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shop"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_membership: {
        Row: {
          basket_id: string
          joined_at: string | null
          pool_id: string
          user_id: string
        }
        Insert: {
          basket_id: string
          joined_at?: string | null
          pool_id: string
          user_id: string
        }
        Update: {
          basket_id?: string
          joined_at?: string | null
          pool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_membership_basket_id_fkey"
            columns: ["basket_id"]
            isOneToOne: true
            referencedRelation: "basket"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_membership_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_membership_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_policy: {
        Row: {
          content: string
          created_at: string | null
          id: number
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: never
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: never
          version?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      shop: {
        Row: {
          category: string | null
          created_at: string | null
          delivery_fee: number | null
          description: string | null
          estimated_delivery_time: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          min_amount: number | null
          minimum_order: number | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          description?: string | null
          estimated_delivery_time?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          min_amount?: number | null
          minimum_order?: number | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          description?: string | null
          estimated_delivery_time?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          min_amount?: number | null
          minimum_order?: number | null
          name?: string
        }
        Relationships: []
      }
      terms_of_service: {
        Row: {
          content: string
          created_at: string | null
          id: number
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: never
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: never
          version?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string | null
          dormitory_id: number | null
          email: string
          favorite_store: string | null
          first_name: string | null
          id: string
          image: string | null
          last_name: string | null
          profile: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dormitory_id?: number | null
          email: string
          favorite_store?: string | null
          first_name?: string | null
          id: string
          image?: string | null
          last_name?: string | null
          profile?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dormitory_id?: number | null
          email?: string
          favorite_store?: string | null
          first_name?: string | null
          id?: string
          image?: string | null
          last_name?: string | null
          profile?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_dormitory_id_fkey"
            columns: ["dormitory_id"]
            isOneToOne: false
            referencedRelation: "dormitory"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      check_user_exists: {
        Args: { p_email: string }
        Returns: boolean
      }
      confirm_user_delivery: {
        Args: { p_chatroom_id: string; p_user_id: string }
        Returns: Json
      }
      create_basket_and_join_pool: {
        Args:
          | { amount_param: number; link_param?: string; shop_id_param: number }
          | { basket_data: Json }
        Returns: string
      }
      create_invitation: {
        Args: { expires_in_days?: number }
        Returns: string
      }
      ensure_pool_for_shop_dorm: {
        Args: { p_dormitory_id: number; p_shop_id: string }
        Returns: string
      }
      ensure_user_pool: {
        Args:
          | { p_shop_id: string; p_user_id: string }
          | { shop_id_param: number; user_id_param: string }
        Returns: string
      }
      extend_chatroom_expire_at: {
        Args:
          | { p_chatroom_id: string }
          | { p_chatroom_id: string; p_days_to_extend: number }
        Returns: string
      }
      get_dashboard_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_pool_status: {
        Args: { pool_id_param: string }
        Returns: Json
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { data: Json; uri: string } | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      leave_chatroom: {
        Args: { chatroom_id_param: string }
        Returns: boolean
      }
      mark_basket_as_delivered: {
        Args: { p_basket_id: string }
        Returns: string
      }
      mark_chatroom_as_delivered_by_admin: {
        Args: { p_chatroom_id: string }
        Returns: string
      }
      resolve_chatroom: {
        Args: { chatroom_id_param: string }
        Returns: boolean
      }
      resolve_chatroom_baskets: {
        Args: { p_chatroom_id: string }
        Returns: undefined
      }
      seed_users_with_auth_no_delete: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      toggle_basket_ready: {
        Args: { basket_id_param: string }
        Returns: boolean
      }
      track_event: {
        Args: { event_type_param: string; metadata_param?: Json }
        Returns: undefined
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
      use_invitation_code: {
        Args: { invitation_code: string; user_id: string }
        Returns: boolean
      }
      validate_invitation: {
        Args: { invitation_code_param: string }
        Returns: boolean
      }
    }
    Enums: {
      basket_status: "in_pool" | "in_chat" | "ordered" | "resolved"
      chatroom_state:
        | "waiting"
        | "active"
        | "ordered"
        | "delivered"
        | "resolved"
        | "canceled"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
      basket_status: ["in_pool", "in_chat", "ordered", "resolved"],
      chatroom_state: [
        "waiting",
        "active",
        "ordered",
        "delivered",
        "resolved",
        "canceled",
      ],
    },
  },
} as const
