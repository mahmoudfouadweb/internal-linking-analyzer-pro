// packages/types/src/sitemap.ts

/**
 * @description Shared interfaces for Sitemap parsing and keyword extraction data.
 * This file ensures type consistency between frontend and backend.
 * @author Gemini
 * @created 2025-07-08
 * @lastModifiedBy Gemini
 * @lastModified 2025-07-08 (No content change, just re-confirming)
 */

// --- Backend Request/Response Interfaces ---
// واجهات تحليل Sitemap
export interface ParsedUrl {
  url: string;
  keyword?: string;
  title?: string;
  h1?: string;
  canonical?: string;
  competition?: 'low' | 'medium' | 'high';
  category?: string;
}
/**
 * Settings passed from Frontend to Backend for advanced extraction features.
 */
export interface ExtractionSettings {
  extractTitleH1: boolean;
  parseMultimediaSitemaps: boolean;
  checkCanonical: boolean;
  estimateCompetition: boolean;
}

// Request interface for parsing a sitemap
// This is the data structure sent from the frontend to the backend to initiate parsing.
export interface ParseSitemapRequest {
  baseUrl: string;
  options?: {
    fetchTitles?: boolean;
    fetchH1?: boolean;
    checkCanonical?: boolean;
    estimateCompetition?: boolean;
    includeMedia?: boolean;
  };
}

// Response interface for the parsed sitemap
// This is the data structure returned from the backend to the frontend after parsing.
export interface ParseSitemapResponse {
  urls: ParsedUrl[];
  sitemaps: SitemapInfo[];
  totalUrls: number;
  processedUrls: number;
}

/**
 * Information about a discovered or processed sitemap.
 * Used by both frontend (to display) and backend (to track progress/results).
 */
export interface SitemapInfo {
  url: string;
  urlCount?: number; // Number of URLs found in this specific sitemap
  status: 'success' | 'error';
  errorMessage?: string;
  sitemapsFound?: SitemapInfo[]; // For sitemap index, lists child sitemaps
  success: boolean;
  data?: any;
  error?: string;
  lastModified?: string;
  type: 'xml' | 'txt' | 'index';
}

export interface CompetitionData {
  score: number;
  factors: string[];
}

export interface ExtractedPageData {
  url: string;
  title?: string;
  h1?: string;
  canonical?: string;
  competition?: CompetitionData;
}

/**
 * Data structure for a single extracted URL and its associated information.
 * This is the enriched data returned by the backend to the frontend.
 */
export interface ParsedPageData {
  url: string;
  keyword: string; // Extracted keyword from URL path
  title?: string; // Content of <title> tag
  h1?: string; // Content of <h1> tag
  isCanonical?: boolean; // True if URL is canonical, false if different, undefined if not checked
  canonicalUrl?: string; // The canonical URL if different from current URL
  competitionEstimate?: string; // Basic competition estimate (e.g., 'Low', 'Medium', 'High')
  urlCategory?: string; // Categorization of the URL (e.g., 'Article', 'Product')
}

export interface ParsedSitemapData {
  urls: string[];
  sitemapInfo?: SitemapInfo[];
  totalUrls: number;
  extractedData?: ExtractedPageData[];
}

/**
 * The full response structure from the backend sitemap parser endpoint.
 */
export interface SitemapParserResponse {
  urls: ParsedPageData[];
  sitemaps: SitemapInfo[];
  success: boolean;
  data?: ParsedSitemapData;
  error?: string;
  message?: string;
}

export interface ParseSitemapSettings extends ExtractionSettings {
  // Additional settings specific to the parsing operation
  maxUrls?: number;
  timeout?: number;
}

// --- Frontend Specific Interfaces (if any are truly unique to frontend state) ---
// For now, KeywordExtractionRow can extend ParsedPageData or be identical.
// If it needs frontend-specific fields (like 'selected'), define them here.
export interface KeywordExtractionRow extends ParsedPageData {
  id: number; // Unique ID for frontend table management
}

// Additional utility types
export type SitemapType = 'xml' | 'txt' | 'index';
export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';
