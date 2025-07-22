import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Brevo API client for fetching email logs
import * as Brevo from '@getbrevo/brevo';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Initialize Brevo API client for transactional emails
    const apiInstance = new Brevo.TransactionalEmailsApi();
    
    // Set the API key from environment variable
    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json(
        { error: 'Brevo API key not configured' },
        { status: 500 }
      );
    }
    
    // Cast to any to access protected property in TypeScript
    (apiInstance as any).authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
    
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Fetch email logs from Brevo
    const data = await apiInstance.getEmailLogs({
      limit,
      offset,
      // You can add more filters here if needed
      // date: new Date().toISOString().split('T')[0], // Today's date
      // email: 'specific@email.com', // Filter by recipient
    });
    
    // Transform the response to a more usable format
    const logs = data.logs?.map(log => ({
      messageId: log.messageId,
      to: log.email,
      subject: log.subject,
      status: log.event,
      sentAt: log.date,
      openedAt: log.ts_event || undefined,
      clickedAt: log.ts_event || undefined
    })) || [];
    
    return NextResponse.json({
      logs,
      count: data.count || 0,
      total: data.total || 0
    });
  } catch (error: any) {
    console.error('Error fetching email logs:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch email logs',
        details: error.response?.body || {} 
      },
      { status: 500 }
    );
  }
}
