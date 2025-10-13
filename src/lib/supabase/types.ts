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
          status: 'active' | 'inactive' | 'blocked'
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
          status?: 'active' | 'inactive' | 'blocked'
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
          status?: 'active' | 'inactive' | 'blocked'
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
      app_permissions: {
        Row: {
          id: string
          name: string
          description: string | null
          app_url: string | null
          status: 'active' | 'inactive' | 'deleted'
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          app_url?: string | null
          status?: 'active' | 'inactive' | 'deleted'
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          app_url?: string | null
          status?: 'active' | 'inactive' | 'deleted'
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_permissions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_permissions_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_app_permissions: {
        Row: {
          id: string
          user_id: string
          app_id: string
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          app_id: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          app_id?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_app_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_app_permissions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "app_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_app_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_app_permissions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_app_permissions_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          company_name: string | null
          billing_address: string | null
          billing_lat: number | null
          billing_lng: number | null
          billing_place_id: string | null
          shipping_address: string | null
          shipping_lat: number | null
          shipping_lng: number | null
          shipping_place_id: string | null
          contact_person: string | null
          tax_id: string | null
          website: string | null
          notes: string | null
          logo_url: string | null
          status: 'active' | 'inactive'
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          billing_address?: string | null
          billing_lat?: number | null
          billing_lng?: number | null
          billing_place_id?: string | null
          shipping_address?: string | null
          shipping_lat?: number | null
          shipping_lng?: number | null
          shipping_place_id?: string | null
          contact_person?: string | null
          tax_id?: string | null
          website?: string | null
          notes?: string | null
          logo_url?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          billing_address?: string | null
          billing_lat?: number | null
          billing_lng?: number | null
          billing_place_id?: string | null
          shipping_address?: string | null
          shipping_lat?: number | null
          shipping_lng?: number | null
          shipping_place_id?: string | null
          contact_person?: string | null
          tax_id?: string | null
          website?: string | null
          notes?: string | null
          logo_url?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_deleted_by_fkey"
            columns: ["deleted_by"]
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
      user_status: 'active' | 'inactive' | 'blocked'
      permission_type: 'users.create' | 'users.read' | 'users.update' | 'users.delete' | 'clients.create' | 'clients.read' | 'clients.update' | 'clients.delete' | 'inventory.create' | 'inventory.read' | 'inventory.update' | 'inventory.delete' | 'projects.create' | 'projects.read' | 'projects.update' | 'projects.delete' | 'load_plans.create' | 'load_plans.read' | 'load_plans.update' | 'load_plans.delete' | 'reports.generate' | 'reports.view'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}