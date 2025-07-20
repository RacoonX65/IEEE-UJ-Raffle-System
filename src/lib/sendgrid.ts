import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Email functionality will not work.');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends an email using SendGrid
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Create the email message
    const message = {
      to,
      from: process.env.EMAIL_FROM || 'IEEE UJ Raffle System <noreply@example.com>',
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback plain text
    };

    // Send the email
    const response = await sgMail.send(message);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('SendGrid error:', error);
    if (error.response) {
      // Extract the SendGrid error details
      const { message, code, response } = error;
      const { headers, body } = response;
      
      return { 
        success: false, 
        error: {
          message,
          code,
          details: body
        }
      };
    }
    return { success: false, error: { message: error.message || 'Unknown error' } };
  }
}
