import { renderHook, act } from '@testing-library/react';
import { useSitemapParser } from '../use-sitemap-parser';
import { apiClient } from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    parseSitemap: jest.fn(),
  },
}));

describe('useSitemapParser', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSitemapParser());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('should handle successful sitemap parsing', async () => {
    // Mock successful response
    const mockData = { urls: [{ url: 'https://example.com/page1', keyword: 'page1' }] };
    (apiClient.parseSitemap as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useSitemapParser());

    await act(async () => {
      await result.current.parseSitemap({ baseUrl: 'https://example.com' });
    });

    // Check that loading state changed correctly
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(mockData);

    // Verify API was called with correct arguments
    expect(apiClient.parseSitemap).toHaveBeenCalledWith({ baseUrl: 'https://example.com' });
  });

  it('should handle API errors', async () => {
    // Mock API error
    const errorMessage = 'Failed to parse sitemap';
    (apiClient.parseSitemap as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useSitemapParser());

    await act(async () => {
      try {
        await result.current.parseSitemap({ baseUrl: 'https://example.com' });
      } catch (error) {
        // Error should be thrown
        expect(error).toBeInstanceOf(Error);
      }
    });

    // Check error state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.data).toBeNull();
  });

  it('should reset state correctly', async () => {
    // First set some data and error
    const mockData = { urls: [{ url: 'https://example.com/page1', keyword: 'page1' }] };
    (apiClient.parseSitemap as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useSitemapParser());

    await act(async () => {
      await result.current.parseSitemap({ baseUrl: 'https://example.com' });
    });

    // Verify data is set
    expect(result.current.data).toEqual(mockData);

    // Now reset
    act(() => {
      result.current.reset();
    });

    // Check that state is reset
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('should pass settings correctly to API call', async () => {
    const mockData = { urls: [] };
    (apiClient.parseSitemap as jest.Mock).mockResolvedValue(mockData);

    const settings = {
      extractTitleH1: true,
      parseMultimediaSitemaps: true,
      checkCanonical: false,
      estimateCompetition: true,
    };

    const { result } = renderHook(() => useSitemapParser());

    await act(async () => {
      await result.current.parseSitemap({ baseUrl: 'https://example.com', settings });
    });

    // Verify API was called with settings
    expect(apiClient.parseSitemap).toHaveBeenCalledWith({
      baseUrl: 'https://example.com',
      settings,
    });
  });
});
