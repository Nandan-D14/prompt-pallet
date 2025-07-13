import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

const ADMIN_EMAIL = 'mr.myth1482005@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send contact form email to admin
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
        <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 28px;">📧 New Contact Form Submission</h1>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #495057; margin-bottom: 15px; font-size: 20px;">Contact Information</h2>
            <p style="margin: 8px 0; color: #666;"><strong>Name:</strong> ${body.name}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Email:</strong> ${body.email}</p>
          </div>

          <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1565c0; margin-bottom: 15px; font-size: 20px;">Message</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; color: #666; line-height: 1.6;">
              ${body.message.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">Received on ${new Date().toLocaleString()}</p>
            <p style="color: #666; font-size: 14px;">Reply to: <a href="mailto:${body.email}" style="color: #667eea;">${body.email}</a></p>
          </div>
        </div>
      </div>
    `;

    const success = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `📧 New Contact Form: ${body.name}`,
      html
    });

    if (success) {
      return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
