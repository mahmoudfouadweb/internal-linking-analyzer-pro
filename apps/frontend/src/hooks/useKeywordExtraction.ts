/**
 * @author Gemini
 * @description Custom hook for managing the state and logic of the Keyword Extractor feature.
 * @created 2025-07-09
 * @lastModifiedBy Gemini
 * @lastModified 2025-07-09
 */

import { useState, useCallback, useMemo } from 'react';
import {
  KeywordExtractionRow,
  ExtractionSettings,
  SitemapInfo,
  ParsedPageData,
  SitemapParserResponse,
} from '@internal-linking-analyzer-pro/types';

// Default settings for the keyword extraction feature
const defaultSettings: ExtractionSettings = {
  extractTitleH1: true,
  detectDuplicates: true,
  parseMultimediaSitemaps: false,
  checkCanonical: false,
  estimateCompetition: false,
  urlCategorization: false,
  enableAdvancedTableFeatures: true,
};

/**
 * Custom hook for managing the state and logic of the Keyword Extractor feature.
 * This hook encapsulates all the business logic, state management, and API interactions
 * related to keyword extraction, providing a clean interface to the UI components.
 *
 * @returns An object containing state variables and handler functions.
 */
export const useKeywordExtraction = () => {
  const [rows, setRows] = useState<KeywordExtractionRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [urlsText, setUrlsText] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [sitemaps, setSitemaps] = useState<SitemapInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [settings, setSettings] = useState<ExtractionSettings>(defaultSettings);
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof KeywordExtractionRow; direction: 'ascending' | 'descending' } | null>(null);

    /**
   * Handles the extraction of keywords from a list of manually provided URLs.
   * This function is intended for simple, client-side URL processing where keywords are derived from the URL structure.
   * @param links - An array of ParsedPageData objects, typically containing only the URL.
   * @param reset - A boolean flag to determine if the existing rows should be cleared before adding new ones.
   */
  const handleExtract = useCallback(async (links: ParsedPageData[], reset: boolean) => {
    if (reset) {
      setRows([]);
      setSelectedRows(new Set());
    }
    // Extract keyword from URL if not provided
    const extractKeywordFromURL = (url: string): string => {
      try {
        const pathname = new URL(url).pathname;
        const decoded = decodeURIComponent(pathname);
        const cleanPath = decoded
          .replace(/\.(html|htm|php|asp|aspx|pdf|jpg|png|gif)$/i, '')
          .replace(/\/+$/, '');
        const segments = cleanPath.split('/').filter(Boolean);
        const filteredSegments = segments.filter(
          segment => !['blog', 'category', 'product', 'tag', 'archive', 'page', 'en', 'ar'].includes(segment.toLowerCase())
        );
        const keyword = filteredSegments.pop()?.replace(/-/g, ' ').trim();
        return keyword || 'لا توجد كلمة مفتاحية';
      } catch (error) {
        return 'رابط غير صالح';
      }
    };

    let currentId = reset ? 0 : rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 0;
    const newRows: KeywordExtractionRow[] = links.map((link) => ({
      id: currentId++,
      url: link.url,
      keyword: link.keyword || extractKeywordFromURL(link.url),
      // other properties would be populated by the backend
    }));
    setRows(prev => [...prev, ...newRows]);
  }, []);

    /**
   * Initiates the sitemap parsing process by calling the backend API.
   * It manages the loading state, errors, and processes the response to update the UI.
   * @param sitemapUrl - The URL of the sitemap to be parsed.
   */
  const handleExtractFromSitemap = useCallback(async (sitemapUrl: string) => {
    if (!sitemapUrl) {
      setError('Please enter a sitemap URL.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSitemaps([]);
    setRows([]);
    setSelectedRows(new Set());

    try {
      const response = await fetch('/api/sitemap-parser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: sitemapUrl, 
          settings: {
            extractTitleH1: settings.extractTitleH1,
            parseMultimediaSitemaps: settings.parseMultimediaSitemaps,
            checkCanonical: settings.checkCanonical,
            estimateCompetition: settings.estimateCompetition,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to parse sitemap.');
      }

      const data: SitemapParserResponse = await response.json();
      
      // Store sitemap information found by backend
      if (data.sitemaps && Array.isArray(data.sitemaps)) {
        setSitemaps(data.sitemaps);
      } else {
        // Fallback: If sitemaps array is empty but we got URLs, infer a single sitemap info
        const extractedUrls = data.extractedUrls || data.urls;
        if (extractedUrls && extractedUrls.length > 0) {
          setSitemaps([{ url: sitemapUrl, urlCount: extractedUrls.length, status: 'success' }]);
        }
      }
      
      // Process URLs returned by the backend
      const extractedUrls = data.extractedUrls || data.urls;
      if (extractedUrls && Array.isArray(extractedUrls) && extractedUrls.length > 0) {
        let currentId = 0;
        const newRows: KeywordExtractionRow[] = extractedUrls.map((page) => ({
          id: currentId++,
          url: page.url,
          keyword: page.keyword || 'N/A',
          title: page.title,
          h1: page.h1,
          isCanonical: page.isCanonical,
          canonicalUrl: page.canonicalUrl,
          competitionEstimate: page.competitionEstimate,
        }));
        setRows(newRows);
      } else {
        // Handle cases where no URLs are found
        if (data.sitemaps && data.sitemaps.length > 0) {
          setError('تم العثور على ملفات sitemap ولكن لم يتم استخراج أي روابط منها.');
        } else {
          setError('لم يتم العثور على أي ملفات sitemap أو روابط صالحة للموقع المحدد.');
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

    /**
   * Toggles the selection state of a single row in the results table.
   * @param id - The unique identifier of the row to select/deselect.
   */
  const handleSelect = useCallback((id: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

    /**
   * Toggles the selection state of all rows in the results table.
   * If all rows are already selected, it deselects all. Otherwise, it selects all.
   */
  const handleSelectAll = useCallback((isChecked: boolean) => {
    if (isChecked) {
      setSelectedRows(new Set(rows.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  }, [rows, selectedRows]);

    /**
   * Copies the URLs and keywords of the selected rows to the clipboard.
   */
  const handleCopySelected = useCallback(() => {
    const selectedData = rows.filter(row => selectedRows.has(row.id));
    const textToCopy = selectedData
      .map(r => `${r.url}\t${r.keyword}`)
      .join('\n');
    if (textToCopy) {
      copyToClipboard(textToCopy);
    } else {
      setError('No items selected or selected items are empty.');
    }
  }, [rows, selectedRows]);

    /**
   * A utility function to copy a given string to the user's clipboard.
   * It also provides user feedback by setting the error/success message.
   * @param text - The string to be copied.
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => setError('Text copied to clipboard successfully.'),
      () => setError('Failed to copy text.'),
    );
  };

    /**
   * Resets the entire state of the hook to its initial values.
   * This is used to clear all inputs, results, and status indicators.
   */
  const resetExtraction = useCallback(() => {
    setRows([]);
    setSelectedRows(new Set());
    setUrlsText('');
    setKeywordsText('');
    setSitemaps([]);
    setError(null);
    setIsLoading(false);
    setFilterText('');
    setSortConfig(null);
  }, []);

    /**
   * A convenience function that wraps resetExtraction. It's intended to be used for a "Clear All" button.
   */
  const clearTable = useCallback(() => {
    resetExtraction();
  }, [resetExtraction]);

    /**
   * Removes all currently selected rows from the results table.
   */
  const handleRemoveSelectedRows = useCallback(() => {
    setRows(prev => prev.filter(row => !selectedRows.has(row.id)));
    setSelectedRows(new Set());
  }, [selectedRows]);

    /**
   * Removes all rows that are NOT currently selected, keeping only the selected ones.
   */
  const handleRemoveUnselectedRows = useCallback(() => {
    setRows(prev => prev.filter(row => selectedRows.has(row.id)));
  }, [selectedRows]);

    /**
   * Handles sorting logic for the results table.
   * It toggles between ascending and descending order for a given column.
   * @param key - The key of the KeywordExtractionRow to sort by.
   */
  const requestSort = (key: keyof KeywordExtractionRow) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

    /**
   * A memoized function that computes the rows to be displayed in the table.
   * It first filters the rows based on the filterText and then sorts them based on the sortConfig.
   * This improves performance by avoiding recalculations on every render.
   * @returns A filtered and sorted array of KeywordExtractionRow.
   */
  const filteredAndSortedRows = useMemo(() => {
    let sortableItems = [...rows];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems.filter(
      item =>
        (item.keyword?.toLowerCase().includes(filterText.toLowerCase()) ||
        item.url?.toLowerCase().includes(filterText.toLowerCase()))
    );
  }, [rows, filterText, sortConfig]);

  return {
    rows,
    selectedRows,
    urlsText,
    keywordsText,
    sitemaps,
    isLoading,
    error,
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
    handleSelectAll,
    handleCopySelected,
    copyToClipboard,
    resetExtraction,
    handleExtractFromSitemap,
    clearTable,
    handleRemoveSelectedRows,
    handleRemoveUnselectedRows,
    filteredAndSortedRows,
  };
};
