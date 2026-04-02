export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      invitation: {
        Row: {
          code: string
          counter: number | null
          created_at: string
          expires_at: string
          id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          counter?: number | null
          created_at?: string
          expires_at: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          counter?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
      }
      user: {
        Row: {
          first_name: string | null
          id: string
          image: string | null
        }
        Insert: {
          first_name?: string | null
          id: string
          image?: string | null
        }
        Update: {
          first_name?: string | null
          id?: string
          image?: string | null
        }
      }
      basket: {
        Row: {
          amount: number
          chatroom_id: string | null
          created_at: string
          id: string
          is_ready: boolean
          pool_id: string | null
          shop_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          chatroom_id?: string | null
          created_at?: string
          id?: string
          is_ready?: boolean
          pool_id?: string | null
          shop_id: string
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          chatroom_id?: string | null
          created_at?: string
          id?: string
          is_ready?: boolean
          pool_id?: string | null
          shop_id?: string
          status?: string
          user_id?: string
        }
      }
    }
  }
}
