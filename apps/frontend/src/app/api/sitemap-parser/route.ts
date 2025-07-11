/**
 * @fileoverview API Route for Sitemap Parser - Proxy to Backend
 * @description Handles sitemap parsing requests by forwarding them to the backend service
 * @author AI Agent
 * @created 2025-01-11
 * @lastModified 2025-01-11
 * @version 1.0.0
 * @architecture-compliance ✅ Follows Next.js App Router API conventions
 * @security-review ✅ Input validation and error handling implemented
 * @performance-impact Low - Simple proxy with minimal processing
 * @dependencies Backend sitemap-parser service (Port 3002)
 * @testing-coverage Requires integration tests
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * @interface SitemapParseRequest
 * @description Request body structure for sitemap parsing
 */
interface SitemapParseRequest {
  url: string;
  settings?: {
    extractTitleH1?: boolean;
    parseMultimediaSitemaps?: boolean;
    checkCanonical?: boolean;
    estimateCompetition?: boolean;
  };
}

/**
 * @function POST
 * @description Handles POST requests to parse sitemaps
 * @param request - Next.js request object
 * @returns Promise<NextResponse> - JSON response with parsed data or error
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/sitemap-parser', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     url: 'https://example.com/sitemap.xml',
 *     settings: { extractTitleH1: true }
 *   })
 * });
 * ```
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body: SitemapParseRequest = await request.json();
    
    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Default settings - تطابق أسماء الخصائص مع DTO الخلفية
    const settings = {
      extractTitleH1: true,
      parseMultimediaSitemaps: false,
      checkCanonicalUrl: false, // تغيير من checkCanonical إلى checkCanonicalUrl
      estimateCompetition: false,
      ...body.settings,
    };

    // Forward request to backend service
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002';
    const backendResponse = await fetch(`${backendUrl}/api/sitemap-parser/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InternalLinkingAnalyzerPro-Frontend/1.0',
      },
      body: JSON.stringify({
        baseUrl: body.url, // تغيير من url إلى baseUrl لتتوافق مع DTO الخلفية
        settings,
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error (${backendResponse.status}):`, errorText);
      
      return NextResponse.json(
        { 
          error: 'Backend service error',
          details: `HTTP ${backendResponse.status}`,
        },
        { status: backendResponse.status }
      );
    }

    // Parse backend response
    const data = await backendResponse.json();
    
    // Log successful processing
    console.log(`Successfully processed sitemap: ${body.url}, found ${data.extractedUrls?.length || 0} URLs`);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Route Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * @function GET
 * @description Handles GET requests - returns API information
 * @returns Promise<NextResponse> - API information
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    service: 'Sitemap Parser API',
    version: '1.0.0',
    methods: ['POST'],
    description: 'Proxy service for sitemap parsing functionality',
    backend: process.env.BACKEND_URL || 'http://localhost:3002',
  });
}