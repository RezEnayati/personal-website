import { defineConfig, type Plugin, loadEnv } from 'vite'
import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'

function mdxPlugin(): Plugin {
  const plugin = mdx({
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
    rehypePlugins: [
      [rehypePrettyCode, { theme: 'github-light' }],
    ],
  }) as Plugin

  return {
    ...plugin,
    name: 'mdx',
    enforce: 'pre',
    transform(code, id, options) {
      if (!/\.mdx$/.test(id)) return
      return (plugin.transform as Function).call(this, code, id, options)
    },
  }
}

// Dev-only plugin that proxies /api routes to the Vercel serverless functions
function devApiPlugin(): Plugin {
  let env: Record<string, string> = {}

  return {
    name: 'dev-api',
    apply: 'serve',
    configResolved(config) {
      env = loadEnv('development', config.root, '')
    },
    configureServer(server) {
      const kvUrl = env.KV_REST_API_URL
      const kvToken = env.KV_REST_API_TOKEN

      // POST /api/analytics/track — no-op in dev, just return success
      server.middlewares.use('/api/analytics/track', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: true, dev: true }))
      })

      // GET /api/analytics/visitors — proxy to Upstash directly
      server.middlewares.use('/api/analytics/visitors', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const auth = req.headers.authorization?.replace('Bearer ', '')
        if (env.DASHBOARD_PASSWORD && auth !== env.DASHBOARD_PASSWORD) {
          res.statusCode = 401
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }

        if (!kvUrl || !kvToken) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            visitors: [],
            stats: { total: 0, today: 0, uniqueCompanies: 0 },
          }))
          return
        }

        try {
          const headers = { Authorization: `Bearer ${kvToken}` }

          // Get recent visitor IDs
          const listRes = await fetch(`${kvUrl}/lrange/recent_visitors/0/49`, { headers })
          const listData = await listRes.json() as { result?: string[] }
          const visitorIds: string[] = listData.result || []

          // Fetch visitor details
          const visitors: Record<string, unknown>[] = []
          for (const id of visitorIds) {
            try {
              const vRes = await fetch(`${kvUrl}/get/${id}`, { headers })
              if (vRes.ok) {
                const data = await vRes.json() as { result?: string }
                if (data.result) {
                  visitors.push(typeof data.result === 'string' ? JSON.parse(data.result) : data.result)
                }
              }
            } catch { /* skip */ }
          }

          // Today count
          const today = new Date().toISOString().split('T')[0]
          const todayRes = await fetch(`${kvUrl}/get/visits:${today}`, { headers })
          const todayData = await todayRes.json() as { result?: string }
          const todayCount = parseInt(todayData.result || '0') || 0

          // Stats
          const companyCounts: Record<string, number> = {}
          const countryCounts: Record<string, number> = {}
          visitors.forEach((v: any) => {
            if (v.company) companyCounts[v.company] = (companyCounts[v.company] || 0) + 1
            const country = v.country || 'Unknown'
            countryCounts[country] = (countryCounts[country] || 0) + 1
          })

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            visitors,
            stats: {
              total: visitors.length,
              today: todayCount,
              uniqueCompanies: new Set(visitors.map((v: any) => v.company).filter(Boolean)).size,
              companyCounts,
              countryCounts,
            },
          }))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Failed to fetch analytics' }))
        }
      })

      // POST /api/blog/create — commit MDX file to GitHub
      server.middlewares.use('/api/blog/create', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const auth = req.headers.authorization?.replace('Bearer ', '')
        if (env.DASHBOARD_PASSWORD && auth !== env.DASHBOARD_PASSWORD) {
          res.statusCode = 401
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }

        const githubToken = env.GITHUB_TOKEN
        const githubRepo = env.GITHUB_REPO

        if (!githubToken || !githubRepo) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'GitHub integration not configured. Set GITHUB_TOKEN and GITHUB_REPO in .env' }))
          return
        }

        // Read request body
        const body = await new Promise<string>((resolve) => {
          let data = ''
          req.on('data', (chunk: Buffer) => { data += chunk.toString() })
          req.on('end', () => resolve(data))
        })

        let parsed: Record<string, unknown>
        try {
          parsed = JSON.parse(body)
        } catch {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Invalid JSON body' }))
          return
        }

        const { title, slug, description, tags, readingTime, content } = parsed as {
          title?: string; slug?: string; description?: string;
          tags?: string; readingTime?: string; content?: string
        }

        if (!title || !slug || !description || !content) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Missing required fields: title, slug, description, content' }))
          return
        }

        const date = new Date().toISOString().split('T')[0]
        const tagsArray = typeof tags === 'string'
          ? tags.split(',').map(t => t.trim()).filter(Boolean)
          : Array.isArray(tags) ? tags : []
        const wordCount = content.split(/\s+/).length
        const estimatedTime = readingTime || `${Math.max(1, Math.ceil(wordCount / 200))} min read`

        const frontmatter = [
          '---',
          `title: "${title.replace(/"/g, '\\"')}"`,
          `date: "${date}"`,
          `description: "${description.replace(/"/g, '\\"')}"`,
          `tags: [${tagsArray.map(t => `"${t}"`).join(', ')}]`,
          `readingTime: "${estimatedTime}"`,
          '---',
        ].join('\n')

        const fileContent = `${frontmatter}\n\n${content}\n`
        const filePath = `content/blog/${slug}.mdx`

        try {
          const ghRes = await fetch(
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
          )

          if (!ghRes.ok) {
            const errData = await ghRes.json() as { message?: string }
            if (ghRes.status === 422) {
              res.statusCode = 409
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: `A post with slug "${slug}" already exists` }))
              return
            }
            res.statusCode = ghRes.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: errData.message || 'GitHub API error' }))
            return
          }

          res.statusCode = 201
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true, url: `/blog/${slug}` }))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Failed to create blog post' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    mdxPlugin(),
    react({ include: /\.(jsx|js|tsx|ts|mdx)$/ }),
    tailwindcss(),
    devApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
})
