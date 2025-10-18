export function slugify(text: string): string {
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

export async function fetchWithRetry(url: string, maxRetries: number = 3, delay: number = 1000): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetching data (attempt ${attempt}/${maxRetries}): ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MOP-Guide/1.0)',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched data on attempt ${attempt}`);
      return data;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`Fetch attempt ${attempt} failed:`, error);
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error(`Failed to fetch data after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
}

interface GeoJSONFeature {
  type: string;
  properties: {
    id?: number | string;
    title?: string;
    title_zh_tw?: string;
    description_en?: string;
    description_zh_tw?: string;
    photo_url?: string;
    [key: string]: any;
  };
  geometry: any;
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

export async function fetchGuideData() {
  try {
    const data = await fetchWithRetry('https://s3geojsonnew.s3.ap-southeast-2.amazonaws.com/Geojson3.23.geojson') as GeoJSONData;

    let guideItems: Array<{
      item_id: string;
      slug: string;
      title: string;
      title_zh_tw: string;
      description_en: string;
      description_zh_tw: string;
      main_image_url?: string;
    }> = [];

    if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      guideItems = data.features
        .filter((feature: GeoJSONFeature) => feature && feature.properties && feature.properties.id)
        .map((feature: GeoJSONFeature) => {
          const title = feature.properties.title || '';
          return {
            item_id: String(feature.properties.id),
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