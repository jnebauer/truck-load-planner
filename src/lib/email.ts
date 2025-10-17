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

    await transporter.sendMail(mailOptions);
    
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

// Send user creation email
export async function sendUserCreatedEmail(
  to: string,
  fullName: string | null,
  email: string,
  password: string,
  role: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    
    if (!fromEmail) {
      throw new Error('SMTP_FROM email not configured');
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

    const mailOptions = {
      from: `"${EMAIL_CONSTANTS.COMPANY_NAME}" <${fromEmail}>`,
      to: to,
      subject: EMAIL_SUBJECTS.USER_CREATED,
      html: generateUserCreatedEmailHTML(fullName, email, password, role, loginUrl),
      text: generateUserCreatedEmailText(fullName, email, password, role, loginUrl),
    };

    await transporter.sendMail(mailOptions);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send user creation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Generate HTML email template for user creation
function generateUserCreatedEmailHTML(
  fullName: string | null, 
  email: string, 
  password: string, 
  role: string,
  loginUrl: string
): string {
  const displayName = fullName || 'User';
  
  // Load the HTML template
  const template = loadEmailTemplate('user-created');
  
  // Prepare template variables
  const variables = {
    SUBJECT_LINE: EMAIL_TRANSLATIONS.USER_CREATED.SUBJECT_LINE,
    COMPANY_SHORT_NAME: EMAIL_CONSTANTS.COMPANY_SHORT_NAME,
    COMPANY_NAME: EMAIL_CONSTANTS.COMPANY_NAME,
    GREETING: EMAIL_TRANSLATIONS.USER_CREATED.GREETING,
    DISPLAY_NAME: displayName,
    MAIN_MESSAGE: EMAIL_TRANSLATIONS.USER_CREATED.MAIN_MESSAGE,
    LOGIN_INSTRUCTION: EMAIL_TRANSLATIONS.USER_CREATED.LOGIN_INSTRUCTION,
    CREDENTIALS_TITLE: EMAIL_TRANSLATIONS.USER_CREATED.CREDENTIALS_TITLE,
    EMAIL_LABEL: EMAIL_TRANSLATIONS.USER_CREATED.EMAIL_LABEL,
    PASSWORD_LABEL: EMAIL_TRANSLATIONS.USER_CREATED.PASSWORD_LABEL,
    ROLE_LABEL: EMAIL_TRANSLATIONS.USER_CREATED.ROLE_LABEL,
    USER_EMAIL: email,
    USER_PASSWORD: password,
    USER_ROLE: role.charAt(0).toUpperCase() + role.slice(1),
    LOGIN_BUTTON_TEXT: EMAIL_TRANSLATIONS.USER_CREATED.LOGIN_BUTTON_TEXT,
    LOGIN_URL: loginUrl,
    SECURITY_NOTE: EMAIL_TRANSLATIONS.USER_CREATED.SECURITY_NOTE,
    SUPPORT_MESSAGE: EMAIL_TRANSLATIONS.USER_CREATED.SUPPORT_MESSAGE,
    FOOTER_MESSAGE: EMAIL_TRANSLATIONS.USER_CREATED.FOOTER_MESSAGE,
    NO_REPLY_MESSAGE: EMAIL_TRANSLATIONS.USER_CREATED.NO_REPLY_MESSAGE,
  };
  
  // Replace template variables and return
  return replaceTemplateVariables(template, variables);
}

// Generate plain text email template for user creation
function generateUserCreatedEmailText(
  fullName: string | null, 
  email: string, 
  password: string, 
  role: string,
  loginUrl: string
): string {
  const displayName = fullName || 'User';
  
  return `
${EMAIL_TRANSLATIONS.USER_CREATED.SUBJECT_LINE} - ${EMAIL_CONSTANTS.COMPANY_NAME}

${EMAIL_TRANSLATIONS.USER_CREATED.GREETING} ${displayName},

${EMAIL_TRANSLATIONS.USER_CREATED.MAIN_MESSAGE}

${EMAIL_TRANSLATIONS.USER_CREATED.LOGIN_INSTRUCTION}

${EMAIL_TRANSLATIONS.USER_CREATED.CREDENTIALS_TITLE}:
${EMAIL_TRANSLATIONS.USER_CREATED.EMAIL_LABEL}: ${email}
${EMAIL_TRANSLATIONS.USER_CREATED.PASSWORD_LABEL}: ${password}
${EMAIL_TRANSLATIONS.USER_CREATED.ROLE_LABEL}: ${role.charAt(0).toUpperCase() + role.slice(1)}

Login URL: ${loginUrl}

SECURITY NOTE:
${EMAIL_TRANSLATIONS.USER_CREATED.SECURITY_NOTE}

${EMAIL_TRANSLATIONS.USER_CREATED.SUPPORT_MESSAGE}

---
${EMAIL_TRANSLATIONS.USER_CREATED.FOOTER_MESSAGE}
${EMAIL_TRANSLATIONS.USER_CREATED.NO_REPLY_MESSAGE}
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

    await transporter.sendMail(mailOptions);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
