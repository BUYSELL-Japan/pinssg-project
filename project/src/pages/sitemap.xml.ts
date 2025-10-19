import type { APIRoute } from 'astro';
import { fetchGuideData } from '../utils/dataFetcher';

const SITE_URL = 'https://mop-okinawa.com';

export const GET: APIRoute = async () => {
  const guideItems = await fetchGuideData();

  const staticPages = [
    '',
    '/en/',
    '/zh/',
    '/zh-tw/',
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${SITE_URL}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
${guideItems.map(item => `  <url>
    <loc>${SITE_URL}/en/spot/${item.slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/zh/spot/${item.slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
