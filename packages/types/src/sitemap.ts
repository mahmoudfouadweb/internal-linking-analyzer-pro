// packages/types/src/sitemap.ts

/**
 * @fileoverview Shared interfaces for Sitemap parsing and keyword extraction.
 * @description Ensures type consistency between the frontend and backend applications.
 * @author Gemini
 * @version 1.1.0
 * @created 2025-07-08
 * @lastModified 2025-07-09
 */

export type SitemapType = 'xml' | 'txt';

export interface ExtractionSettings {
  extractTitle?: boolean;
  extractH1?: boolean;
  parseMultimediaSitemaps?: boolean;
  checkCanonicalUrl?: boolean;
  estimateCompetition?: boolean;
  countWords?: boolean;
  countInternalAndExternalLinks?: boolean;
}

export interface ParsedPageData {
  url: string;
  keyword: string;
  title?: string;
  h1?: string;
  canonicalUrl?: string;
  isCanonical?: boolean;
  status: 'pending' | 'success' | 'error';
  wordCount?: number;
  internalLinks?: number;
  externalLinks?: number;
  competition?: number;
  errorMessage?: string;
}

export interface SitemapInfo {
  url: string;
  status: 'success' | 'error' | 'pending';
  urlCount: number;
  type: SitemapType;
  errorMessage?: string;
  sitemapsFound?: { url: string; status: 'pending' }[];
}

export interface SitemapParserResponse {
  success: boolean;
  message: string;
  sitemaps: SitemapInfo[];
  extractedUrls: ParsedPageData[];
  processingTimeMs?: number;
}

export interface SitemapParserRequest {
  baseUrl: string;
  settings?: ExtractionSettings;
}
