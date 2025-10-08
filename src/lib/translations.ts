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
} as const;

// UI translations
export const UI_TRANSLATIONS = {
  LOGIN: {
    FORGOT_PASSWORD: 'Forgot your password?',
    SIGN_IN: 'Sign In',
    SIGNING_IN: 'Signing In...',
  },
} as const;
