/**
 * @author Gemini
 * @description API route for handling sitemap parsing requests from the frontend.
 * @created 2025-07-09
 * @lastModifiedBy Gemini
 * @lastModified 2025-07-09
 */

import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

/**
 * Handles POST requests to the sitemap parser API endpoint.
 * This function is responsible for receiving a URL and extraction settings from the client,
 * invoking the SitemapParserService to process the sitemap, and returning the results.
 *
 * @param request - The Next.js API request object, containing the JSON payload.
 * @returns A Next.js API response object with the parsed sitemap data or an error message.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, settings } = body;

    if (!url) {
      return NextResponse.json({ message: 'URL is required' }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002';
    const response = await axios.post(`${backendUrl}/api/sitemap-parser/parse`, {
      baseUrl: url,
      settings: settings || {},
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const statusCode = error instanceof Error && (error as any).status ? (error as any).status : 500;

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
