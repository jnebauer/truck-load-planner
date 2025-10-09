// Email translations
export const EMAIL_TRANSLATIONS = {
  PASSWORD_RESET: {
    GREETING: 'Hello',
    SUBJECT_LINE: 'Password Reset Request',
    MAIN_MESSAGE: 'We received a request to reset your password for your Truck Loading & Storage Tracker account.',
    INSTRUCTION: 'Click the button below to reset your password:',
    BUTTON_TEXT: 'Reset My Password',
    FALLBACK_MESSAGE: 'If the button doesn\'t work, you can copy and paste this link into your browser:',
    SUPPORT_MESSAGE: 'If you have any questions or need assistance, please contact our support team.',
    FOOTER_MESSAGE: 'This email was sent from Truck Loading & Storage Tracker',
    NO_REPLY_MESSAGE: 'Please do not reply to this email address',
    SECURITY_TITLE: 'Important Security Information',
  },
  USER_CREATED: {
    GREETING: 'Welcome',
    SUBJECT_LINE: 'Your Account is Ready',
    MAIN_MESSAGE: 'Your account has been successfully created for Truck Loading & Storage Tracker.',
    LOGIN_INSTRUCTION: 'You can now log in to your account using the credentials below:',
    CREDENTIALS_TITLE: 'Your Login Credentials',
    EMAIL_LABEL: 'Email',
    PASSWORD_LABEL: 'Password',
    ROLE_LABEL: 'Role',
    LOGIN_BUTTON_TEXT: 'Login to Your Account',
    LOGIN_URL: 'Login URL',
    SECURITY_NOTE: 'For security reasons, please change your password after your first login.',
    SUPPORT_MESSAGE: 'If you have any questions or need assistance, please contact our support team.',
    FOOTER_MESSAGE: 'This email was sent from Truck Loading & Storage Tracker',
    NO_REPLY_MESSAGE: 'Please do not reply to this email address',
  },
} as const;

// UI translations
export const UI_TRANSLATIONS = {
  LOGIN: {
    FORGOT_PASSWORD: 'Forgot your password?',
    SIGN_IN: 'Sign In',
    SIGNING_IN: 'Signing In...',
  },
} as const;
