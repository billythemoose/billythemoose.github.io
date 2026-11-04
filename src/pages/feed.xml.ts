import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { BLOG, SITE } from '@/config';
import { getPosts, postUrl } from '@/lib/posts';

// Same path as jekyll-feed so existing subscribers keep working.
export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${BLOG.name} | ${SITE.fullName}`,
    description: BLOG.description,
    site: context.site!,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post),
      categories: [...post.data.categories, ...post.data.tags],
    })),
  });
}
