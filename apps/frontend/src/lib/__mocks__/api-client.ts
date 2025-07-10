// Mock implementation of ApiClient
export class ApiClient {
  async parseSitemap(data: {
    baseUrl: string;
    settings?: {
      extractTitleH1?: boolean;
      parseMultimediaSitemaps?: boolean;
      checkCanonical?: boolean;
      estimateCompetition?: boolean;
    };
  }) {
    return Promise.resolve({
      urls: [
        { url: `${data.baseUrl}/mock-page-1`, keyword: 'mock-page-1' },
        { url: `${data.baseUrl}/mock-page-2`, keyword: 'mock-page-2' },
      ],
      settings: data.settings,
    });
  }

  async healthCheck() {
    return Promise.resolve({ status: 'ok' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export configuration for use in components
export const API_CONFIG = {
  BACKEND_URL: 'http://localhost:3002',
  FRONTEND_URL: 'http://localhost:3000',
  API_BASE: 'http://localhost:3002/api',
};
