export interface ExtractionSettings {
  extractTitleH1?: boolean;
  parseMultimediaSitemaps?: boolean;
  checkCanonical?: boolean;
  estimateCompetition?: boolean;
  countWords?: boolean;
  countInternalAndExternalLinks?: boolean;
}

export interface SitemapInfo {
  url: string;
  status: 'success' | 'error' | 'pending';
  urlCount: number;
  type: 'xml' | 'txt';
  errorMessage?: string;
}

export interface ParsedPageData {
        url: string;
  keyword: string;
  title?: string;
  h1?: string;
  canonicalUrl?: string;
  status: 'pending' | 'success' | 'error';
  wordCount?: number;
  internalLinks?: number;
  externalLinks?: number;
  competition?: number;
  errorMessage?: string;
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
