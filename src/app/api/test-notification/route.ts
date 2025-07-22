import { NextRequest, NextResponse } from 'next/server';
import { sendNotification, getTemplate, sendPaymentReminder, sendTicketConfirmation } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const { templateId, recipientEmail, recipientName, variables } = await request.json();
    
    // Validate required fields
    if (!templateId || !recipientEmail) {
      return NextResponse.json(
        { error: 'Template ID and recipient email are required' },
        { status: 400 }
      );
    }
    
    // Check if template exists
    const template = getTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { error: `Template "${templateId}" not found` },
        { status: 404 }
      );
    }
    
    // Prepare recipient data with ticketNumber
    const recipient = {
      name: recipientName || recipientEmail.split('@')[0],
      email: recipientEmail,
      ticketNumber: variables?.ticketNumber || 'TEST-123'
    };
    
    // Prepare common variables with defaults
    const commonVariables = {
      ticketNumber: variables?.ticketNumber || 'TEST-123',
      purchaseDate: variables?.purchaseDate || new Date().toLocaleDateString(),
      paymentMethod: variables?.paymentMethod || 'Test Payment',
      sellerName: variables?.sellerName || 'Test Seller',
      sellerEmail: variables?.sellerEmail || 'seller@example.com',
      ticketPrice: variables?.ticketPrice || '50',
      drawDate: variables?.drawDate || 'TBA',
      daysSincePurchase: variables?.daysSincePurchase || '3',
      prizeName: variables?.prizeName || 'Test Prize',
      totalTickets: variables?.totalTickets || '100',
      contactEmail: variables?.contactEmail || 'contact@ieee-uj.org',
      updateTitle: variables?.updateTitle || 'Test Update',
      updateContent: variables?.updateContent || 'This is a test update message.',
      date: variables?.date || new Date().toLocaleDateString(),
      ticketsSoldToday: variables?.ticketsSoldToday || '10',
      revenueToday: variables?.revenueToday || '500',
      verifiedToday: variables?.verifiedToday || '8',
      pendingToday: variables?.pendingToday || '2',
      totalRevenue: variables?.totalRevenue || '1500',
      sellerRank: variables?.sellerRank || '1',
      totalSellers: variables?.totalSellers || '5',
      ...variables // Override with any user-provided variables
    };
    
    // Log the variables being sent to help with debugging
    console.log('Sending notification with variables:', commonVariables);
    
    // Use specific notification functions for better variable handling
    let result;
    
    if (templateId === 'payment_reminder') {
      // Use the dedicated payment reminder function
      const success = await sendPaymentReminder(
        recipient.name,
        recipientEmail,
        commonVariables.ticketNumber,
        commonVariables.sellerName,
        commonVariables.sellerEmail,
        parseInt(commonVariables.daysSincePurchase) || 3,
        parseInt(commonVariables.ticketPrice) || 50
      );
      
      result = {
        success,
        emailResults: [success],
        errors: success ? [] : ['Failed to send payment reminder']
      };
    } else if (templateId === 'ticket_confirmation') {
      // Use the dedicated ticket confirmation function
      const success = await sendTicketConfirmation(
        recipient.name,
        recipientEmail,
        commonVariables.ticketNumber,
        commonVariables.paymentMethod,
        commonVariables.sellerName,
        commonVariables.sellerEmail,
        parseInt(commonVariables.ticketPrice) || 50
      );
      
      result = {
        success,
        emailResults: [success],
        errors: success ? [] : ['Failed to send ticket confirmation']
      };
    } else {
      // For other templates, use the generic sendNotification
      result = await sendNotification({
        template: templateId,
        recipients: [recipient],
        variables: commonVariables,
        priority: 'high'
      });
    }
    
    return NextResponse.json({
      success: result.success,
      emailResults: result.emailResults,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error in test-notification API:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: (error as Error).message },
      { status: 500 }
    );
  }
}
