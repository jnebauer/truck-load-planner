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
  profileImage: z
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

// Project form validation schema
export const projectFormSchema = z.object({
  clientId: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED),
  name: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(2, 'Project name must be at least 2 characters')
    .max(200, 'Project name must not exceed 200 characters'),
  code: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .regex(/^[A-Z0-9-]+$/, 'Project code must contain only uppercase letters, numbers, and hyphens')
    .max(50, 'Project code must not exceed 50 characters'),
  siteAddress: z.string().optional().or(z.literal('')),
  siteLat: z.number().optional().nullable(),
  siteLng: z.number().optional().nullable(),
  sitePlaceId: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled', 'inactive', 'deleted']),
  notes: z.string().optional().or(z.literal('')),
}).refine((data) => {
  // If both dates are provided, end date must be greater than or equal to start date
  if (data.startDate && data.endDate && data.startDate !== '' && data.endDate !== '') {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be greater than or equal to start date',
  path: ['endDate'],
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

// Inventory form validation schema
export const inventoryFormSchema = z.object({
  // Item details
  clientId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  projectId: z.string().optional().or(z.literal('')),
  label: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(2, 'Item label must be at least 2 characters')
    .max(200, 'Item label must not exceed 200 characters'),
  sku: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  lengthMm: z.coerce.number().positive('Length must be positive'),
  widthMm: z.coerce.number().positive('Width must be positive'),
  heightMm: z.coerce.number().positive('Height must be positive'),
  weightKg: z.coerce.number().nonnegative('Weight cannot be negative'),
  stackability: z.enum(['stackable', 'non_stackable', 'top_only', 'bottom_only']),
  topLoadRatingKg: z.coerce.number().nonnegative('Top load rating cannot be negative').optional(),
  orientationLocked: z.boolean().optional(),
  fragile: z.boolean().optional(),
  keepUpright: z.boolean().optional(),
  priority: z.coerce.number().int('Priority must be an integer').positive('Priority must be positive').optional().nullable(),
  // Inventory unit details
  palletNo: z.string().optional().or(z.literal('')),
  inventoryDate: z.string().optional().or(z.literal('')),
  locationSite: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  locationAisle: z.string().optional().or(z.literal('')),
  locationBay: z.string().optional().or(z.literal('')),
  locationLevel: z.string().optional().or(z.literal('')),
  locationNotes: z.string().optional().or(z.literal('')),
  quantity: z.coerce.number().int('Quantity must be an integer').positive('Quantity must be positive').optional(),
  status: z.enum(['in_storage', 'reserved', 'on_truck', 'onsite', 'returned']),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
export type ClientFormSchemaData = z.infer<typeof clientFormSchema>;
export type ProjectFormData = z.infer<typeof projectFormSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type InventoryFormData = z.infer<typeof inventoryFormSchema>;
