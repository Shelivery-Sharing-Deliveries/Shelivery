import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database Types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      dormitory: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      shop: {
        Row: {
          id: number
          name: string
          min_amount: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          min_amount: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          min_amount?: number
          created_at?: string
        }
      }
      user: {
        Row: {
          id: string; // UUID
          email: string;
          dormitory_id: number | null;
          profile: JSON | null;
          created_at: string | null; // ISO timestamp
          updated_at: string | null; // ISO timestamp
          first_name: string | null;
          last_name: string | null;
          favorite_store: string | null;
          image: string | null;
        };
        Insert: {
          id: string;
          email: string;
          dormitory_id?: number | null;
          profile?: JSON | null;
          created_at?: string | null;
          updated_at?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          favorite_store?: string | null;
          image?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          dormitory_id?: number | null;
          profile?: JSON | null;
          created_at?: string | null;
          updated_at?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          favorite_store?: string | null;
          image?: string | null;
        };
      }
      pool: {
        Row: {
          id: string
          shop_id: number
          dormitory_id: number
          current_amount: number
          min_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: number
          dormitory_id: number
          current_amount?: number
          min_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          shop_id?: number
          dormitory_id?: number
          current_amount?: number
          min_amount?: number
          created_at?: string
        }
      }
      basket: {
        Row: {
          id: string
          user_id: string
          shop_id: number
          link: string | null
          amount: number
          status: 'in_pool' | 'in_chat' | 'resolved'
          is_ready: boolean
          pool_id: string | null
          chatroom_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shop_id: number
          link?: string | null
          amount: number
          status?: 'in_pool' | 'in_chat' | 'resolved'
          is_ready?: boolean
          pool_id?: string | null
          chatroom_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shop_id?: number
          link?: string | null
          amount?: number
          status?: 'in_pool' | 'in_chat' | 'resolved'
          is_ready?: boolean
          pool_id?: string | null
          chatroom_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chatroom: {
        Row: {
          id: string
          pool_id: string
          state: 'waiting' | 'active' | 'ordered' | 'resolved'
          admin_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pool_id: string
          state?: 'waiting' | 'active' | 'ordered' | 'resolved'
          admin_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pool_id?: string
          state?: 'waiting' | 'active' | 'ordered' | 'resolved'
          admin_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      message: {
        Row: {
          id: number
          chatroom_id: string
          user_id: string
          content: string
          type: 'text' | 'image' | 'audio'
          sent_at: string
          read_at: string | null
        }
        Insert: {
          id?: number
          chatroom_id: string
          user_id: string
          content: string
          type?: 'text' | 'image' | 'audio'
          sent_at?: string
          read_at?: string | null
        }
        Update: {
          id?: number
          chatroom_id?: string
          user_id?: string
          content?: string
          type?: 'text' | 'image' | 'audio'
          sent_at?: string
          read_at?: string | null
        }
      }
      pool_membership: {
        Row: {
          pool_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          pool_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          pool_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      chat_membership: {
        Row: {
          chatroom_id: string
          user_id: string
          joined_at: string
          left_at: string | null
        }
        Insert: {
          chatroom_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          chatroom_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
        }
      }
      invitation: {
        Row: {
          id: string
          code: string
          invited_by: string | null
          expires_at: string
          used_by: string | null
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          invited_by?: string | null
          expires_at: string
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          invited_by?: string | null
          expires_at?: string
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
      }
      banners: {
        Row: {
          id: number
          image: string
          date: string
          shop_id: number
        }
        Insert: {
          id?: number
          image: string
          date?: string
          shop_id: number
        }
        Update: {
          id?: number
          image?: string
          date?: string
          shop_id?: number
        }
      }
    }
    Enums: {
      basket_status: 'in_pool' | 'in_chat' | 'resolved'
      chatroom_state: 'waiting' | 'active' | 'ordered' | 'resolved'
    }
    Functions: {
      resolve_chatroom: {
        Args: { chatroom_id_param: string }
        Returns: boolean
      }
      create_basket_and_join_pool: {
        Args: { 
          shop_id_param: number
          amount_param: number
          link_param?: string 
        }
        Returns: string
      }
      toggle_basket_ready: {
        Args: { basket_id_param: string }
        Returns: boolean
      }
      create_invitation: {
        Args: { expires_in_days?: number }
        Returns: string
      }
      validate_invitation: {
        Args: { invitation_code_param: string }
        Returns: boolean
      }
      get_pool_status: {
        Args: { pool_id_param: string }
        Returns: any
      }
      get_dashboard_data: {
        Args: {}
        Returns: any
      }
      track_event: {
        Args: { 
          event_type_param: string
          metadata_param?: any 
        }
        Returns: string
      }
      leave_chatroom: {
        Args: { chatroom_id_param: string }
        Returns: boolean
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
