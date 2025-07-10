import { http, HttpResponse } from 'msw';

// Define handlers for mock API responses
export const handlers = [
  // Sitemap parser endpoint
  http.post('*/api/sitemap-parser/parse', async ({ request }) => {
    const requestData = await request.json();
    
    return HttpResponse.json({
      urls: [
        { url: `${requestData.baseUrl}/page1`, keyword: 'page1' },
        { url: `${requestData.baseUrl}/page2`, keyword: 'page2' },
        { url: `${requestData.baseUrl}/about-us`, keyword: 'about-us' },
      ],
      settings: requestData.settings,
    });
  }),
  
  // Health check endpoint
  http.get('*/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
