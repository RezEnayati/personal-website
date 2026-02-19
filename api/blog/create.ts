import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const password = req.headers.authorization?.replace('Bearer ', '');
  const dashboardPassword = process.env.DASHBOARD_PASSWORD;

  if (dashboardPassword && password !== dashboardPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPO;

  if (!githubToken || !githubRepo) {
    return res.status(500).json({ error: 'GitHub integration not configured' });
  }

  const { title, slug, description, tags, readingTime, content } = req.body;

  if (!title || !slug || !description || !content) {
    return res.status(400).json({ error: 'Missing required fields: title, slug, description, content' });
  }

  // Validate slug format
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens.' });
  }

  const date = new Date().toISOString().split('T')[0];
  const tagsArray = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
      ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: "${date}"`,
    `description: "${description.replace(/"/g, '\\"')}"`,
    `tags: [${tagsArray.map((t: string) => `"${t}"`).join(', ')}]`,
    `readingTime: "${readingTime || `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read`}"`,
    '---',
  ].join('\n');

  const fileContent = `${frontmatter}\n\n${content}\n`;
  const filePath = `content/blog/${slug}.mdx`;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${githubRepo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add blog post: ${title}`,
          content: Buffer.from(fileContent).toString('base64'),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 422) {
        return res.status(409).json({ error: `A post with slug "${slug}" already exists` });
      }
      return res.status(response.status).json({
        error: errorData.message || 'GitHub API error',
      });
    }

    return res.status(201).json({
      success: true,
      url: `/blog/${slug}`,
    });
  } catch (error) {
    console.error('Blog create error:', error);
    return res.status(500).json({ error: 'Failed to create blog post' });
  }
}
