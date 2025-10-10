// Shared types for user forms
export type UserFormType = {
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
};
