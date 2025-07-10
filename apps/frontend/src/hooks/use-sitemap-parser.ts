'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface SitemapParseSettings {
  extractTitleH1?: boolean;
  parseMultimediaSitemaps?: boolean;
  checkCanonical?: boolean;
  estimateCompetition?: boolean;
  countWords?: boolean;
  countInternalAndExternalLinks?: boolean;
}

interface SitemapParseRequest {
  baseUrl: string;
  settings?: SitemapParseSettings;
}

export function useSitemapParser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const parseSitemap = async (request: SitemapParseRequest) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.parseSitemap(request);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تحليل الخريطة';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    parseSitemap,
    loading,
    error,
    data,
    reset,
  };
}
