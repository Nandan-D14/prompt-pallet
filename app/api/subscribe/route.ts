import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { sendEmail } from '@/lib/email';

const ADMIN_EMAIL = 'mr.myth1482005@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate email
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase().trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await db
      .collection('subscribers')
      .where('email', '==', email)
      .get();

    if (!existingSubscriber.empty) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 400 }
      );
    }

    // Add subscriber to database
    await db.collection('subscribers').add({
      email,
      subscribedAt: new Date(),
      status: 'active'
    });

    // Send welcome email to subscriber
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
        <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 28px;">🎉 Welcome to Prompt Palette!</h1>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; border-left: 4px solid #4caf50; margin-bottom: 20px;">
            <p style="color: #333; margin-bottom: 15px;">Hi there!</p>
            <p style="color: #666; line-height: 1.6;">
              Thank you for subscribing to our newsletter! You'll now receive updates about:
            </p>
            <ul style="color: #666; line-height: 1.6; margin-left: 20px;">
              <li>New AI-generated images and prompts</li>
              <li>Featured gallery updates</li>
              <li>Platform updates and new features</li>
              <li>Tips and tricks for better AI prompts</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gallery" 
               style="display: inline-block; background: linear-gradient(45deg, #667eea, #764ba2); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Explore Our Gallery ✨
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              You can unsubscribe at any time by clicking 
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #667eea;">here</a>
            </p>
          </div>
        </div>
      </div>
    `;

    // Send notification to admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
        <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 28px;">📧 New Newsletter Subscription</h1>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #495057; margin-bottom: 15px; font-size: 20px;">Subscriber Details</h2>
            <p style="margin: 8px 0; color: #666;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0; color: #666;"><strong>Subscribed At:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;

    // Send emails
    await Promise.all([
      sendEmail({
        to: email,
        subject: '🎉 Welcome to Prompt Palette Newsletter!',
        html: welcomeHtml
      }),
      sendEmail({
        to: ADMIN_EMAIL,
        subject: '📧 New Newsletter Subscription',
        html: adminHtml
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed! Check your email for confirmation.' 
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
