import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

interface DashboardStats {
  total: number;
  today: number;
  uniqueCompanies: number;
  companyCounts?: Record<string, number>;
  countryCounts?: Record<string, number>;
  referrerCounts?: Record<string, number>;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Blog editor state
  const [postTitle, setPostTitle] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postReadingTime, setPostReadingTime] = useState('');
  const [postContent, setPostContent] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/analytics/visitors', {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });

      if (res.status === 401) {
        setError('Invalid password');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await res.json();
      setVisitors(data.visitors || []);
      setStats(data.stats || null);
      setIsAuthenticated(true);
      localStorage.setItem('dashboard_token', password);
    } catch {
      setError('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  // Try to use saved token
  useEffect(() => {
    const savedToken = localStorage.getItem('dashboard_token');
    if (savedToken) {
      setPassword(savedToken);
      handleLogin({ preventDefault: () => {} } as React.FormEvent);
    }
  }, []);

  const handleTitleChange = (value: string) => {
    setPostTitle(value);
    if (!slugManuallyEdited) {
      setPostSlug(slugify(value));
    }
  };

  const handlePublish = async () => {
    if (!postTitle || !postSlug || !postDescription || !postContent) {
      setPublishResult({ success: false, error: 'Please fill in all required fields.' });
      return;
    }

    setPublishing(true);
    setPublishResult(null);

    try {
      const res = await fetch('/api/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          title: postTitle,
          slug: postSlug,
          description: postDescription,
          tags: postTags,
          readingTime: postReadingTime,
          content: postContent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPublishResult({ success: false, error: data.error || 'Failed to publish' });
        return;
      }

      setPublishResult({ success: true, url: data.url });
      // Reset form
      setPostTitle('');
      setPostSlug('');
      setPostDescription('');
      setPostTags('');
      setPostReadingTime('');
      setPostContent('');
      setSlugManuallyEdited(false);
    } catch {
      setPublishResult({ success: false, error: 'Network error — could not reach the server.' });
    } finally {
      setPublishing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8">
            <h1 className="text-2xl font-bold gradient-text mb-6">Analytics Dashboard</h1>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-cyan)]"
                  placeholder="Enter dashboard password"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] text-white rounded-xl font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
              <a href="/" className="hover:text-[var(--color-accent-cyan)]">
                ← Back to portfolio
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-cyan)] text-sm';

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                handleLogin({ preventDefault: () => {} } as React.FormEvent);
              }}
              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cyan)]"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('dashboard_token');
                setIsAuthenticated(false);
              }}
              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-red-500"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
          >
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Total Visitors</p>
            <p className="text-4xl font-bold gradient-text">{stats?.total || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
          >
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Today</p>
            <p className="text-4xl font-bold text-[var(--color-accent-cyan)]">{stats?.today || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
          >
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Unique Companies</p>
            <p className="text-4xl font-bold text-[var(--color-accent-purple)]">{stats?.uniqueCompanies || 0}</p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Company Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Top Companies</h2>
            <div className="space-y-3">
              {stats?.companyCounts &&
                Object.entries(stats.companyCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([company, count]) => (
                    <div key={company} className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)] truncate flex-1 mr-4">
                        {company}
                      </span>
                      <span className="text-sm font-medium text-[var(--color-accent-cyan)]">{count}</span>
                    </div>
                  ))}
              {(!stats?.companyCounts || Object.keys(stats.companyCounts).length === 0) && (
                <p className="text-sm text-[var(--color-text-muted)]">No company data yet</p>
              )}
            </div>
          </motion.div>

          {/* Geographic Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Countries</h2>
            <div className="space-y-3">
              {stats?.countryCounts &&
                Object.entries(stats.countryCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">{country}</span>
                      <span className="text-sm font-medium text-[var(--color-accent-purple)]">{count}</span>
                    </div>
                  ))}
              {(!stats?.countryCounts || Object.keys(stats.countryCounts).length === 0) && (
                <p className="text-sm text-[var(--color-text-muted)]">No location data yet</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* New Blog Post Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-6">New Blog Post</h2>

          <div className="space-y-4">
            {/* Title + Slug row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={inputClass}
                  placeholder="My New Post"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                  Slug <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={postSlug}
                  onChange={(e) => {
                    setPostSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className={inputClass}
                  placeholder="my-new-post"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
                className={inputClass}
                placeholder="A short summary for the blog index and SEO"
              />
            </div>

            {/* Tags + Reading Time row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                  Tags
                </label>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  className={inputClass}
                  placeholder="ai, engineering, tutorial"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                  Reading Time
                </label>
                <input
                  type="text"
                  value={postReadingTime}
                  onChange={(e) => setPostReadingTime(e.target.value)}
                  className={inputClass}
                  placeholder="Auto-calculated if left blank"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">
                Content (MDX) <span className="text-red-400">*</span>
              </label>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className={`${inputClass} min-h-[300px] font-mono resize-y`}
                placeholder={"# My Post\n\nWrite your MDX content here..."}
              />
            </div>

            {/* Publish result */}
            {publishResult && (
              <div
                className={`p-4 rounded-xl text-sm ${
                  publishResult.success
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {publishResult.success ? (
                  <>
                    Post published! It will be live at{' '}
                    <span className="font-medium">{publishResult.url}</span> after the next deploy (~30s).
                  </>
                ) : (
                  publishResult.error
                )}
              </div>
            )}

            {/* Publish button */}
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-6 py-3 bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] text-white rounded-xl font-medium disabled:opacity-50 text-sm"
            >
              {publishing ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </motion.div>

        {/* Visitors Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
        >
          <div className="p-6 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-semibold">Recent Visitors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Referrer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {visitors.map((visitor, index) => (
                  <tr key={index} className="hover:bg-[var(--color-surface-hover)]">
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {new Date(visitor.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={visitor.company ? 'text-[var(--color-accent-cyan)] font-medium' : 'text-[var(--color-text-muted)]'}>
                        {visitor.company || visitor.org || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {[visitor.city, visitor.country].filter(Boolean).join(', ') || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] max-w-xs truncate">
                      {visitor.referrer || 'Direct'}
                    </td>
                    <td className="px-6 py-4">
                      {visitor.companyConfidence !== undefined && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            visitor.companyConfidence > 0.7
                              ? 'bg-green-500/20 text-green-400'
                              : visitor.companyConfidence > 0.4
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {Math.round(visitor.companyConfidence * 100)}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {visitors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                      No visitors recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
