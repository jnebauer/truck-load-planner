// Shared types for user forms
export type UserFormType = {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  profileImage?: string;
  role: string;
  status: 'active' | 'inactive' | 'blocked';
  appPermissions?: Record<string, boolean>;
};
