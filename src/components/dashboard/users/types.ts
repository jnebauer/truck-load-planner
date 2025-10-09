// User Management Interfaces

export interface User extends Record<string, unknown> {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface UserFormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface UsersStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingUsers: number;
}
