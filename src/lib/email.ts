import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { EMAIL_CONSTANTS, EMAIL_SUBJECTS, SECURITY_MESSAGES } from './constants';
import { EMAIL_TRANSLATIONS } from './translations';

// Load HTML template
function loadEmailTemplate(templateName: string): string {
  try {
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'email-templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Failed to load email template: ${templateName}`, error);
    throw new Error(`Email template not found: ${templateName}`);
  }
}

// Replace template variables
function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

// SMTP Configuration
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Verify connection configuration
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  to: string,
  fullName: string | null,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    
    if (!fromEmail) {
      throw new Error('SMTP_FROM email not configured');
    }

    const mailOptions = {
      from: `"${EMAIL_CONSTANTS.COMPANY_NAME}" <${fromEmail}>`,
      to: to,
      subject: EMAIL_SUBJECTS.PASSWORD_RESET,
      html: generatePasswordResetEmailHTML(fullName, resetUrl),
      text: generatePasswordResetEmailText(fullName, resetUrl),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Generate HTML email template
function generatePasswordResetEmailHTML(fullName: string | null, resetUrl: string): string {
  const displayName = fullName || 'User';
  
  // Load the HTML template
  const template = loadEmailTemplate('password-reset');
  
  // Prepare template variables
  const variables = {
    SUBJECT_LINE: EMAIL_TRANSLATIONS.PASSWORD_RESET.SUBJECT_LINE,
    COMPANY_SHORT_NAME: EMAIL_CONSTANTS.COMPANY_SHORT_NAME,
    COMPANY_NAME: EMAIL_CONSTANTS.COMPANY_NAME,
    GREETING: EMAIL_TRANSLATIONS.PASSWORD_RESET.GREETING,
    DISPLAY_NAME: displayName,
    MAIN_MESSAGE: EMAIL_TRANSLATIONS.PASSWORD_RESET.MAIN_MESSAGE,
    INSTRUCTION: EMAIL_TRANSLATIONS.PASSWORD_RESET.INSTRUCTION,
    RESET_URL: resetUrl,
    BUTTON_TEXT: EMAIL_TRANSLATIONS.PASSWORD_RESET.BUTTON_TEXT,
    SECURITY_TITLE: EMAIL_TRANSLATIONS.PASSWORD_RESET.SECURITY_TITLE,
    LINK_EXPIRY: SECURITY_MESSAGES.LINK_EXPIRY,
    IGNORE_IF_NOT_REQUESTED: SECURITY_MESSAGES.IGNORE_IF_NOT_REQUESTED,
    ONE_TIME_USE: SECURITY_MESSAGES.ONE_TIME_USE,
    FALLBACK_MESSAGE: EMAIL_TRANSLATIONS.PASSWORD_RESET.FALLBACK_MESSAGE,
    SUPPORT_MESSAGE: EMAIL_TRANSLATIONS.PASSWORD_RESET.SUPPORT_MESSAGE,
    FOOTER_MESSAGE: EMAIL_TRANSLATIONS.PASSWORD_RESET.FOOTER_MESSAGE,
    NO_REPLY_MESSAGE: EMAIL_TRANSLATIONS.PASSWORD_RESET.NO_REPLY_MESSAGE,
  };
  
  // Replace template variables and return
  return replaceTemplateVariables(template, variables);
}

// Generate plain text email template
function generatePasswordResetEmailText(fullName: string | null, resetUrl: string): string {
  const displayName = fullName || 'User';
  
  return `
${EMAIL_TRANSLATIONS.PASSWORD_RESET.SUBJECT_LINE} - ${EMAIL_CONSTANTS.COMPANY_NAME}

${EMAIL_TRANSLATIONS.PASSWORD_RESET.GREETING} ${displayName},

${EMAIL_TRANSLATIONS.PASSWORD_RESET.MAIN_MESSAGE}

To reset your password, please click the following link:
${resetUrl}

IMPORTANT SECURITY INFORMATION:
- ${SECURITY_MESSAGES.LINK_EXPIRY}
- ${SECURITY_MESSAGES.IGNORE_IF_NOT_REQUESTED}
- ${SECURITY_MESSAGES.ONE_TIME_USE}

${EMAIL_TRANSLATIONS.PASSWORD_RESET.SUPPORT_MESSAGE}

---
${EMAIL_TRANSLATIONS.PASSWORD_RESET.FOOTER_MESSAGE}
${EMAIL_TRANSLATIONS.PASSWORD_RESET.NO_REPLY_MESSAGE}
  `;
}

// Send test email
export async function sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
  try {
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    
    if (!fromEmail) {
      throw new Error('SMTP_FROM email not configured');
    }

    const mailOptions = {
      from: `"${EMAIL_CONSTANTS.COMPANY_NAME}" <${fromEmail}>`,
      to: to,
      subject: EMAIL_SUBJECTS.TEST_EMAIL,
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from ${EMAIL_CONSTANTS.COMPANY_NAME}.</p>
        <p>If you received this email, your SMTP configuration is working correctly!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
      text: `
${EMAIL_SUBJECTS.TEST_EMAIL}

This is a test email from ${EMAIL_CONSTANTS.COMPANY_NAME}.

If you received this email, your SMTP configuration is working correctly!

Time: ${new Date().toLocaleString()}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent:', info.messageId);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
