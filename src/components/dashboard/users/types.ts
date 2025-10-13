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
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  user_app_permissions?: UserAppPermission[];
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
  pendingUsers: number;
}
