import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Database {
  public: {
    Tables: {
      packages: {
        Row: {
          id: number
          icon: string
          name: string
          merrylimit: number
          created_at: string
          updated_at: string
          details: string[]
          order_index: number
        }
        Insert: {
          icon: string
          name: string
          merrylimit: number
          details: string[]
          order_index?: number
        }
        Update: {
          id?: number
          icon?: string
          name?: string
          merrylimit?: number
          details?: string[]
          order_index?: number
          updated_at?: string
        }
      }
      complaints: {
        Row: {
          id: number
          user_name: string
          issue: string
          description: string
          date_submitted: string
          status: string
          resolved_date: string | null
          canceled_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_name: string
          issue: string
          description: string
          status?: string
          date_submitted?: string
        }
        Update: {
          id?: number
          status?: string
          resolved_date?: string | null
          canceled_date?: string | null
          updated_at?: string
        }
      }
    }
  }
}