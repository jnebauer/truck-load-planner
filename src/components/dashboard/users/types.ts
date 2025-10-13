// User Management Interfaces

export interface AppPermission {
  id: string;
  name: string;
  description: string | null;
  app_url: string;
}

export interface UserAppPermission {
  id: string;
  app_id: string;
  app_permissions: AppPermission;
}

export interface User extends Record<string, unknown> {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  phone?: string;
  status: 'active' | 'inactive' | 'blocked';
  profile_image?: string | null;
  created_at: string;
  updated_at: string;
  user_app_permissions?: UserAppPermission[];
  // Client-specific fields
  company_name?: string | null;
  billing_address?: string | null;
  billing_lat?: number | null;
  billing_lng?: number | null;
  billing_place_id?: string | null;
  shipping_address?: string | null;
  shipping_lat?: number | null;
  shipping_lng?: number | null;
  shipping_place_id?: string | null;
  contact_person?: string | null;
  tax_id?: string | null;
  website?: string | null;
  notes?: string | null;
  logo_url?: string | null;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}


export interface UsersStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  blockedUsers: number;
}
