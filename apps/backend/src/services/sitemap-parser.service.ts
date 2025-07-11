// Define ParsedPageData type
interface ParsedPageData {
  url: string;
  title: string | null;
  h1: string | null;
  description: string | null;
  metadata: Record<string, any>;
  lastModified: Date | null;
  changeFreq: string | null;
  priority: string | null;
}

function transformToPageData(rawPageData: any): ParsedPageData {
  return {
    url: rawPageData.url,
    title: rawPageData.title || null,
    h1: rawPageData.h1 || null,
    description: rawPageData.description || null,
    metadata: rawPageData.metadata || {},
    lastModified: rawPageData.lastModified ? new Date(rawPageData.lastModified) : null,
    changeFreq: rawPageData.changeFreq || null,
    priority: rawPageData.priority || null
  };
}

// Example definition of allExtractedUrls
const allExtractedUrls = [
  {
    url: 'https://example.com',
    title: 'Example Page',
    h1: 'Main Heading',
    description: 'Sample description',
    metadata: {},
    lastModified: '2024-01-01',
    changeFreq: 'weekly',
    priority: '0.8'
  }
  // Add more objects as needed
];

// Usage:
const extractedUrls = allExtractedUrls.map(transformToPageData);
