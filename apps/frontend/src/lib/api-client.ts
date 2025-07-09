// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_NESTJS_BACKEND_URL || 'http://localhost:3002';
const API_PREFIX = 'api';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/${API_PREFIX}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Sitemap Parser API methods
  async parseSitemap(data: {
    baseUrl: string;
    settings?: {
      extractTitleH1?: boolean;
      parseMultimediaSitemaps?: boolean;
      checkCanonical?: boolean;
      estimateCompetition?: boolean;
    };
  }) {
    return this.request('/sitemap-parser/parse', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export configuration for use in components
export const API_CONFIG = {
  BACKEND_URL: API_BASE_URL,
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  API_BASE: `${API_BASE_URL}/${API_PREFIX}`,
};
