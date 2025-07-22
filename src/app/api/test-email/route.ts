import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/brevo-email';

export async function POST(request: NextRequest) {
  try {
    // Get email from request body
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Send test email
    const result = await sendTestEmail(email);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    );
  }
}
