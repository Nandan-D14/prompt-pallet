// Email service - optional feature
let transporter: any = null;

// Initialize email transporter only if email credentials are provided
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
      },
    });
  }
} catch (error) {
  console.warn('Email service not available:', error);
}

const ADMIN_EMAIL = 'mr.myth1482005@gmail.com';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface ImageRequestData {
  name: string;
  email: string;
  description: string;
  details?: string;
  imageType?: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface FeedbackData {
  [x: string]: string | number | readonly string[] | undefined;
  name: string;
  email: string;
  type: 'feedback' | 'bug' | 'feature';
  subject: string;
  message: string;
}

export interface SubscriberData {
  email: string;
  photoTitle: string;
  photoDescription: string;
  photoUrl: string;
  tags: string[];
}

// Send generic email
export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    if (!transporter) {
      console.warn('Email service not configured. Skipping email send.');
      return false;
    }
    
    await transporter.sendMail({
      from: data.from || process.env.EMAIL_USER,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// Send image request to admin
export async function sendImageRequest(data: ImageRequestData): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
      <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 28px;">New Image Request</h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #495057; margin-bottom: 15px; font-size: 20px;">Contact Information</h2>
          <p style="margin: 8px 0; color: #666;"><strong>Name:</strong> ${data.name}</p>
          <p style="margin: 8px 0; color: #666;"><strong>Email:</strong> ${data.email}</p>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #1565c0; margin-bottom: 15px; font-size: 20px;">Request Details</h2>
          <p style="margin: 8px 0; color: #666;"><strong>Description:</strong> ${data.description}</p>
          ${data.details ? `<p style="margin: 8px 0; color: #666;"><strong>Additional Details:</strong> ${data.details}</p>` : ''}
          ${data.imageType ? `<p style="margin: 8px 0; color: #666;"><strong>Image Type:</strong> ${data.imageType}</p>` : ''}
          ${data.urgency ? `<p style="margin: 8px 0; color: #666;"><strong>Urgency:</strong> <span style="background: ${data.urgency === 'high' ? '#ff5722' : data.urgency === 'medium' ? '#ff9800' : '#4caf50'}; color: white; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; font-size: 12px;">${data.urgency}</span></p>` : ''}
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">Received on ${new Date().toLocaleString()}</p>
          <p style="color: #666; font-size: 14px;">Reply to: <a href="mailto:${data.email}" style="color: #667eea;">${data.email}</a></p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🎨 New Image Request from ${data.name}`,
    html,
  });
}

// Send feedback/bug report to admin
export async function sendFeedback(data: FeedbackData): Promise<boolean> {
  const typeColors = {
    feedback: '#4caf50',
    bug: '#f44336',
    feature: '#2196f3'
  };

  const typeIcons = {
    feedback: '💬',
    bug: '🐛',
    feature: '✨'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
      <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 28px;">
          ${typeIcons[data.type]} ${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Report
        </h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #495057; margin-bottom: 15px; font-size: 20px;">Contact Information</h2>
          <p style="margin: 8px 0; color: #666;"><strong>Name:</strong> ${data.name}</p>
          <p style="margin: 8px 0; color: #666;"><strong>Email:</strong> ${data.email}</p>
        </div>

        <div style="background: ${typeColors[data.type]}15; padding: 20px; border-radius: 10px; border-left: 4px solid ${typeColors[data.type]}; margin-bottom: 20px;">
          <h2 style="color: ${typeColors[data.type]}; margin-bottom: 15px; font-size: 20px;">${data.subject}</h2>
          <div style="background: white; padding: 15px; border-radius: 8px; color: #666; line-height: 1.6;">
            ${data.message.replace(/\n/g, '<br>')}
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">Received on ${new Date().toLocaleString()}</p>
          <p style="color: #666; font-size: 14px;">Reply to: <a href="mailto:${data.email}" style="color: #667eea;">${data.email}</a></p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: ADMIN_EMAIL,
    subject: `${typeIcons[data.type]} ${data.type.toUpperCase()}: ${data.subject}`,
    html,
  });
}

// Send new photo notification to subscribers
export async function sendNewPhotoNotification(subscribers: string[], photoData: SubscriberData): Promise<number> {
  if (!transporter) {
    console.warn('Email service not configured. Skipping notification emails.');
    return 0;
  }
  
  let successCount = 0;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
      <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 28px;">📸 New Photo Added!</h1>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${photoData.photoUrl}" alt="${photoData.photoTitle}" style="max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);" />
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #495057; margin-bottom: 15px; font-size: 24px;">${photoData.photoTitle}</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">${photoData.photoDescription}</p>
          
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px;">
            ${photoData.tags.map(tag => `
              <span style="background: #667eea; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                ${tag}
              </span>
            `).join('')}
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gallery" 
             style="display: inline-block; background: linear-gradient(45deg, #667eea, #764ba2); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            View in Gallery ✨
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            You're receiving this because you subscribed to photo updates. 
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe" style="color: #667eea;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </div>
  `;

  for (const email of subscribers) {
    try {
      const success = await sendEmail({
        to: email,
        subject: `📸 New Photo: ${photoData.photoTitle}`,
        html,
      });
      if (success) successCount++;
    } catch (error) {
      console.error(`Failed to send notification to ${email}:`, error);
    }
  }

  return successCount;
}

// Send confirmation email to user after image request
export async function sendImageRequestConfirmation(data: ImageRequestData): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
      <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 28px;">🎨 Request Received!</h1>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; border-left: 4px solid #4caf50; margin-bottom: 20px;">
          <p style="color: #333; margin-bottom: 15px;">Hi ${data.name},</p>
          <p style="color: #666; line-height: 1.6;">
            Thank you for your image request! We've received your request and will review it shortly. 
            Here's a summary of what you requested:
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #495057; margin-bottom: 15px; font-size: 18px;">Your Request Details</h2>
          <p style="margin: 8px 0; color: #666;"><strong>Description:</strong> ${data.description}</p>
          ${data.details ? `<p style="margin: 8px 0; color: #666;"><strong>Additional Details:</strong> ${data.details}</p>` : ''}
          ${data.imageType ? `<p style="margin: 8px 0; color: #666;"><strong>Image Type:</strong> ${data.imageType}</p>` : ''}
        </div>

        <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
          <p style="color: #856404; margin: 0; line-height: 1.6;">
            <strong>What's next?</strong><br>
            We'll review your request and get back to you within 1-3 business days. 
            If we need any clarification, we'll reach out to you at ${data.email}.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gallery" 
             style="display: inline-block; background: linear-gradient(45deg, #667eea, #764ba2); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            Browse Our Gallery 🖼️
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            If you have any questions, feel free to reach out to us at 
            <a href="mailto:${ADMIN_EMAIL}" style="color: #667eea;">${ADMIN_EMAIL}</a>
          </p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: data.email,
    subject: '🎨 Image Request Received - We\'ll Be In Touch!',
    html,
  });
}
