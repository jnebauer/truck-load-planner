import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/lib/backend/constants';

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID),
  password: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(6, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH),
});

// Forgot password form validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID),
});

// Reset password form validation schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(8, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH_8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      VALIDATION_MESSAGES.PASSWORD_COMPLEXITY
    ),
  confirmPassword: z.string().min(1, VALIDATION_MESSAGES.PASSWORD_CONFIRM),
}).refine((data) => data.password === data.confirmPassword, {
  message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
  path: ["confirmPassword"],
});

// User form validation schema
export const userSchema = z.object({
  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID),
  password: z
    .string()
    .optional(),
  fullName: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(2, VALIDATION_MESSAGES.NAME_MIN_LENGTH)
    .max(100, VALIDATION_MESSAGES.NAME_MAX_LENGTH),
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
  role: z
    .string()
    .min(1, VALIDATION_MESSAGES.ROLE_REQUIRED),
  status: z.enum(['active', 'inactive', 'blocked']).optional().default('active'),
});

// User create validation schema (password required)
export const userCreateSchema = userSchema.extend({
  password: z
    .string()
    .min(6, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH),
});

// User update validation schema (password optional)
export const userUpdateSchema = userSchema.extend({
  password: z
    .string()
    .min(6, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH)
    .optional(),
});

// User form validation schema (handles both create and update)
export const userFormSchema = z.object({
  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID),
  password: z
    .string()
    .optional()
    .refine((val) => {
      // If password is provided, it must be at least 6 characters
      if (val && val.trim() !== '') {
        return val.length >= 6;
      }
      // If password is empty or undefined, it's valid (for updates)
      return true;
    }, {
      message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
    }),
  fullName: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(2, VALIDATION_MESSAGES.NAME_MIN_LENGTH)
    .max(100, VALIDATION_MESSAGES.NAME_MAX_LENGTH),
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
  profileImage: z
    .string()
    .optional()
    .or(z.literal('')),
  role: z
    .string()
    .min(1, VALIDATION_MESSAGES.ROLE_REQUIRED),
  status: z.enum(['active', 'inactive', 'blocked']),
  appPermissions: z.record(z.string(), z.boolean()).default({}),
});

// Client form validation schema (includes all user fields + client fields)
export const clientFormSchema = z.object({
  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID),
  password: z
    .string()
    .optional()
    .refine((val) => {
      if (val && val.trim() !== '') {
        return val.length >= 6;
      }
      return true;
    }, {
      message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
    }),
  fullName: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(2, VALIDATION_MESSAGES.NAME_MIN_LENGTH)
    .max(100, VALIDATION_MESSAGES.NAME_MAX_LENGTH),
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
  role: z.string(),
  status: z.enum(['active', 'inactive', 'blocked']),
  appPermissions: z.record(z.string(), z.boolean()).optional(),
  // Client-specific fields
  companyName: z.string().optional().or(z.literal('')),
  billingAddress: z.string().optional().or(z.literal('')),
  billingLat: z.number().optional().nullable(),
  billingLng: z.number().optional().nullable(),
  billingPlaceId: z.string().optional().or(z.literal('')),
  shippingAddress: z.string().optional().or(z.literal('')),
  shippingLat: z.number().optional().nullable(),
  shippingLng: z.number().optional().nullable(),
  shippingPlaceId: z.string().optional().or(z.literal('')),
  contactPerson: z.string().optional().or(z.literal('')),
  taxId: z.string().optional().or(z.literal('')),
  website: z.string().url(VALIDATION_MESSAGES.URL_INVALID).optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  logoImage: z.string().optional().or(z.literal('')),
});

// Settings validation schemas
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED),
  newPassword: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(8, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      VALIDATION_MESSAGES.PASSWORD_COMPLEXITY
    ),
  confirmPassword: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
  path: ["confirmPassword"],
});

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(2, VALIDATION_MESSAGES.NAME_MIN_LENGTH)
    .max(100, VALIDATION_MESSAGES.NAME_MAX_LENGTH),
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
export type ClientFormSchemaData = z.infer<typeof clientFormSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
