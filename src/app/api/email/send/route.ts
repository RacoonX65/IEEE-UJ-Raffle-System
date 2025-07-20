import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sendEmail, generateTicketPurchaseEmail, generatePaymentConfirmationEmail, TicketDetails } from '@/lib/email'

// This endpoint handles sending emails for ticket confirmation, payment confirmation, etc.
export async function POST(req: NextRequest) {
  try {
    // Get the session to check if user is authenticated (for admin-only emails)
    const session = await getServerSession(authOptions)
    const body = await req.json()
    
    const { 
      type, 
      ticketDetails,
      requiresAuth = false, // Whether this email type requires authentication
      to 
    } = body

    // Check if this is an admin-only email and if the user is authenticated
    if (requiresAuth && !session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required for this email type' 
      }, { status: 401 })
    }

    // Basic validation
    if (!type || !to) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: type, to' 
      }, { status: 400 })
    }

    // Handle different email types
    let emailResult
    
    switch (type) {
      case 'TICKET_CONFIRMATION':
        if (!ticketDetails) {
          return NextResponse.json({ 
            success: false, 
            message: 'Missing ticket details for ticket confirmation email' 
          }, { status: 400 })
        }
        
        const ticketEmail = generateTicketPurchaseEmail(ticketDetails as TicketDetails)
        emailResult = await sendEmail({
          to,
          subject: ticketEmail.subject,
          html: ticketEmail.html,
          text: ticketEmail.text
        })
        break

      case 'PAYMENT_CONFIRMATION':
        if (!ticketDetails) {
          return NextResponse.json({ 
            success: false, 
            message: 'Missing ticket details for payment confirmation email' 
          }, { status: 400 })
        }
        
        const paymentEmail = generatePaymentConfirmationEmail(ticketDetails as TicketDetails)
        emailResult = await sendEmail({
          to,
          subject: paymentEmail.subject,
          html: paymentEmail.html,
          text: paymentEmail.text
        })
        break

      case 'TEST_EMAIL':
        // Simple test email that can be used to verify the email service is working
        emailResult = await sendEmail({
          to,
          subject: 'Test Email from IEEE UJ Raffle System',
          html: '<h1>Test Email</h1><p>This is a test email from your IEEE UJ Raffle System. If you received this, your email configuration is working correctly.</p>',
          text: 'This is a test email from your IEEE UJ Raffle System. If you received this, your email configuration is working correctly.'
        })
        break

      default:
        return NextResponse.json({ 
          success: false, 
          message: `Unknown email type: ${type}` 
        }, { status: 400 })
    }

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully'
      }, { status: 200 })
    } else {
      console.error('Error sending email:', emailResult.error)
      return NextResponse.json({
        success: false,
        message: emailResult.message || 'Failed to send email'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in email sending endpoint:', error)
    return NextResponse.json({
      success: false,
      message: 'Server error while sending email'
    }, { status: 500 })
  }
}
