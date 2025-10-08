export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string | null
          role_id: string | null
          status: 'active' | 'inactive' | 'pending'
          created_at: string
          updated_at: string
          reset_token: string | null
          reset_token_expiry: string | null
          last_login: string | null
          email_verified: boolean
          phone: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name?: string | null
          role_id?: string | null
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
          reset_token?: string | null
          reset_token_expiry?: string | null
          last_login?: string | null
          email_verified?: boolean
          phone?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string | null
          role_id?: string | null
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
          reset_token?: string | null
          reset_token_expiry?: string | null
          last_login?: string | null
          email_verified?: boolean
          phone?: string | null
          avatar_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission: string
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission: string
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          billing_ref: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          billing_ref?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          billing_ref?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_clients: {
        Row: {
          id: string
          user_id: string
          client_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'pm' | 'warehouse' | 'client_viewer'
      user_status: 'active' | 'inactive' | 'pending'
      permission_type: 'users.create' | 'users.read' | 'users.update' | 'users.delete' | 'clients.create' | 'clients.read' | 'clients.update' | 'clients.delete' | 'inventory.create' | 'inventory.read' | 'inventory.update' | 'inventory.delete' | 'projects.create' | 'projects.read' | 'projects.update' | 'projects.delete' | 'load_plans.create' | 'load_plans.read' | 'load_plans.update' | 'load_plans.delete' | 'reports.generate' | 'reports.view'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}