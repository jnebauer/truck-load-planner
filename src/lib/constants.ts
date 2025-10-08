// Email constants
export const EMAIL_CONSTANTS = {
  COMPANY_NAME: 'Truck Loading & Storage Tracker',
  COMPANY_SHORT_NAME: 'Truck Tracker',
  SUPPORT_EMAIL: 'support@trucktracker.com',
  RESET_LINK_EXPIRY_HOURS: 1,
} as const;

// Email subjects
export const EMAIL_SUBJECTS = {
  PASSWORD_RESET: 'Password Reset Request - Truck Loading & Storage Tracker',
  TEST_EMAIL: 'Test Email - Truck Loading & Storage Tracker',
} as const;

// Security messages
export const SECURITY_MESSAGES = {
  LINK_EXPIRY: 'This link will expire in 1 hour',
  IGNORE_IF_NOT_REQUESTED: "If you didn't request this reset, please ignore this email",
  ONE_TIME_USE: 'For security, this link can only be used once',
} as const;
