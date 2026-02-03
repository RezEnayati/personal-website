import type { VercelRequest, VercelResponse } from '@vercel/node';

interface CompanyInfo {
  name?: string;
  domain?: string;
  confidence: number;
  source: string;
  org?: string;
  country?: string;
  city?: string;
  region?: string;
}

// Known tech company IP ranges and domains
const knownCompanyPatterns: Record<string, RegExp> = {
  Google: /google|googleapis/i,
  Microsoft: /microsoft|azure|msn/i,
  Amazon: /amazon|aws/i,
  Apple: /apple/i,
  Meta: /facebook|meta|instagram/i,
  Netflix: /netflix/i,
  Salesforce: /salesforce/i,
  LinkedIn: /linkedin/i,
  Twitter: /twitter|x\.com/i,
  Stripe: /stripe/i,
  OpenAI: /openai/i,
  Anthropic: /anthropic/i,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ip } = req.body as { ip?: string };

    if (!ip) {
      return res.status(400).json({ error: 'IP address required' });
    }

    const result: CompanyInfo = { confidence: 0, source: 'none' };

    // 1. IPinfo.io lookup
    const ipinfoToken = process.env.IPINFO_TOKEN;
    if (ipinfoToken) {
      try {
        const ipinfoRes = await fetch(`https://ipinfo.io/${ip}?token=${ipinfoToken}`);
        if (ipinfoRes.ok) {
          const data = await ipinfoRes.json();
          result.country = data.country;
          result.city = data.city;
          result.region = data.region;
          result.org = data.org;

          // Check if org matches known companies
          if (data.org) {
            for (const [company, pattern] of Object.entries(knownCompanyPatterns)) {
              if (pattern.test(data.org)) {
                result.name = company;
                result.confidence = 0.7;
                result.source = 'ipinfo-pattern';
                break;
              }
            }

            // If no pattern match, use org name (stripped of ASN)
            if (!result.name && !data.org.includes('ISP') && !data.org.includes('Telecom')) {
              result.name = data.org.replace(/^AS\d+\s+/, '');
              result.confidence = 0.4;
              result.source = 'ipinfo-org';
            }
          }
        }
      } catch (error) {
        console.error('IPinfo error:', error);
      }
    }

    // 2. Clearbit Reveal (higher confidence)
    const clearbitKey = process.env.CLEARBIT_KEY;
    if (clearbitKey) {
      try {
        const clearbitRes = await fetch(
          `https://reveal.clearbit.com/v1/companies/find?ip=${ip}`,
          {
            headers: {
              Authorization: `Bearer ${clearbitKey}`,
            },
          }
        );

        if (clearbitRes.ok) {
          const data = await clearbitRes.json();
          if (data.company) {
            result.name = data.company.name;
            result.domain = data.company.domain;
            result.confidence = 0.95;
            result.source = 'clearbit';
          }
        }
      } catch (error) {
        console.error('Clearbit error:', error);
      }
    }

    // 3. Reverse DNS as fallback
    if (!result.name || result.confidence < 0.6) {
      try {
        // Using a simple DNS lookup via a public service
        const dnsRes = await fetch(
          `https://dns.google/resolve?name=${ip.split('.').reverse().join('.')}.in-addr.arpa&type=PTR`
        );
        if (dnsRes.ok) {
          const data = await dnsRes.json();
          if (data.Answer && data.Answer[0]?.data) {
            const hostname = data.Answer[0].data;

            // Check hostname against known patterns
            for (const [company, pattern] of Object.entries(knownCompanyPatterns)) {
              if (pattern.test(hostname)) {
                if (!result.name || result.confidence < 0.6) {
                  result.name = company;
                  result.confidence = Math.max(result.confidence, 0.6);
                  result.source = 'rdns';
                }
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error('DNS lookup error:', error);
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Company detection error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
