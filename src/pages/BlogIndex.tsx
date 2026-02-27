import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllPosts } from '@/lib/blog';
import { formatFullDate } from '@/lib/utils';
import { trackPageView } from '@/lib/analytics';

export function BlogIndex() {
  const posts = getAllPosts();

  useEffect(() => {
    trackPageView('/blog');
  }, []);

  return (
    <div className="min-h-screen bg-[#000] text-[#F5F5F7] pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.h1
          className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em] mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Blog
        </motion.h1>
        <motion.p
          className="text-[#86868B] mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Writing about AI, engineering, and building things.
        </motion.p>

        {posts.length === 0 ? (
          <p className="text-[#86868B]">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-0">
            {posts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
              >
                {i > 0 && (
                  <hr
                    className="my-0"
                    style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)' }}
                  />
                )}
                <Link
                  to={`/blog/${post.slug}`}
                  className="block py-8 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-medium tracking-[-0.02em] group-hover:text-[#D1D1D6] transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-[#86868B] mt-2 leading-relaxed">
                        {post.description}
                      </p>
                    </div>
                    <div className="text-sm text-[#86868B] whitespace-nowrap pt-1 flex flex-col items-end gap-1">
                      <span>{formatFullDate(new Date(post.date))}</span>
                      {post.readingTime && <span>{post.readingTime}</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
