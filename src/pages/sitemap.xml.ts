import type { APIRoute } from 'astro';
import { pageSEOMap, getCanonicalUrl } from '../data/seo';

export const GET: APIRoute = async () => {
  const buildDate = new Date().toISOString().split('T')[0];

  const indexablePages = Object.values(pageSEOMap).filter((page) => !page.noindex);

  const xmlUrls = indexablePages
    .map((page) => {
      const canonical = getCanonicalUrl(page.path);
      const priority =
        page.path === '/'
          ? '1.0'
          : page.path === '/tong-roro-rental' || page.path === '/waste-management-services'
          ? '0.9'
          : '0.8';
      const changefreq = page.path === '/' ? 'weekly' : 'monthly';

      return `  <url>
    <loc>${canonical}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  return new Response(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
