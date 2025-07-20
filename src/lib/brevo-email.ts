import * as Brevo from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new Brevo.TransactionalEmailsApi();
let apiKey = Brevo.ApiClient.instance.authentications['api-key'];

// Set the API key from environment variable
if (process.env.BREVO_API_KEY) {
  apiKey.apiKey = process.env.BREVO_API_KEY;
} else {
  console.warn('BREVO_API_KEY is not set. Email functionality will not work.');
}

// Default sender email 
export const DEFAULT_FROM = {
  email: process.env.EMAIL_FROM_ADDRESS || 'noreply@ieee-uj.org',
  name: process.env.EMAIL_FROM_NAME || 'IEEE UJ Raffle System'
};

// Event details - can be overridden with environment variables
const EVENT_NAME = process.env.EVENT_NAME || 'IEEE UJ Event';
const EVENT_DATE = process.env.EVENT_DATE || 'TBA';
const EVENT_LOCATION = process.env.EVENT_LOCATION || 'University of Johannesburg';

interface EmailOptions {
  to: string;
  subject?: string;
  text?: string;
  html?: string;
  from?: {
    email: string;
    name: string;
  };
}

export interface TicketDetails {
  name: string;
  email: string;
  ticketNumber: string;
  paymentMethod: string;
  paymentStatus: string;
}

/**
 * Sends an email using Brevo
 */
export async function sendEmail({ 
  to, 
  subject = 'Message from IEEE UJ', 
  html = '', 
  text, 
  from = DEFAULT_FROM 
}: EmailOptions) {
  if (!process.env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not configured. Email sending is disabled.');
    return { success: false, message: 'Email sending is disabled' };
  }

  try {
    // Create email sending request
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    // Set sender
    sendSmtpEmail.sender = {
      name: from.name,
      email: from.email
    };
    
    // Set recipient(s)
    sendSmtpEmail.to = [{
      email: to,
      name: to.split('@')[0] // Use part before @ as name
    }];
    
    // Set content
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    
    // Set plain text content if provided, otherwise strip HTML tags
    sendSmtpEmail.textContent = text || (html ? html.replace(/<[^>]*>/g, '') : '');
    
    // Send the email
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    return { 
      success: true, 
      data, 
      message: 'Email sent successfully' 
    };
  } catch (error: any) {
    console.error('Brevo error:', error);
    return { 
      success: false, 
      error, 
      message: error.message || 'Failed to send email' 
    };
  }
}

export function generateTicketPurchaseEmail(ticket: TicketDetails) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-ticket?identifier=${encodeURIComponent(ticket.ticketNumber)}`;
  
  const eftDetails = `
    <strong>Account Holder:</strong> MR MQHELOMHLE N MTHUNZI<br>
    <strong>Bank:</strong> First National Bank (FNB)<br>
    <strong>Account Type:</strong> FNB EASY ACCOUNT<br>
    <strong>Account Number:</strong> 63042909185<br>
    <strong>Branch Code:</strong> 250841<br>
    <strong>Branch Name:</strong> FNB POP BRANCH DEL GAU WES<br>
    <strong>Swift Code:</strong> FIRNZAJJ<br>
    <strong>Reference:</strong> IEEE UJ + ${ticket.ticketNumber}
  `;

  const subject = `Your IEEE UJ Ticket: ${ticket.ticketNumber}`;
  
  const paymentInstructions = ticket.paymentStatus === 'VERIFIED' 
    ? `<div style="background-color: #0d9f6e25; padding: 15px; border-left: 4px solid #0d9f6e; border-radius: 4px;"><p style="margin:0; color: #0d9f6e; font-weight: bold;">✓ Your payment has been verified. Thank you!</p></div>`
    : ticket.paymentMethod === 'Cash' 
      ? `<div style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <p style="margin:0 0 10px 0; font-weight: bold;">Cash Payment Instructions:</p>
          <p style="margin:0;">Please bring exact cash payment to one of the following:</p>
          <ul style="margin-top:8px;">
            <li>Any IEEE UJ committee member</li>
            <li>The IEEE UJ office at UJ APK Campus, John Orr Building, Room 4312</li>
            <li>Designated payment points during IEEE UJ events</li>
          </ul>
          <p style="margin-top:10px;"><strong>Payment deadline:</strong> At least 24 hours before the event</p>
        </div>`
      : `
        <div style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <p style="margin:0 0 10px 0; font-weight: bold;">EFT Payment Instructions:</p>
          <p style="margin:0 0 10px 0;">Please complete your payment via EFT using the bank details below:</p>
          <div style="margin-left: 10px; border-left: 2px solid #ddd; padding-left: 10px; margin-bottom: 10px;">
            ${eftDetails}
          </div>
          <p style="margin:0;"><strong>Payment deadline:</strong> At least 24 hours before the event</p>
          <p style="margin-top:10px; font-style: italic;">After making payment, please send proof of payment to ieeeuj@gmail.com</p>
        </div>
      `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IEEE UJ Ticket Confirmation</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            border: 1px solid #e5e7eb;
            border-radius: 5px;
          }
          .header {
            background: linear-gradient(135deg, #00629B, #006699);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
            margin: -20px -20px 20px -20px;
          }
          .ticket-info {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
          }
          .ticket-number {
            font-size: 24px;
            color: #00629B;
            font-weight: bold;
            text-align: center;
            padding: 10px;
            border: 2px dashed #00629B;
            border-radius: 5px;
            background-color: #f0f8ff;
            margin: 15px 0;
          }
          .qr-section {
            text-align: center;
            margin: 20px 0;
          }
          .footer { 
            margin-top: 30px; 
            font-size: 12px; 
            color: #666; 
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .logo {
            max-width: 150px;
            margin: 0 auto 15px auto;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img class="logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/IEEE_logo.svg/320px-IEEE_logo.svg.png" alt="IEEE Logo">
            <h1>Ticket Confirmation</h1>
          </div>
          
          <p>Hello ${ticket.name},</p>
          
          <p>Thank you for your ticket purchase for the <strong>${EVENT_NAME}</strong> event. Here are your ticket details:</p>
          
          <div class="ticket-info">
            <p><strong>Event:</strong> ${EVENT_NAME}</p>
            <p><strong>Date:</strong> ${EVENT_DATE}</p>
            <p><strong>Location:</strong> ${EVENT_LOCATION}</p>
            <p><strong>Name:</strong> ${ticket.name}</p>
            <p><strong>Email:</strong> ${ticket.email}</p>
            
            <div class="ticket-number">
              Ticket #: ${ticket.ticketNumber}
            </div>
          </div>
          
          <h2>Payment Status: ${ticket.paymentStatus === 'VERIFIED' ? 'Verified' : 'Pending'}</h2>
          
          ${paymentInstructions}
          
          <div class="qr-section">
            <p>You can also verify your ticket by scanning this QR code or visiting:</p>
            <p><a href="${verifyUrl}" style="color: #3b82f6;">${verifyUrl}</a></p>
          </div>
          
          <p>Please save this email as it serves as your ticket. You'll need to present this ticket number at the event entrance.</p>
          
          <p>Thank you for your support of IEEE UJ! We look forward to seeing you at the event.</p>
          
          <p>If you have any questions or need assistance, please contact us at <a href="mailto:ieeeuj@gmail.com" style="color: #3b82f6;">ieeeuj@gmail.com</a>.</p>
          
          <div class="footer">
            <p style="margin-bottom: 10px;"><strong>IEEE University of Johannesburg Student Branch</strong></p>
            <p style="margin: 5px 0;">This is an automated message. Please do not reply directly to this email.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} IEEE UJ. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    IEEE UJ Ticket Confirmation: ${ticket.ticketNumber}
    
    Hello ${ticket.name},
    
    Thank you for your ticket purchase for the ${EVENT_NAME} event.
    
    TICKET DETAILS:
    Event: ${EVENT_NAME}
    Date: ${EVENT_DATE}
    Location: ${EVENT_LOCATION}
    Name: ${ticket.name}
    Email: ${ticket.email}
    Ticket #: ${ticket.ticketNumber}
    Payment Status: ${ticket.paymentStatus === 'VERIFIED' ? 'Verified' : 'Pending'}
    
    ${ticket.paymentStatus !== 'VERIFIED' ? `
    PAYMENT INSTRUCTIONS:
    ${ticket.paymentMethod === 'Cash' 
      ? 'Please bring exact cash payment to any IEEE UJ committee member, the IEEE UJ office at UJ APK Campus, John Orr Building, Room 4312, or designated payment points during IEEE UJ events.'
      : `Please complete payment via EFT:
      Account Holder: MR MQHELOMHLE N MTHUNZI
      Bank: First National Bank (FNB)
      Account Type: FNB EASY ACCOUNT
      Account Number: 63042909185
      Branch Code: 250841
      Branch Name: FNB POP BRANCH DEL GAU WES
      Swift Code: FIRNZAJJ
      Reference: IEEE UJ + ${ticket.ticketNumber}
      
      After making payment, please send proof of payment to ieeeuj@gmail.com`
    }
    ` : ''}
    
    Verify your ticket online: ${verifyUrl}
    
    Please save this email as it serves as your ticket. You'll need to present this ticket number at the event entrance.
    
    Thank you for your support of IEEE UJ! We look forward to seeing you at the event.
    
    If you have any questions, please contact us at ieeeuj@gmail.com.
    
    IEEE University of Johannesburg Student Branch
    This is an automated message. Please do not reply directly to this email.
    © ${new Date().getFullYear()} IEEE UJ. All rights reserved.
  `;

  return { subject, html, text };
}

export function generatePaymentConfirmationEmail(ticket: TicketDetails) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-ticket?identifier=${encodeURIComponent(ticket.ticketNumber)}`;

  const subject = `Payment Confirmed for IEEE UJ Ticket: ${ticket.ticketNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IEEE UJ Payment Confirmation</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            border: 1px solid #e5e7eb;
            border-radius: 5px;
          }
          .header {
            background: linear-gradient(135deg, #00629B, #006699);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
            margin: -20px -20px 20px -20px;
          }
          .ticket-info {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
          }
          .success-banner {
            background-color: #ecfdf5;
            border-left: 4px solid #10B981;
            padding: 15px;
            margin: 20px 0;
          }
          .ticket-number {
            font-size: 24px;
            color: #10B981;
            font-weight: bold;
            text-align: center;
            padding: 10px;
            border: 2px dashed #10B981;
            border-radius: 5px;
            background-color: #ecfdf5;
            margin: 15px 0;
          }
          .next-steps {
            background-color: #f0f8ff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { 
            margin-top: 30px; 
            font-size: 12px; 
            color: #666; 
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .logo {
            max-width: 150px;
            margin: 0 auto 15px auto;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img class="logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/IEEE_logo.svg/320px-IEEE_logo.svg.png" alt="IEEE Logo">
            <h1>Payment Confirmed!</h1>
          </div>
          
          <div class="success-banner">
            <p style="margin: 0; font-weight: bold;">Great news! Your payment for your IEEE UJ event ticket has been verified and confirmed.</p>
          </div>
          
          <p>Hello ${ticket.name},</p>
          
          <p>Thank you for completing your payment for the <strong>${EVENT_NAME}</strong> event. Your ticket is now fully confirmed.</p>
          
          <div class="ticket-info">
            <p><strong>Event:</strong> ${EVENT_NAME}</p>
            <p><strong>Date:</strong> ${EVENT_DATE}</p>
            <p><strong>Location:</strong> ${EVENT_LOCATION}</p>
            <p><strong>Name:</strong> ${ticket.name}</p>
            <p><strong>Email:</strong> ${ticket.email}</p>
            <p><strong>Payment Method:</strong> ${ticket.paymentMethod}</p>
            <p><strong>Payment Status:</strong> <span style="color: #10B981; font-weight: bold;">VERIFIED</span></p>
            
            <div class="ticket-number">
              Ticket #: ${ticket.ticketNumber}
            </div>
          </div>
          
          <div class="next-steps">
            <h3 style="margin-top: 0;">What's Next?</h3>
            <ul>
              <li>Save this email as proof of purchase</li>
              <li>Arrive at the event with your ticket number</li>
              <li>Present your ticket for scanning at the entrance</li>
            </ul>
          </div>
          
          <p>You can verify your ticket status anytime by visiting:</p>
          <p style="text-align: center;"><a href="${verifyUrl}" style="color: #3b82f6;">${verifyUrl}</a></p>
          
          <p>Thank you for your support of IEEE UJ! We look forward to seeing you at the event.</p>
          
          <p>If you have any questions or need assistance, please contact us at <a href="mailto:ieeeuj@gmail.com" style="color: #3b82f6;">ieeeuj@gmail.com</a>.</p>
          
          <div class="footer">
            <p style="margin-bottom: 10px;"><strong>IEEE University of Johannesburg Student Branch</strong></p>
            <p style="margin: 5px 0;">This is an automated message. Please do not reply directly to this email.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} IEEE UJ. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Payment Confirmed for IEEE UJ Ticket: ${ticket.ticketNumber}
    
    Hello ${ticket.name},
    
    Great news! Your payment for ticket #${ticket.ticketNumber} has been verified and confirmed.
    
    You're all set for ${EVENT_NAME} on ${EVENT_DATE} at ${EVENT_LOCATION}.
    
    What's Next?
    - Save this email as proof of purchase
    - Arrive at the event with your ticket number
    - Present your ticket for scanning at the entrance
    
    You can verify your ticket status anytime by visiting: ${verifyUrl}
    
    Thank you for your support of IEEE UJ!
    
    This is an automated message. Please do not reply directly to this email.
    © ${new Date().getFullYear()} IEEE UJ. All rights reserved.
  `;

  return { subject, html, text };
}

// Export a utility to help test the email service
export async function sendTestEmail(to: string) {
  const subject = "Test Email from IEEE UJ Raffle System";
  const text = "This is a test email from your IEEE UJ Raffle System. If you received this, your email configuration is working correctly.";
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IEEE UJ Test Email</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            border: 1px solid #e5e7eb;
            border-radius: 5px;
          }
          .header {
            background: linear-gradient(135deg, #00629B, #006699);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
            margin: -20px -20px 20px -20px;
          }
          .success {
            background-color: #ecfdf5;
            border-left: 4px solid #10B981;
            padding: 15px;
            margin: 20px 0;
          }
          .footer { 
            margin-top: 30px; 
            font-size: 12px; 
            color: #666; 
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IEEE UJ Test Email</h1>
          </div>
          
          <p>Hello,</p>
          
          <p>This is a test email from your IEEE UJ Raffle System.</p>
          
          <div class="success">
            <p><strong>Success!</strong> If you're reading this, your email configuration is working correctly.</p>
          </div>
          
          <p>You can now use the email system to:</p>
          <ul>
            <li>Send ticket confirmations</li>
            <li>Send payment confirmations</li>
            <li>Send event reminders</li>
          </ul>
          
          <p>No further action is needed.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} IEEE UJ. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return sendEmail({ to, subject, text, html });
}
