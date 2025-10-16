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
  clientId: z.string().min(1, VALIDATION_MESSAGES.CLIENT_REQUIRED),
  label: z
    .string()
    .min(1, VALIDATION_MESSAGES.ITEM_LABEL_REQUIRED),
  description: z.string().optional().or(z.literal('')),
  lengthMm: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return { empty: true };
      const num = Number(val);
      if (isNaN(num)) return { invalid: true };
      return num;
    },
    z.union([z.number(), z.object({ empty: z.boolean() }), z.object({ invalid: z.boolean() })])
      .refine((val) => typeof val === 'number' || !('empty' in val), {
        message: VALIDATION_MESSAGES.LENGTH_REQUIRED,
      })
      .refine((val) => typeof val === 'number' || !('invalid' in val), {
        message: VALIDATION_MESSAGES.LENGTH_INVALID,
      })
      .refine((val) => typeof val !== 'number' || val > 0, {
        message: VALIDATION_MESSAGES.LENGTH_MUST_BE_POSITIVE,
      })
  ),
  widthMm: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return { empty: true };
      const num = Number(val);
      if (isNaN(num)) return { invalid: true };
      return num;
    },
    z.union([z.number(), z.object({ empty: z.boolean() }), z.object({ invalid: z.boolean() })])
      .refine((val) => typeof val === 'number' || !('empty' in val), {
        message: VALIDATION_MESSAGES.WIDTH_REQUIRED,
      })
      .refine((val) => typeof val === 'number' || !('invalid' in val), {
        message: VALIDATION_MESSAGES.WIDTH_INVALID,
      })
      .refine((val) => typeof val !== 'number' || val > 0, {
        message: VALIDATION_MESSAGES.WIDTH_MUST_BE_POSITIVE,
      })
  ),
  heightMm: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return { empty: true };
      const num = Number(val);
      if (isNaN(num)) return { invalid: true };
      return num;
    },
    z.union([z.number(), z.object({ empty: z.boolean() }), z.object({ invalid: z.boolean() })])
      .refine((val) => typeof val === 'number' || !('empty' in val), {
        message: VALIDATION_MESSAGES.HEIGHT_REQUIRED,
      })
      .refine((val) => typeof val === 'number' || !('invalid' in val), {
        message: VALIDATION_MESSAGES.HEIGHT_INVALID,
      })
      .refine((val) => typeof val !== 'number' || val > 0, {
        message: VALIDATION_MESSAGES.HEIGHT_MUST_BE_POSITIVE,
      })
  ),
  volumeM3: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return { empty: true };
      const num = Number(val);
      if (isNaN(num)) return { invalid: true };
      return num;
    },
    z.union([z.number(), z.object({ empty: z.boolean() }), z.object({ invalid: z.boolean() })])
      .refine((val) => typeof val === 'number' || !('empty' in val), {
        message: VALIDATION_MESSAGES.VOLUME_REQUIRED,
      })
      .refine((val) => typeof val === 'number' || !('invalid' in val), {
        message: VALIDATION_MESSAGES.VOLUME_INVALID,
      })
      .refine((val) => typeof val !== 'number' || val > 0, {
        message: VALIDATION_MESSAGES.VOLUME_MUST_BE_POSITIVE,
      })
  ),
  weightKg: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return { empty: true };
      const num = Number(val);
      if (isNaN(num)) return { invalid: true };
      return num;
    },
    z.union([z.number(), z.object({ empty: z.boolean() }), z.object({ invalid: z.boolean() })])
      .refine((val) => typeof val === 'number' || !('empty' in val), {
        message: VALIDATION_MESSAGES.WEIGHT_REQUIRED,
      })
      .refine((val) => typeof val === 'number' || !('invalid' in val), {
        message: VALIDATION_MESSAGES.WEIGHT_INVALID,
      })
      .refine((val) => typeof val !== 'number' || val >= 0, {
        message: VALIDATION_MESSAGES.WEIGHT_MUST_BE_POSITIVE,
      })
  ),
  stackability: z.enum(['stackable', 'non_stackable', 'top_only', 'bottom_only']),
  topLoadRatingKg: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return { empty: true };
      const num = Number(val);
      if (isNaN(num)) return { invalid: true };
      return num;
    },
    z.union([z.number(), z.object({ empty: z.boolean() }), z.object({ invalid: z.boolean() })])
      .refine((val) => typeof val === 'number' || !('empty' in val), {
        message: VALIDATION_MESSAGES.TOP_LOAD_RATING_REQUIRED,
      })
      .refine((val) => typeof val === 'number' || !('invalid' in val), {
        message: VALIDATION_MESSAGES.TOP_LOAD_RATING_INVALID,
      })
      .refine((val) => typeof val !== 'number' || val >= 0, {
        message: VALIDATION_MESSAGES.TOP_LOAD_RATING_NEGATIVE,
      })
  ),
  orientationLocked: z.boolean().optional(),
  fragile: z.boolean().optional(),
  keepUpright: z.boolean().optional(),
  priority: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null; // Optional field
      const num = Number(val);
      if (isNaN(num)) return { invalid: true };
      return num;
    },
    z.union([z.number(), z.null(), z.object({ invalid: z.boolean() })])
      .refine((val) => val === null || typeof val === 'number' || !('invalid' in val), {
        message: VALIDATION_MESSAGES.PRIORITY_INVALID,
      })
      .refine((val) => val === null || typeof val !== 'number' || Number.isInteger(val), {
        message: VALIDATION_MESSAGES.PRIORITY_MUST_BE_INTEGER,
      })
      .refine((val) => val === null || typeof val !== 'number' || val > 0, {
        message: VALIDATION_MESSAGES.PRIORITY_MUST_BE_POSITIVE,
      })
  ).optional().nullable(),
  // Inventory unit details
  palletNo: z
    .string()
    .min(1, VALIDATION_MESSAGES.PALLET_NUMBER_REQUIRED),
  inventoryDate: z
    .string()
    .min(1, VALIDATION_MESSAGES.INVENTORY_DATE_REQUIRED)
    .refine((val) => !isNaN(Date.parse(val)), {
      message: VALIDATION_MESSAGES.INVENTORY_DATE_INVALID,
    }),
  locationSite: z.string().min(1, VALIDATION_MESSAGES.LOCATION_SITE_REQUIRED),
  locationLatitude: z.number().optional().nullable(),
  locationLongitude: z.number().optional().nullable(),
  locationAisle: z.string().optional().or(z.literal('')),
  locationBay: z.string().optional().or(z.literal('')),
  locationLevel: z.string().optional().or(z.literal('')),
  locationNotes: z.string().optional().or(z.literal('')),
  quantity: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null; // Optional field
      const num = Number(val);
      if (isNaN(num)) return { invalid: true };
      return num;
    },
    z.union([z.number(), z.null(), z.object({ invalid: z.boolean() })])
      .refine((val) => val === null || typeof val === 'number' || !('invalid' in val), {
        message: VALIDATION_MESSAGES.QUANTITY_INVALID,
      })
      .refine((val) => val === null || typeof val !== 'number' || Number.isInteger(val), {
        message: VALIDATION_MESSAGES.QUANTITY_MUST_BE_INTEGER,
      })
      .refine((val) => val === null || typeof val !== 'number' || val > 0, {
        message: VALIDATION_MESSAGES.QUANTITY_MUST_BE_POSITIVE,
      })
  ).optional().nullable(),
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
