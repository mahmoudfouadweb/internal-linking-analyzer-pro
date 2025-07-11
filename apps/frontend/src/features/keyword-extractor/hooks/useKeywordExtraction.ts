/**
 * @author Mahmoud & Gemini
 * @description A custom React hook for handling keyword extraction logic, state, and actions.
 * @created 2025-07-07
 * @lastModifiedBy Gemini
 * @lastModified 2025-07-08
 */
import { useState, useEffect, useCallback, useMemo } from 'react';

// Import shared interfaces from the 'packages/types' workspace
import {
  ExtractionSettings,
  SitemapInfo,
  ParsedPageData,
  SitemapParserResponse,
  KeywordExtractionRow, // Frontend specific row interface
} from '@internal-linking-analyzer-pro/types';

// Default settings for the extraction features
const defaultSettings: ExtractionSettings & {
  enableAdvancedTableFeatures: boolean;
  detectDuplicates: boolean;
  urlCategorization: boolean;
} = {
  extractTitleH1: false,
  parseMultimediaSitemaps: false,
  checkCanonical: false,
  estimateCompetition: false,
  enableAdvancedTableFeatures: true, // Enabled by default for better UX
  detectDuplicates: false, // Frontend logic
  urlCategorization: false, // Frontend logic
};

// --- Hook Implementation ---
export function useKeywordExtraction() {
  const [rows, setRows] = useState<KeywordExtractionRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [urlsText, setUrlsText] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [sitemaps, setSitemaps] = useState<SitemapInfo[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0); // For progress bar (0-100)

  // State for settings, loaded from localStorage
  const [settings, setSettings] = useState<typeof defaultSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('keywordExtractionSettings');
        return savedSettings
          ? { ...defaultSettings, ...JSON.parse(savedSettings) }
          : defaultSettings;
      } catch (e: unknown) {
        // Fixed: 'e' is of type 'unknown'
        console.error('Failed to parse settings from localStorage, using defaults.', e);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('keywordExtractionSettings', JSON.stringify(settings));
    }
  }, [settings]);

  // Sync text areas with table rows
  useEffect(() => {
    setUrlsText(rows.map((row: KeywordExtractionRow) => row.url).join('\n')); // Fixed: 'row' implicitly has 'any' type
    setKeywordsText(rows.map((row: KeywordExtractionRow) => row.keyword).join('\n')); // Fixed: 'row' implicitly has 'any' type
  }, [rows]);

  // Utility function to extract keyword from URL path
  const extractKeywordFromURL = useCallback((url: string): string => {
    try {
      const pathname = new URL(url).pathname;
      const decoded = decodeURIComponent(pathname);
      // Remove common file extensions and trailing slashes
      const cleanPath = decoded
        .replace(/\.(html|htm|php|asp|aspx|pdf|jpg|png|gif)$/i, '')
        .replace(/\/+$/, '');
      const segments = cleanPath.split('/').filter(Boolean); // Filter Boolean removes empty strings

      // Simple filter for common path segments (can be extended)
      const filteredSegments = segments.filter(
        (
          segment: string // Fixed: 'segment' implicitly has 'any' type
        ) =>
          !['blog', 'category', 'product', 'tag', 'archive', 'page', 'en', 'ar'].includes(
            segment.toLowerCase()
          )
      );

      const keyword = filteredSegments.pop()?.replace(/-/g, ' ').trim();
      return keyword || 'لا توجد كلمة مفتاحية';
    } catch (error: unknown) {
      // Fixed: 'error' is of type 'unknown'
      console.error('Error extracting keyword from URL:', error);
      return 'رابط غير صالح';
    }
  }, []);

  // Basic URL Categorization (Frontend logic for now - can be moved to backend for robustness)
  const categorizeUrl = useCallback((url: string): string => {
    if (url.includes('/blog/') || url.includes('/article/')) return 'مقالة/مدونة';
    if (url.includes('/product/') || url.includes('/shop/')) return 'منتج';
    if (url.includes('/category/') || url.includes('/cat/')) return 'فئة';
    if (url.includes('/contact') || url.includes('/about')) return 'صفحة خدمية';
    return 'أخرى';
  }, []);

  // Main extraction logic from a list of URLs (used for manual input or sitemap results)
  const handleExtract = useCallback(
    (links: ParsedPageData[], initialCall: boolean = false) => {
      let currentId = initialCall ? 0 : rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 0;
      const newRows: KeywordExtractionRow[] = links.map((linkData: ParsedPageData) => ({
        // Fixed: 'linkData' implicitly has 'any' type
        id: currentId++,
        url: linkData.url,
        keyword: linkData.keyword || extractKeywordFromURL(linkData.url), // Use backend keyword if provided, else extract
        ...(settings.extractTitleH1 && { title: linkData.title, h1: linkData.h1 }),
        ...(settings.checkCanonical && {
          isCanonical: linkData.isCanonical,
          canonicalUrl: linkData.canonicalUrl,
        }),
        ...(settings.estimateCompetition && { competitionEstimate: linkData.competitionEstimate }),
        ...(settings.urlCategorization && {
          urlCategory: linkData.urlCategory || categorizeUrl(linkData.url),
        }), // Use backend category or categorize on frontend
      }));

      setRows((prevRows: KeywordExtractionRow[]) => {
        // Fixed: 'prevRows' implicitly has 'any' type
        let combinedRows = initialCall ? newRows : [...prevRows, ...newRows];

        // Handle duplicate detection if enabled (frontend logic)
        if (settings.detectDuplicates) {
          const uniqueUrls = new Set<string>();
          const uniqueRows: KeywordExtractionRow[] = [];
          combinedRows.forEach((row: KeywordExtractionRow) => {
            // Fixed: 'row' implicitly has 'any' type
            if (!uniqueUrls.has(row.url)) {
              uniqueUrls.add(row.url);
              uniqueRows.push(row);
            }
          });
          combinedRows = uniqueRows;
        }
        return combinedRows;
      });
      setSelectedRows(new Set());
    },
    [
      rows,
      settings.detectDuplicates,
      settings.extractTitleH1,
      settings.checkCanonical,
      settings.estimateCompetition,
      settings.urlCategorization,
      extractKeywordFromURL,
      categorizeUrl,
    ]
  );

  // Main sitemap extraction logic
  const handleExtractFromSitemap = useCallback(
    async (baseUrl: string) => {
      if (!baseUrl) {
        setError('الرجاء إدخال رابط الموقع.');
        return;
      }

      // Client-side URL validation
      try {
        new URL(baseUrl); // Basic validation
      } catch (e: unknown) {
        // Fixed: 'e' is of type 'unknown'
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(
          `الرابط المدخل غير صالح: ${errorMessage}. الرجاء التأكد من صحة الرابط (مثل https://example.com).`
        );
        return;
      }

      setIsLoading(true);
      setError(null);
      setProgress(0);
      setSitemaps([]); // Clear previous sitemap info
      setRows([]); // Clear previous rows when starting new sitemap extraction
      setSelectedRows(new Set());

      try {
        // Simulate progress for large file handling while waiting for backend
        const interval = setInterval(() => {
          setProgress(prev => (prev < 90 ? prev + 5 : prev)); // Incremental progress
        }, 500);

        // Use environment variable for backend URL
        const backendUrl = process.env.NEXT_PUBLIC_NESTJS_BACKEND_URL || 'http://localhost:3002';
        const apiUrl = `${backendUrl}/sitemap-parser/parse`;

        // Send extraction settings to the backend
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            baseUrl,
            settings: {
              // Pass only backend-relevant settings
              extractTitleH1: settings.extractTitleH1,
              parseMultimediaSitemaps: settings.parseMultimediaSitemaps,
              checkCanonical: settings.checkCanonical,
              estimateCompetition: settings.estimateCompetition,
            },
          }),
        });
        clearInterval(interval); // Clear interval when response received
        setProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'حدث خطأ ما أثناء جلب البيانات.');
        }

        const data: SitemapParserResponse = await response.json();

        // Store sitemap information found by backend
        if (data.sitemaps && Array.isArray(data.sitemaps)) {
          setSitemaps(data.sitemaps);
        } else {
          // Fallback: If sitemaps array is empty but we got URLs, infer a single sitemap info
          const extractedUrls = data.extractedUrls || data.urls;
          if (extractedUrls && extractedUrls.length > 0) {
            setSitemaps([{ url: baseUrl, urlCount: extractedUrls.length, status: 'success' }]);
          }
        }

        // Process URLs returned by the backend (which now include enriched data)
        // Check both 'urls' and 'extractedUrls' for backward compatibility
        const extractedUrls = data.extractedUrls || data.urls;
        if (extractedUrls && Array.isArray(extractedUrls) && extractedUrls.length > 0) {
          handleExtract(extractedUrls, true); // Pass enriched data, use initialCall=true
        } else {
          // Handle cases where no URLs are found
          if (data.sitemaps && data.sitemaps.length > 0) {
            setError('تم العثور على ملفات sitemap ولكن لم يتم استخراج أي روابط منها.');
          } else {
            setError('لم يتم العثور على أي ملفات sitemap أو روابط صالحة للموقع المحدد.');
          }
        }
      } catch (e: unknown) {
        // Fixed: 'e' is of type 'unknown'
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(errorMessage);
        setRows([]); // Clear rows on error
      } finally {
        setIsLoading(false);
        setProgress(0); // Reset progress after completion or error
      }
    },
    [handleExtract, settings, setError]
  ); // Added setError to dependency array

  // --- Row Selection & Management ---
  const handleSelect = useCallback(
    (id: number) => {
      const newSelected = new Set(selectedRows);
      newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
      setSelectedRows(newSelected);
    },
    [selectedRows]
  );

  const handleSelectAll = useCallback(
    (isChecked: boolean) => {
      if (isChecked) {
        const allIds = new Set(rows.map((row: KeywordExtractionRow) => row.id)); // Fixed: 'row' implicitly has 'any' type
        setSelectedRows(allIds);
      } else {
        setSelectedRows(new Set());
      }
    },
    [rows]
  );

  const clearTable = useCallback(() => {
    setRows([]);
    setSelectedRows(new Set());
    setUrlsText(''); // Clear text areas too on explicit clear
    setKeywordsText('');
    setSitemaps([]); // Clear sitemap info on clear
    setError(null);
  }, []);

  const handleRemoveSelectedRows = useCallback(() => {
    const remainingRows = rows.filter((row: KeywordExtractionRow) => !selectedRows.has(row.id)); // Fixed: 'row' implicitly has 'any' type
    setRows(remainingRows);
    setSelectedRows(new Set()); // Clear selection after removal
  }, [rows, selectedRows]);

  const handleRemoveUnselectedRows = useCallback(() => {
    const remainingRows = rows.filter((row: KeywordExtractionRow) => selectedRows.has(row.id)); // Fixed: 'row' implicitly has 'any' type
    setRows(remainingRows);
    setSelectedRows(new Set()); // Clear selection after removal
  }, [rows, selectedRows]);

  // --- Clipboard & Reset ---
  const copyToClipboard = useCallback(
    (text: string) => {
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = text;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
          document.execCommand('copy');
          setError('تم نسخ النص إلى الحافظة بنجاح.'); // Use error state for success message
        } catch (err: unknown) {
          // Fixed: 'err' is of type 'unknown'
          console.error('Failed to copy text:', err);
          setError('فشل نسخ النص إلى الحافظة.');
        } finally {
          document.body.removeChild(tempTextArea);
        }
      } else {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setError('تم نسخ النص إلى الحافظة بنجاح.'); // Use error state for success message
          })
          .catch((err: unknown) => {
            // Fixed: 'err' is of type 'unknown'
            console.error('Failed to copy text:', err);
            setError('فشل نسخ النص إلى الحافظة.');
          });
      }
    },
    [setError]
  ); // Depend on setError to show messages

  const handleCopySelected = useCallback(() => {
    const selectedData = rows.filter((row: KeywordExtractionRow) => selectedRows.has(row.id)); // Fixed: 'row' implicitly has 'any' type
    const textToCopy = selectedData
      .map((r: KeywordExtractionRow) => `${r.url}\t${r.keyword}`) // Fixed: 'r' implicitly has 'any' type
      .join('\n');
    copyToClipboard(textToCopy);
  }, [rows, selectedRows, copyToClipboard]);

  const resetExtraction = useCallback(() => {
    setRows([]);
    setSelectedRows(new Set());
    setUrlsText('');
    setKeywordsText('');
    setSitemaps([]);
    setError(null);
    setIsLoading(false);
    setProgress(0);
    // Do NOT reset settings here, as they are user preferences
  }, []);

  // --- Table Filtering & Sorting ---
  const [filterText, setFilterText] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof KeywordExtractionRow;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const filteredAndSortedRows = useMemo(() => {
    let filterableRows = [...rows];

    if (filterText) {
      filterableRows = filterableRows.filter(
        (
          row: KeywordExtractionRow // Fixed: 'row' implicitly has 'any' type
        ) =>
          Object.values(row).some((value: unknown) =>
            String(value).toLowerCase().includes(filterText.toLowerCase())
          )
      );
    }

    if (sortConfig !== null) {
      filterableRows.sort((a: KeywordExtractionRow, b: KeywordExtractionRow) => {
        // Fixed: 'a', 'b' implicitly have 'any' type
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle undefined/null values for sorting
        if (aValue === undefined || aValue === null)
          return sortConfig.direction === 'ascending' ? 1 : -1;
        if (bValue === undefined || bValue === null)
          return sortConfig.direction === 'ascending' ? -1 : 1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return sortConfig.direction === 'ascending'
            ? aValue === bValue
              ? 0
              : aValue
                ? -1
                : 1
            : aValue === bValue
              ? 0
              : aValue
                ? 1
                : -1;
        }
        return 0;
      });
    }
    return filterableRows;
  }, [rows, filterText, sortConfig]);

  const requestSort = useCallback(
    (key: keyof KeywordExtractionRow) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  return {
    rows,
    selectedRows,
    urlsText,
    keywordsText,
    sitemaps,
    isLoading,
    error,
    setError,
    progress,
    settings,
    filterText,
    sortConfig,
    setUrlsText,
    setKeywordsText,
    setSettings,
    setFilterText,
    requestSort,
    handleExtract,
    handleSelect,
    handleCopySelected,
    copyToClipboard,
    resetExtraction,
    handleExtractFromSitemap,
    handleSelectAll,
    clearTable,
    handleRemoveSelectedRows,
    handleRemoveUnselectedRows,
    filteredAndSortedRows, // Export the memoized function for direct use in component
  };
}
