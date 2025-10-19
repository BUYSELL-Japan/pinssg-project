import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://mop-okinawa.com';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function fetchWithRetry(url, maxRetries = 3, delay = 1000) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetching data (attempt ${attempt}/${maxRetries}): ${url}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MOP-Guide/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched data on attempt ${attempt}`);
      return data;

    } catch (error) {
      lastError = error;
      console.error(`Fetch attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        break;
      }

      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error(`Failed to fetch data after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
}

async function fetchGuideData() {
  try {
    const data = await fetchWithRetry('https://s3geojsonnew.s3.ap-southeast-2.amazonaws.com/Geojson3.23.geojson');

    let guideItems = [];

    if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      guideItems = data.features
        .filter(feature => feature && feature.properties && feature.properties.id)
        .map(feature => {
          const title = feature.properties.title || '';
          return {
            item_id: String(feature.properties.id),
            pin_id: feature.properties.pin_id || String(feature.properties.id),
            slug: slugify(title),
            title: title,
            title_zh_tw: feature.properties.title_zh_tw || '',
            description_en: feature.properties.description_en || '',
            description_zh_tw: feature.properties.description_zh_tw || '',
            main_image_url: feature.properties.photo_url || undefined
          };
        });
    }

    return guideItems;
  } catch (error) {
    console.error('Failed to fetch guide data:', error);
    return [];
  }
}

async function generateSitemap() {
  console.log('Generating sitemap...');

  const guideItems = await fetchGuideData();
  console.log(`Found ${guideItems.length} guide items`);

  const staticPages = [
    { loc: '', priority: '1.0' },
    { loc: '/en/', priority: '0.8' },
    { loc: '/zh/', priority: '0.8' },
    { loc: '/zh-tw/', priority: '0.8' },
  ];

  const urlEntries = [
    ...staticPages.map(page =>
      `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    ),
    ...guideItems.flatMap(item => [
      `  <url>
    <loc>${SITE_URL}/en/spot/${item.slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
      `  <url>
    <loc>${SITE_URL}/zh/spot/${item.slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    ])
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

  const publicDir = path.resolve(__dirname, '../public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(sitemapPath, xml, 'utf-8');
  console.log(`Sitemap generated successfully at ${sitemapPath}`);
  console.log(`Total URLs: ${staticPages.length + (guideItems.length * 2)}`);
}

generateSitemap().catch(error => {
  console.error('Error generating sitemap:', error);
  process.exit(1);
});
