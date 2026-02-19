import type { ComponentType } from 'react';

interface PostFrontmatter {
  title: string;
  date: string;
  description: string;
  tags?: string[];
  readingTime?: string;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
}

interface MdxModule {
  default: ComponentType;
  frontmatter: PostFrontmatter;
}

const modules = import.meta.glob<MdxModule>('../../content/blog/*.mdx', {
  eager: true,
});

function slugFromPath(path: string): string {
  const file = path.split('/').pop() ?? '';
  return file.replace(/\.mdx$/, '');
}

export function getAllPosts(): PostMeta[] {
  return Object.entries(modules)
    .map(([path, mod]) => ({
      slug: slugFromPath(path),
      ...mod.frontmatter,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): { meta: PostMeta; Component: ComponentType } | null {
  const entry = Object.entries(modules).find(
    ([path]) => slugFromPath(path) === slug
  );
  if (!entry) return null;
  const [path, mod] = entry;
  return {
    meta: { slug: slugFromPath(path), ...mod.frontmatter },
    Component: mod.default,
  };
}
