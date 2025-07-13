// packages/types/src/sitemap.ts

/**
 * @fileoverview Shared interfaces for Sitemap parsing and keyword extraction.
 * @description Ensures type consistency between the frontend and backend applications.
 * @author Gemini
 * @version 1.2.0
 * @created 2025-07-08
 * @lastModified 2025-07-10
 */

export type SitemapType = 'xml' | 'txt';

/**
 * @interface ExtractionSettings
 * @description Defines the settings for content extraction during sitemap parsing.
 * @property {boolean} [extractTitleH1] - Whether to extract the page title and H1 heading.
 * @property {boolean} [extractTitle] - Whether to extract the page title.
 * @property {boolean} [checkCanonical] - Whether to check for canonical URLs.
 * @property {boolean} [countWords] - Whether to count the words on the page.
 * @property {boolean} [estimateCompetition] - Whether to estimate the competition for the page.
 * @property {boolean} [countInternalAndExternalLinks] - Whether to count internal and external links on the page.
 */
export interface ExtractionSettings {
  extractTitleH1?: boolean;
  extractTitle?: boolean; // Added extractTitle
  checkCanonical?: boolean;
  countWords?: boolean;
  estimateCompetition?: boolean;
  countInternalAndExternalLinks?: boolean;
  parseMultimediaSitemaps?: boolean;
  extractH1?: boolean;
}

/**
 * @interface ParsedPageData
 * @description Represents the extracted data for a single page from a sitemap.
 * @property {string} url - The URL of the page.
 * @property {string} keyword - The extracted keyword from the URL.
 * @property {'pending' | 'success' | 'error'} status - The processing status of the page data.
 * @property {string} [title] - The extracted title of the page.
 * @property {string} [h1] - The extracted H1 heading of the page.
 * @property {string} [canonicalUrl] - The canonical URL of the page.
 * @property {boolean} [isCanonical] - Indicates if the page's URL is canonical.
 * @property {string} [errorMessage] - Any error message encountered during extraction.
 * @property {number} [wordCount] - The word count of the page content.
 * @property {number} [internalLinks] - The number of internal links found on the page.
 * @property {number} [externalLinks] - The number of external links found on the page.
 * @property {number} [competition] - The estimated competition score for the page.
 */
export interface ParsedPageData {
  url: string;
  keyword: string;
  status: 'pending' | 'success' | 'error';
  title?: string;
  h1?: string;
  canonicalUrl?: string;
  isCanonical?: boolean;
  errorMessage?: string;
  wordCount?: number;
  internalLinks?: number;
  externalLinks?: number;
  competition?: number;
}

/**
 * @interface SitemapInfo
 * @description Provides information about a parsed sitemap.
 * @property {string} url - The URL of the sitemap.
 * @property {'success' | 'error' | 'pending'} status - The processing status of the sitemap.
 * @property {number} urlCount - The number of URLs found in the sitemap.
 * @property {SitemapType} type - The type of the sitemap (XML or TXT).
 * @property {boolean} success - Indicates if the sitemap was processed successfully.
 * @property {string} [errorMessage] - Any error message encountered during sitemap processing.
 * @property {{ url: string; status: 'pending' }[]} [sitemapsFound] - A list of child sitemaps found within a sitemap index.
 */
export interface SitemapInfo {
  url: string;
  status: 'success' | 'error' | 'pending';
  urlCount: number;
  type: SitemapType;
  success: boolean;
  errorMessage?: string;
  sitemapsFound?: {
    url: string;
    status: 'pending' | 'success' | 'error';
    urlCount?: number;
    type?: SitemapType;
    success?: boolean;
  }[];
}

/**
 * @interface SitemapParserResponse
 * @description Represents the overall response from the sitemap parsing process.
 * @property {boolean} success - Indicates if the sitemap parsing was successful.
 * @property {string} message - A descriptive message about the parsing outcome.
 * @property {SitemapInfo[]} sitemaps - An array of information about the processed sitemaps.
 * @property {ParsedPageData[]} extractedUrls - An array of extracted page data.
 * @property {number} [processingTimeMs] - The total time taken for processing in milliseconds.
 */
export interface SitemapParserResponse {
  success: boolean;
  message: string;
  sitemaps: SitemapInfo[];
  extractedUrls: ParsedPageData[];
  processingTimeMs?: number;
}

/**
 * @interface SitemapParserRequest
 * @description Defines the request structure for sitemap parsing.
 * @property {string} baseUrl - The base URL of the website to parse.
 * @property {ExtractionSettings} [settings] - Optional settings for content extraction.
 */
export interface SitemapParserRequest {
  baseUrl: string;
  settings?: ExtractionSettings;
}
