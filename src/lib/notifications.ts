import * as Brevo from '@getbrevo/brevo'

export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'email'
  variables: string[]
}

export interface NotificationRecipient {
  name: string
  email?: string
  ticketNumber?: string
}

export interface NotificationData {
  template: string
  recipients: NotificationRecipient[]
  variables: Record<string, string>
  scheduledFor?: Date
  priority: 'low' | 'medium' | 'high'
}

// Pre-defined notification templates
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'ticket_confirmation',
    name: 'Ticket Purchase Confirmation',
    subject: '🎫 IEEE UJ Raffle Ticket Confirmation - {{ticketNumber}}',
    content: `Hi {{buyerName}}! 👋

🎉 Your IEEE UJ Raffle ticket has been successfully purchased!

📋 **Ticket Details:**
• Ticket Number: {{ticketNumber}}
• Purchase Date: {{purchaseDate}}
• Payment Method: {{paymentMethod}}
• Seller: {{sellerName}}
• Amount: R{{ticketPrice}}

{{#if paymentMethod === 'EFT'}}
💳 **EFT Payment Instructions:**
Please transfer R{{ticketPrice}} to:
• Account Holder: MR MQHELOMHLE N MTHUNZI
• Bank: First National Bank (FNB)
• Account Number: 63042909185
• Branch Code: 250841
• Reference: {{ticketNumber}}

⚠️ Your ticket will be verified once payment is confirmed.
{{/if}}

🎁 **What's Next:**
• Keep this confirmation safe
• Your QR code is attached for verification
• Winner announcement: {{drawDate}}

📧 **Your Seller Contact:**
• Name: {{sellerName}}
• Email: {{sellerEmail}}

💬 **Questions?** Reply to this email or contact your seller directly at {{sellerEmail}}

Good luck! 🍀

Best regards,
IEEE UJ Team`,
    type: 'email',
    variables: ['buyerName', 'ticketNumber', 'purchaseDate', 'paymentMethod', 'sellerName', 'sellerEmail', 'ticketPrice', 'drawDate']
  },
  {
    id: 'payment_reminder',
    name: 'EFT Payment Reminder',
    subject: '⏰ Payment Reminder - IEEE UJ Raffle Ticket {{ticketNumber}}',
    content: `Hi {{buyerName}}! 👋

This is a friendly reminder about your IEEE UJ Raffle ticket payment.

📋 **Ticket Details:**
• Ticket Number: {{ticketNumber}}
• Amount Due: R{{ticketPrice}}
• Days Since Purchase: {{daysSincePurchase}}

💳 **EFT Payment Instructions:**
Please transfer R{{ticketPrice}} to:
• Account Holder: MR MQHELOMHLE N MTHUNZI
• Bank: First National Bank (FNB)
• Account Number: 63042909185
• Branch Code: 250841
• Reference: {{ticketNumber}}

⚠️ **Important:** Unpaid tickets may be cancelled after 7 days.

📧 **Your Seller Contact:**
• Name: {{sellerName}}
• Email: {{sellerEmail}}

💬 **Need Help?** Reply to this email or contact your seller directly at {{sellerEmail}}

Best regards,
IEEE UJ Team`,
    type: 'email',
    variables: ['buyerName', 'ticketNumber', 'ticketPrice', 'daysSincePurchase', 'sellerName', 'sellerEmail']
  },
  {
    id: 'winner_announcement',
    name: 'Winner Announcement',
    subject: '🎉 CONGRATULATIONS! You Won the IEEE UJ Raffle!',
    content: `🎉 CONGRATULATIONS {{winnerName}}! 🎉

You are the WINNER of the IEEE UJ Raffle!

🏆 **Winning Details:**
• Your Ticket: {{ticketNumber}}
• Prize: {{prizeName}}
• Draw Date: {{drawDate}}
• Total Tickets Sold: {{totalTickets}}

🎁 **Next Steps:**
1. Contact us within 7 days to claim your prize
2. Bring valid ID and this notification
3. Collection details will be sent separately

📞 **Contact Information:**
• Email: {{contactEmail}}
• Phone: Contact us for details

Thank you for supporting IEEE UJ! 🙏

Congratulations again!
IEEE UJ Team`,
    type: 'email',
    variables: ['winnerName', 'ticketNumber', 'prizeName', 'drawDate', 'totalTickets', 'contactEmail']
  },
  {
    id: 'seller_summary',
    name: 'Daily Seller Summary',
    subject: '📊 Your IEEE UJ Raffle Sales Summary - {{date}}',
    content: `Hi {{sellerName}}! 👋

Here's your daily sales summary for {{date}}:

📈 **Today's Performance:**
• Tickets Sold: {{ticketsSoldToday}}
• Revenue Generated: R{{revenueToday}}
• Verified Payments: {{verifiedToday}}
• Pending Payments: {{pendingToday}}

🏆 **Overall Stats:**
• Total Tickets: {{totalTickets}}
• Total Revenue: R{{totalRevenue}}
• Your Rank: #{{sellerRank}} of {{totalSellers}}

{{#if topSeller}}
🥇 Congratulations! You're today's top seller!
{{/if}}

💡 **Tips:**
• Follow up on pending EFT payments
• Share QR codes for easy verification
• Use email for quick confirmations

Keep up the great work! 🚀

Best regards,
IEEE UJ Team`,
    type: 'email',
    variables: ['sellerName', 'date', 'ticketsSoldToday', 'revenueToday', 'verifiedToday', 'pendingToday', 'totalTickets', 'totalRevenue', 'sellerRank', 'totalSellers']
  },
  {
    id: 'bulk_update',
    name: 'Event Update Announcement',
    subject: '📢 IEEE UJ Raffle Update - {{updateTitle}}',
    content: `Hi {{recipientName}}! 👋

{{updateTitle}}

{{updateContent}}

📋 **Event Details:**
• Draw Date: {{drawDate}}
• Total Tickets Sold: {{totalTickets}}
• Prize: {{prizeName}}

{{#if actionRequired}}
⚠️ **Action Required:** {{actionDetails}}
{{/if}}

Thank you for your continued support! 🙏

Best regards,
IEEE UJ Team`,
    type: 'email',
    variables: ['recipientName', 'updateTitle', 'updateContent', 'drawDate', 'totalTickets', 'prizeName', 'actionRequired', 'actionDetails']
  }
]

// Brevo API client initialization
let apiInstance: Brevo.TransactionalEmailsApi | null = null;

export function initializeEmailService(): Brevo.TransactionalEmailsApi | null {
  if (!process.env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not configured. Email notifications will be disabled.');
    return null;
  }

  try {
    if (!apiInstance) {
      // Initialize Brevo API client
      apiInstance = new Brevo.TransactionalEmailsApi();
      
      // Set the API key from environment variable
      // Cast to any to access protected property in TypeScript
      // This is the official pattern recommended in Brevo documentation
      (apiInstance as any).authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
    }
    
    return apiInstance;
  } catch (error) {
    console.error('Failed to initialize Brevo API:', error);
    return null;
  }
}

// Default sender email - can be overridden with environment variables
const DEFAULT_FROM = {
  email: process.env.EMAIL_FROM_ADDRESS || 'noreply@ieee-uj.org',
  name: process.env.EMAIL_FROM_NAME || 'IEEE UJ Raffle System'
};

// Send email notification using Brevo
export async function sendEmailNotification(
  to: string,
  subject: string,
  content: string,
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
): Promise<boolean> {
  try {
    if (!apiInstance) {
      apiInstance = initializeEmailService()
    }

    if (!apiInstance) {
      console.error('Brevo API client not available')
      return false
    }

    // Create email sending request
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    // Set sender
    sendSmtpEmail.sender = {
      name: DEFAULT_FROM.name,
      email: DEFAULT_FROM.email
    };
    
    // Set recipient(s)
    sendSmtpEmail.to = [{
      email: to,
      name: to.split('@')[0] // Use part before @ as name
    }];
    
    // Set content
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = content.replace(/\n/g, '<br>');
    
    // Set plain text content by stripping HTML tags
    sendSmtpEmail.textContent = content.replace(/<[^>]*>/g, '');
    
    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      sendSmtpEmail.attachment = attachments.map(attachment => ({
        name: attachment.filename,
        content: attachment.content.toString('base64'),
        type: attachment.contentType
      }));
    }
    
    // Send the email
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully via Brevo:', data.body && data.body.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email via Brevo:', error);
    return false;
  }
}

// WhatsApp functionality removed - email-only notifications

// Template variable replacement
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template

  // Simple variable replacement
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  })

  // Handle conditional blocks (basic implementation)
  result = result.replace(/{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
    // Simple condition evaluation (you could make this more sophisticated)
    const conditionValue = variables[condition.trim()]
    return conditionValue && conditionValue !== 'false' ? content : ''
  })

  return result
}

// Get template by ID
export function getTemplate(templateId: string): NotificationTemplate | undefined {
  return NOTIFICATION_TEMPLATES.find(t => t.id === templateId)
}

// Send notification using template
export async function sendNotification(data: NotificationData): Promise<{
  success: boolean
  emailResults: boolean[]
  errors: string[]
}> {
  const template = getTemplate(data.template)
  if (!template) {
    return {
      success: false,
      emailResults: [],
      errors: ['Template not found']
    }
  }

  const emailResults: boolean[] = []
  const errors: string[] = []

  for (const recipient of data.recipients) {
    try {
      const personalizedVariables = {
        ...data.variables,
        recipientName: recipient.name,
        buyerName: recipient.name,
        winnerName: recipient.name,
        sellerName: recipient.name
      }

      const subject = replaceTemplateVariables(template.subject, personalizedVariables)
      const content = replaceTemplateVariables(template.content, personalizedVariables)

      // Send email notification (email-only system)
      if (template.type === 'email' && recipient.email) {
        const emailSuccess = await sendEmailNotification(recipient.email, subject, content)
        emailResults.push(emailSuccess)
        if (!emailSuccess) {
          errors.push(`Failed to send email to ${recipient.email}`)
        }
      }
    } catch (error) {
      errors.push(`Error processing recipient ${recipient.name}: ${error}`)
    }
  }

  return {
    success: errors.length === 0,
    emailResults,
    errors
  }
}

// Utility functions for common notification scenarios
export async function sendTicketConfirmation(
  buyerName: string,
  buyerEmail: string,
  ticketNumber: string,
  paymentMethod: string,
  sellerName: string,
  sellerEmail: string,
  ticketPrice: number = 50
): Promise<boolean> {
  const result = await sendNotification({
    template: 'ticket_confirmation',
    recipients: [{
      name: buyerName,
      email: buyerEmail,
      ticketNumber
    }],
    variables: {
      ticketNumber,
      purchaseDate: new Date().toLocaleDateString(),
      paymentMethod,
      sellerName,
      sellerEmail,
      ticketPrice: ticketPrice.toString(),
      drawDate: 'TBA' // You can make this configurable
    },
    priority: 'high'
  })

  return result.success
}

export async function sendPaymentReminder(
  buyerName: string,
  buyerEmail: string,
  ticketNumber: string,
  sellerName: string,
  sellerEmail: string,
  daysSincePurchase: number,
  ticketPrice: number = 50
): Promise<boolean> {
  const result = await sendNotification({
    template: 'payment_reminder',
    recipients: [{
      name: buyerName,
      email: buyerEmail,
      ticketNumber
    }],
    variables: {
      ticketNumber,
      ticketPrice: ticketPrice.toString(),
      daysSincePurchase: daysSincePurchase.toString(),
      sellerName,
      sellerEmail
    },
    priority: 'medium'
  })

  return result.success
}
