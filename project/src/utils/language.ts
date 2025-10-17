export type Language = 'ja' | 'zh-tw' | 'ko' | 'en';

export interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
}

export const languages: LanguageConfig[] = [
  { code: 'zh-tw', name: '繁體中文', flag: '🇹🇼' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export const defaultLanguage: Language = 'zh-tw';

export function getLanguageFromPath(pathname: string): Language {
  if (pathname.startsWith('/zh-tw')) {
    return 'zh-tw';
  } else if (pathname.startsWith('/en')) {
    return 'en';
  }
  return 'zh-tw';
}

export function getLocalizedPath(path: string, language: Language): string {
  const safePath = path || '/';
  const cleanPath = safePath.replace(/^\/(zh-tw|en)/, '');
  
  if (language === 'zh-tw') {
    return `/zh-tw${cleanPath}` || '/zh-tw/';
  } else {
    return `/${language}${cleanPath}`;
  }
}

export interface GuideItem {
  item_id: string;
  slug: string;
  title: string;
  title_zh_tw: string;
  description_en: string;
  description_zh_tw: string;
  main_image_url?: string;
}

export function getLocalizedText(item: GuideItem, field: keyof GuideItem, language: Language): string {
  if (language === 'zh-tw') {
    if (field === 'title') return item.title_zh_tw || item.title || '';
    if (field === 'description_en') return item.description_zh_tw || '';
  } else if (language === 'en') {
    if (field === 'title') return item.title || '';
    if (field === 'description_en') return item.description_en || '';
  }

  const value = item[field];

  if (typeof value === 'string') {
    return value;
  } else if (value === null || value === undefined) {
    return '';
  } else {
    return '';
  }
}

export const translations = {
  ja: {
    siteTitle: '沖縄ガイドブック',
    siteSubtitle: '美ら島の魅力を発見しよう',
    siteDescription: '沖縄の美しい景色、豊かな文化、そして心温まる体験をご紹介します。',
    recommendedSpots: 'おすすめスポット',
    overview: '概要',
    detailInfo: '詳細情報',
    highlights: '見どころ',
    access: 'アクセス',
    viewOtherSpots: '他のスポットを見る',
    home: 'トップページ',
    viewDetail: '詳細を見る',
    loadingError: 'データの取得に失敗しました',
    loadingNote: '沖縄の美しい景色をお待ちください...',
    loadingSpinner: '沖縄の風景を読み込み中...',
    dataLoading: 'データ読み込み中です'
  },
  'zh-tw': {
    siteTitle: '沖繩旅遊指南',
    siteSubtitle: '發現美麗島嶼的魅力',
    siteDescription: '為您介紹沖繩的美麗風景、豐富文化和溫馨體驗。',
    recommendedSpots: '推薦景點',
    overview: '概要',
    detailInfo: '詳細資訊',
    highlights: '亮點',
    access: '交通',
    viewOtherSpots: '查看其他景點',
    home: '首頁',
    viewDetail: '查看詳情',
    loadingError: '資料獲取失敗',
    loadingNote: '請稍候，正在載入沖繩的美麗風景...',
    loadingSpinner: '正在載入沖繩風景...',
    dataLoading: '正在載入資料'
  },
  ko: {
    siteTitle: '오키나와 가이드북',
    siteSubtitle: '아름다운 섬의 매력을 발견하세요',
    siteDescription: '오키나와의 아름다운 풍경, 풍부한 문화, 그리고 따뜻한 경험을 소개합니다.',
    recommendedSpots: '추천 명소',
    overview: '개요',
    detailInfo: '상세 정보',
    highlights: '하이라이트',
    access: '교통',
    viewOtherSpots: '다른 명소 보기',
    home: '홈페이지',
    viewDetail: '자세히 보기',
    loadingError: '데이터 가져오기 실패',
    loadingNote: '오키나와의 아름다운 풍경을 기다려주세요...',
    loadingSpinner: '오키나와 풍경 로딩 중...',
    dataLoading: '데이터 로딩 중입니다'
  },
  en: {
    siteTitle: 'Okinawa Guidebook',
    siteSubtitle: 'Discover the Charm of Beautiful Islands',
    siteDescription: 'Introducing the beautiful scenery, rich culture, and heartwarming experiences of Okinawa.',
    recommendedSpots: 'Recommended Spots',
    overview: 'Overview',
    detailInfo: 'Detailed Information',
    highlights: 'Highlights',
    access: 'Access',
    viewOtherSpots: 'View Other Spots',
    home: 'Home',
    viewDetail: 'View Details',
    loadingError: 'Failed to fetch data',
    loadingNote: 'Please wait for the beautiful scenery of Okinawa...',
    loadingSpinner: 'Loading Okinawa scenery...',
    dataLoading: 'Loading data'
  }
};

export function t(key: keyof typeof translations.ja, language: Language): string {
  return translations[language][key] || translations.ja[key];
}