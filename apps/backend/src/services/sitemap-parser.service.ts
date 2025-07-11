import { ParsedPageData } from '@internal-linking-analyzer-pro/types';

/**
 * @function transformToPageData
 * @description Transforms raw page data to ParsedPageData interface
 * @param rawPageData - Raw page data from sitemap parsing
 * @returns ParsedPageData - Formatted page data
 */
function transformToPageData(rawPageData: any): ParsedPageData {
  return {
    url: rawPageData.url,
    keyword: rawPageData.keyword || extractKeywordFromUrl(rawPageData.url),
    status: 'success',
    title: rawPageData.title || undefined,
    h1: rawPageData.h1 || undefined,
    canonicalUrl: rawPageData.canonicalUrl || undefined,
    isCanonical: rawPageData.isCanonical || true,
    wordCount: rawPageData.wordCount || undefined,
    internalLinks: rawPageData.internalLinks || undefined,
    externalLinks: rawPageData.externalLinks || undefined,
    competition: rawPageData.competition || undefined
  };
}

/**
 * @function extractKeywordFromUrl
 * @description Extracts a keyword from URL path
 * @param url - The URL to extract keyword from
 * @returns string - Extracted keyword
 */
function extractKeywordFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
    
    if (pathSegments.length > 0) {
      // Get the last meaningful segment
      const lastSegment = pathSegments[pathSegments.length - 1];
      // Remove file extensions and clean up
      return lastSegment.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    }
    
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

// Example definition of allExtractedUrls
const allExtractedUrls = [
  {
    url: 'https://example.com/sample-page',
    title: 'Example Page',
    h1: 'Main Heading',
    keyword: 'sample page'
  }
  // Add more objects as needed
];

// Usage:
const extractedUrls = allExtractedUrls.map(transformToPageData);

export { transformToPageData, extractKeywordFromUrl };
