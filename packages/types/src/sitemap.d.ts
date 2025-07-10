export interface ExtractionSettings {
  extractTitleH1?: boolean;
  extractH1?: boolean;
  countWords?: boolean;
  countInternalAndExternalLinks?: boolean;
  checkCanonical?: boolean; // ✅ بدلاً من checkCanonicalUrl
  estimateCompetition?: boolean;
  parseMultimediaSitemaps?: boolean; // ✅ لو فعلاً هتستخدمه
}

export interface SitemapInfo {
  url: string;
  status: 'success' | 'error' | 'pending';
  urlCount: number;
  type: 'xml' | 'txt';
  errorMessage?: string;
  success: boolean;
}

export interface ParsedPageData {
  url: string;
  keyword: string;
  title?: string;
  h1?: string;
  canonicalUrl?: string;
  isCanonical?: boolean;
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
  wordCount?: number;
  internalLinks?: number;
  externalLinks?: number;
  competition?: number;
}
export interface SitemapParserResponse {
  success: boolean;
  message: string;
  sitemaps: SitemapInfo[];
  extractedUrls: ParsedPageData[];
}

export interface KeywordExtractionRow extends ParsedPageData {
  id: number;
}
