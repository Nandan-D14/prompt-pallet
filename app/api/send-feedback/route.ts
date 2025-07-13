import { NextRequest, NextResponse } from 'next/server';
import { sendFeedback } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send feedback email
    const success = await sendFeedback({
      name: body.name,
      email: body.email,
      type: body.type || 'feedback',
      subject: body.subject,
      message: body.message,
      priority: body.priority || 'medium'
    });

    if (success) {
      return NextResponse.json({ success: true, message: 'Feedback sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send feedback' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Send feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
