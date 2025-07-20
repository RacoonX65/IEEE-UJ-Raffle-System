import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  sendNotification, 
  NotificationData, 
  NOTIFICATION_TEMPLATES,
  sendTicketConfirmation,
  sendPaymentReminder
} from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    console.log('Notification request:', { type, data })

    switch (type) {
      case 'ticket_confirmation':
        const {
          buyerName,
          buyerEmail,
          ticketNumber,
          paymentMethod,
          sellerName,
          sellerEmail,
          ticketPrice
        } = data

        const confirmationResult = await sendTicketConfirmation(
          buyerName,
          buyerEmail,
          ticketNumber,
          paymentMethod,
          sellerName,
          sellerEmail || ''
        )

        return NextResponse.json({
          success: confirmationResult,
          message: confirmationResult 
            ? 'Ticket confirmation sent successfully'
            : 'Failed to send ticket confirmation'
        })

      case 'payment_reminder':
        const {
          buyerName: reminderBuyerName,
          buyerEmail: reminderBuyerEmail,
          ticketNumber: reminderTicketNumber,
          sellerName: reminderSellerName,
          sellerEmail: reminderSellerEmail,
          daysSincePurchase,
          ticketPrice: reminderTicketPrice
        } = data

        const reminderResult = await sendPaymentReminder(
          reminderBuyerName,
          reminderBuyerEmail,
          reminderTicketNumber,
          reminderSellerName,
          reminderSellerEmail || '',
          daysSincePurchase
        )

        return NextResponse.json({
          success: reminderResult,
          message: reminderResult 
            ? 'Payment reminder sent successfully'
            : 'Failed to send payment reminder'
        })

      case 'custom':
        const notificationData: NotificationData = data
        const result = await sendNotification(notificationData)

        return NextResponse.json({
          success: result.success,
          emailResults: result.emailResults,
          errors: result.errors,
          message: result.success 
            ? 'Email notifications sent successfully'
            : `Failed to send some notifications: ${result.errors.join(', ')}`
        })

      case 'bulk':
        const { template, recipients, variables } = data
        const bulkData: NotificationData = {
          template,
          recipients,
          variables,
          priority: 'medium'
        }

        const bulkResult = await sendNotification(bulkData)

        return NextResponse.json({
          success: bulkResult.success,
          emailResults: bulkResult.emailResults,
          errors: bulkResult.errors,
          totalSent: bulkResult.emailResults.length,
          message: bulkResult.success 
            ? `Bulk email notifications sent to ${recipients.length} recipients`
            : `Bulk notification partially failed: ${bulkResult.errors.join(', ')}`
        })

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return available notification templates
    return NextResponse.json({
      templates: NOTIFICATION_TEMPLATES.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        variables: template.variables
      }))
    })
  } catch (error) {
    console.error('Notification templates API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
