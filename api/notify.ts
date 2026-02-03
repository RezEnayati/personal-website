import type { VercelRequest, VercelResponse } from '@vercel/node';

interface NotificationData {
  type: 'visitor' | 'message' | 'alert';
  subject: string;
  body: string;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, string>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require secret for internal calls
  const secret = req.headers['x-notify-secret'];
  if (secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { type, subject, body, priority = 'normal', metadata } = req.body as NotificationData;

    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body required' });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    if (!resendKey || !notifyEmail) {
      return res.status(200).json({ success: false, reason: 'Email not configured' });
    }

    // Build email
    const priorityEmoji = {
      low: '',
      normal: '📧',
      high: '🚨',
    };

    const emailSubject = `${priorityEmoji[priority]} [${type}] ${subject}`;

    // Build metadata table if provided
    let metadataHtml = '';
    if (metadata && Object.keys(metadata).length > 0) {
      metadataHtml = `
        <h3>Details</h3>
        <table style="border-collapse: collapse; width: 100%;">
          ${Object.entries(metadata)
            .map(
              ([key, value]) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;"><strong>${key}</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${value}</td>
            </tr>
          `
            )
            .join('')}
        </table>
      `;
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Notifications <notifications@rezaenayati.co>',
        to: notifyEmail,
        subject: emailSubject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #06b6d4, #a855f7); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
                h1 { margin: 0; font-size: 20px; }
                h3 { color: #666; margin-top: 20px; }
                table { margin-top: 10px; }
                .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${subject}</h1>
                </div>
                <div class="content">
                  <p>${body.replace(/\n/g, '<br>')}</p>
                  ${metadataHtml}
                </div>
                <div class="footer">
                  Sent from rezaenayati.co portfolio analytics
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errorData = await emailRes.json();
      console.error('Resend error:', errorData);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
