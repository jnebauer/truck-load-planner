import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/constants';

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
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
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
  status: z.enum(['active', 'inactive', 'pending']).optional().default('active'),
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

// Client form validation schema
export const clientSchema = z.object({
  name: z
    .string()
    .min(1, 'Client name is required')
    .min(2, 'Client name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  address: z
    .string()
    .min(1, 'Address is required')
    .min(10, 'Address must be at least 10 characters'),
  status: z.enum(['active', 'inactive']).optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
