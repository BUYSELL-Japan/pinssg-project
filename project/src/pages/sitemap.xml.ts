import type { APIRoute } from 'astro';
import { fetchGuideData } from '../utils/dataFetcher';

export const GET: APIRoute = async () => {
  const baseUrl = 'https://mop-okinawa.com';
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    const guideItems = await fetchGuideData();

    const staticUrls = [
      { url: `${baseUrl}/`, lastmod: currentDate, changefreq: 'weekly', priority: '1.0' },
      { url: `${baseUrl}/en/`, lastmod: currentDate, changefreq: 'weekly', priority: '1.0' },
      { url: `${baseUrl}/zh-tw/`, lastmod: currentDate, changefreq: 'weekly', priority: '1.0' },
      { url: `${baseUrl}/zh/`, lastmod: currentDate, changefreq: 'weekly', priority: '1.0' },
    ];

    const dynamicUrls = guideItems.flatMap(item => [
      {
        url: `${baseUrl}/en/spot/${item.slug}/`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.8'
      },
      {
        url: `${baseUrl}/zh/spot/${item.slug}/`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.8'
      }
    ]);

    const allUrls = [...staticUrls, ...dynamicUrls];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(({ url, lastmod, changefreq, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};
