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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple password protection
  const password = req.headers.authorization?.replace('Bearer ', '');
  const dashboardPassword = process.env.DASHBOARD_PASSWORD;

  if (dashboardPassword && password !== dashboardPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!kvUrl || !kvToken) {
      return res.status(200).json({
        visitors: [],
        stats: { total: 0, today: 0, uniqueCompanies: 0 },
      });
    }

    // Get query params
    const { limit = '50', offset = '0' } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;

    // Get recent visitor IDs
    const listRes = await fetch(
      `${kvUrl}/lrange/recent_visitors/${offsetNum}/${offsetNum + limitNum - 1}`,
      {
        headers: {
          Authorization: `Bearer ${kvToken}`,
        },
      }
    );

    if (!listRes.ok) {
      throw new Error('Failed to fetch visitor list');
    }

    const listData = await listRes.json();
    const visitorIds: string[] = listData.result || [];

    // Fetch visitor details
    const visitors: VisitorData[] = [];
    for (const id of visitorIds) {
      try {
        const visitorRes = await fetch(`${kvUrl}/get/${id}`, {
          headers: {
            Authorization: `Bearer ${kvToken}`,
          },
        });
        if (visitorRes.ok) {
          const data = await visitorRes.json();
          if (data.result) {
            visitors.push(typeof data.result === 'string' ? JSON.parse(data.result) : data.result);
          }
        }
      } catch {
        // Skip invalid entries
      }
    }

    // Get today's count
    const today = new Date().toISOString().split('T')[0];
    const todayCountRes = await fetch(`${kvUrl}/get/visits:${today}`, {
      headers: {
        Authorization: `Bearer ${kvToken}`,
      },
    });
    const todayCountData = await todayCountRes.json();
    const todayCount = parseInt(todayCountData.result) || 0;

    // Calculate stats
    const uniqueCompanies = new Set(visitors.filter((v) => v.company).map((v) => v.company)).size;

    // Group by company
    const companyCounts: Record<string, number> = {};
    visitors.forEach((v) => {
      if (v.company) {
        companyCounts[v.company] = (companyCounts[v.company] || 0) + 1;
      }
    });

    // Group by country
    const countryCounts: Record<string, number> = {};
    visitors.forEach((v) => {
      const country = v.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    // Group by referrer domain
    const referrerCounts: Record<string, number> = {};
    visitors.forEach((v) => {
      let domain = 'Direct';
      if (v.referrer) {
        try {
          domain = new URL(v.referrer).hostname;
        } catch {
          domain = v.referrer.substring(0, 30);
        }
      }
      referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
    });

    return res.status(200).json({
      visitors,
      stats: {
        total: visitors.length + offsetNum,
        today: todayCount,
        uniqueCompanies,
        companyCounts,
        countryCounts,
        referrerCounts,
      },
    });
  } catch (error) {
    console.error('Analytics visitors error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
