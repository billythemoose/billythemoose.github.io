import type { APIContext } from 'astro';

export function GET(context: APIContext) {
  const sitemap = new URL('sitemap-index.xml', context.site);
  return new Response(`User-agent: *\nDisallow:\n\nSitemap: ${sitemap.href}\n`);
}
