import nodemailer from 'nodemailer'

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

// Email service configuration
let emailTransporter: nodemailer.Transporter | null = null

export function initializeEmailService() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email service not configured. Email notifications will be disabled.')
    return null
  }

  emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  return emailTransporter
}

// Send email notification
export async function sendEmailNotification(
  to: string,
  subject: string,
  content: string,
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
): Promise<boolean> {
  try {
    if (!emailTransporter) {
      emailTransporter = initializeEmailService()
    }

    if (!emailTransporter) {
      console.error('Email service not available')
      return false
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html: content.replace(/\n/g, '<br>'),
      attachments: attachments || []
    }

    const result = await emailTransporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
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
