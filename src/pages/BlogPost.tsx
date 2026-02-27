import { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPostBySlug } from '@/lib/blog';
import { formatFullDate } from '@/lib/utils';
import { trackPageView } from '@/lib/analytics';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : null;

  useEffect(() => {
    if (slug) {
      trackPageView(`/blog/${slug}`);
    }
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const { meta, Component } = post;

  return (
    <div className="min-h-screen bg-[#000] text-[#F5F5F7] pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/blog"
            className="text-sm text-[#86868B] hover:text-[#F5F5F7] transition-colors mb-8 inline-block"
          >
            &larr; Back to blog
          </Link>

          <header className="mb-12">
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em] mb-4">
              {meta.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[#86868B]">
              <time>{formatFullDate(new Date(meta.date))}</time>
              {meta.readingTime && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.12)' }}>/</span>
                  <span>{meta.readingTime}</span>
                </>
              )}
            </div>
            {meta.tags && meta.tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full text-[#86868B]"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <article className="prose">
            <Component />
          </article>
        </motion.div>
      </div>
    </div>
  );
}
