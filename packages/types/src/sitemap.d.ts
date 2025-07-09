export interface ExtractionSettings {
    extractTitleH1: boolean;
    parseMultimediaSitemaps: boolean;
    checkCanonical: boolean;
    estimateCompetition: boolean;
}
export interface SitemapInfo {
    url: string;
    urlCount?: number;
    status: 'success' | 'error';
    errorMessage?: string;
    sitemapsFound?: SitemapInfo[];
}
export interface ParsedPageData {
    url: string;
    keyword: string;
    title?: string;
    h1?: string;
    isCanonical?: boolean;
    canonicalUrl?: string;
    competitionEstimate?: string;
    urlCategory?: string;
}
export interface SitemapParserResponse {
    urls: ParsedPageData[];
    sitemaps: SitemapInfo[];
}
export interface KeywordExtractionRow extends ParsedPageData {
    id: number;
}
