/**
 * @author Gemini
 * @description Unit tests for the useKeywordExtraction custom hook, including sitemap fetching logic.
 * @created 2025-07-07
 * @lastModifiedBy Gemini
 * @lastModified 2025-07-08
 */
import { renderHook, act } from '@testing-library/react';
import { useKeywordExtraction } from './useKeywordExtraction';

// Mock the global fetch function before all tests
global.fetch = jest.fn();

describe('useKeywordExtraction Hook', () => {

  beforeEach(() => {
    // Clear mock history before each test
    (fetch as jest.Mock).mockClear();
  });

  // ... (الاختبارات القديمة لا تزال صالحة)

  it('should correctly extract a keyword from a simple URL', () => {
    const { result } = renderHook(() => useKeywordExtraction());
    act(() => {
      result.current.handleExtract(['https://example.com/my-keyword']);
    });
    expect(result.current.rows[0]?.keyword).toBe('my keyword');
  });

  // --- الاختبارات الجديدة لمنطق الـ API ---

  it('should handle sitemap parsing successfully', async () => {
    const mockUrls = ['https://site.com/page-a', 'https://site.com/page-b'];
    // Mock a successful response
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ urls: mockUrls }),
    });

    const { result } = renderHook(() => useKeywordExtraction());

    // Use 'await' when calling an async function inside 'act'
    await act(async () => {
      await result.current.handleExtractFromSitemap('https://site.com/sitemap.xml');
    });

    // Assertions
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.rows.length).toBe(2);
    expect(result.current.rows[0]?.keyword).toBe('page a');
    expect(result.current.rows[1]?.url).toBe('https://site.com/page-b');
  });

  it('should handle sitemap parsing failure', async () => {
    const errorMessage = 'فشل جلب البيانات من الـ sitemap.';
    // Mock a failed response
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: errorMessage }),
    });

    const { result } = renderHook(() => useKeywordExtraction());

    await act(async () => {
      await result.current.handleExtractFromSitemap('https://bad-site.com/sitemap.xml');
    });

    // Assertions
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.rows.length).toBe(0); // Rows should be cleared on error
  });

  it('should set loading state correctly during sitemap fetch', async () => {
    // Create a promise that we can resolve later
    let resolvePromise: (value: Partial<Response>) => void;
    const promise = new Promise(resolve => {
        resolvePromise = resolve;
    });

    (fetch as jest.Mock).mockReturnValue(promise);

    const { result, rerender } = renderHook(() => useKeywordExtraction());

    // Call the function - it will now be in a pending state
    act(() => {
      result.current.handleExtractFromSitemap('https://slow-site.com/sitemap.xml');
    });

    // Check that loading is true immediately after calling
    rerender(); // Rerender to get the latest state
    expect(result.current.isLoading).toBe(true);

    // Now, resolve the promise and wait for the state to update
    await act(async () => {
        resolvePromise!({ ok: true, json: async () => ({ urls: [] }) });
        await promise; // Wait for the promise to fully resolve
    });
    
    // Check that loading is false after completion
    expect(result.current.isLoading).toBe(false);
  });
});