import { NextRequest, NextResponse } from 'next/server';
import { sendNotification, getTemplate } from '@/lib/notifications';

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
    
    // Send notification using the template
    const result = await sendNotification({
      template: templateId,
      recipients: [{
        name: recipientName || recipientEmail.split('@')[0],
        email: recipientEmail,
        ticketNumber: variables?.ticketNumber || 'TEST-123'
      }],
      variables: {
        ...variables,
        // Default values for common variables
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
      },
      priority: 'high'
    });
    
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
