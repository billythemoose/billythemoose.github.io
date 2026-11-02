import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Published posts, newest first. Drafts show up in `astro dev` only. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** `2026-07-15-cs-az-mds` -> `cs-az-mds`, matching Jekyll's `:title`. */
export function postSlug(post: Post): string {
  return post.id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

export function postYear(post: Post): string {
  return String(post.data.date.getUTCFullYear());
}

/** Jekyll permalink format: `/blog/:year/:title/`. */
export function postUrl(post: Post): string {
  return `/blog/${postYear(post)}/${postSlug(post)}/`;
}

/** Same estimate as al-folio: words / 180, plus one. */
export function readingTime(post: Post): number {
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.floor(words / 180) + 1;
}

export function groupBy(posts: Post[], keysOf: (post: Post) => string[]): Map<string, Post[]> {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    for (const key of keysOf(post)) {
      groups.set(key, [...(groups.get(key) ?? []), post]);
    }
  }
  return groups;
}

const UTC = { timeZone: 'UTC' } as const;

/** "July 15, 2026" */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    ...UTC,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** "Jul 15, 2026" */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    ...UTC,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
