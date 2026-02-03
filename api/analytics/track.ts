import type { VercelRequest, VercelResponse } from '@vercel/node';

interface VisitorData {
  ip: string;
  userAgent: string;
  referrer: string;
  page: string;
  timestamp: string;
  country?: string;
  city?: string;
  org?: string;
  company?: string;
  companyDomain?: string;
  companyConfidence?: number;
}

// Detect company from IP using multiple methods
async function detectCompany(ip: string): Promise<{
  company?: string;
  domain?: string;
  confidence: number;
  org?: string;
  country?: string;
  city?: string;
}> {
  const result: {
    company?: string;
    domain?: string;
    confidence: number;
    org?: string;
    country?: string;
    city?: string;
  } = { confidence: 0 };

  try {
    // 1. IPinfo.io for basic geolocation and org data
    const ipinfoToken = process.env.IPINFO_TOKEN;
    if (ipinfoToken) {
      const ipinfoRes = await fetch(`https://ipinfo.io/${ip}?token=${ipinfoToken}`);
      if (ipinfoRes.ok) {
        const data = await ipinfoRes.json();
        result.country = data.country;
        result.city = data.city;
        result.org = data.org;

        // Extract company name from org if it looks like a company
        if (data.org && !data.org.includes('ISP') && !data.org.includes('Telecom')) {
          // Remove ASN prefix like "AS12345 "
          const orgName = data.org.replace(/^AS\d+\s+/, '');
          result.company = orgName;
          result.confidence = 0.5;
        }
      }
    }

    // 2. Clearbit Reveal for enterprise company detection (if available)
    const clearbitKey = process.env.CLEARBIT_KEY;
    if (clearbitKey) {
      try {
        const clearbitRes = await fetch(`https://reveal.clearbit.com/v1/companies/find?ip=${ip}`, {
          headers: {
            Authorization: `Bearer ${clearbitKey}`,
          },
        });
        if (clearbitRes.ok) {
          const data = await clearbitRes.json();
          if (data.company) {
            result.company = data.company.name;
            result.domain = data.company.domain;
            result.confidence = 0.9;
          }
        }
      } catch {
        // Clearbit failed, continue with other methods
      }
    }
  } catch (error) {
    console.error('Company detection error:', error);
  }

  return result;
}

// Send email notification for notable visitors
async function sendNotification(visitor: VisitorData): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  if (!resendKey || !notifyEmail) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Analytics <analytics@rezaenayati.co>',
        to: notifyEmail,
        subject: `🔔 Portfolio Visitor: ${visitor.company || 'Notable Visit'}`,
        html: `
          <h2>New Portfolio Visitor</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${visitor.company || 'Unknown'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Location</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${visitor.city || ''}, ${visitor.country || 'Unknown'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Referrer</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${visitor.referrer || 'Direct'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Page</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${visitor.page}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${visitor.timestamp}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Confidence</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${Math.round((visitor.companyConfidence || 0) * 100)}%</td></tr>
          </table>
        `,
      }),
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get visitor IP
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // Get request data
    const { page, referrer } = req.body as { page?: string; referrer?: string };

    // Detect company
    const companyInfo = await detectCompany(ip);

    // Build visitor data
    const visitor: VisitorData = {
      ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      referrer: referrer || req.headers.referer || '',
      page: page || '/',
      timestamp: new Date().toISOString(),
      country: companyInfo.country,
      city: companyInfo.city,
      org: companyInfo.org,
      company: companyInfo.company,
      companyDomain: companyInfo.domain,
      companyConfidence: companyInfo.confidence,
    };

    // Store in Upstash Redis (supports both old KV and new Upstash env var names)
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      const headers = {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json',
      };

      // Store visitor data
      const visitorId = `visitor:${Date.now()}:${ip.replace(/\./g, '-')}`;
      await fetch(`${kvUrl}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(['SET', visitorId, JSON.stringify(visitor)]),
      });

      // Add to recent visitors list (keep last 1000)
      await fetch(`${kvUrl}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(['LPUSH', 'recent_visitors', visitorId]),
      });

      // Trim to keep only recent
      await fetch(`${kvUrl}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(['LTRIM', 'recent_visitors', '0', '999']),
      });

      // Increment daily counter
      const today = new Date().toISOString().split('T')[0];
      await fetch(`${kvUrl}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(['INCR', `visits:${today}`]),
      });
    }

    // Send notification for notable visitors
    await sendNotification(visitor);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
