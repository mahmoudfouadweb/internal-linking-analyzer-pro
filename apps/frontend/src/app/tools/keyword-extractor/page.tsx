/**
 * @author Mahmoud & Expert System
 * @description Keyword Extractor Tool Page - Simplified version
 * @created 2025-07-11
 */

'use client';

import { useState } from 'react';

export default function KeywordExtractorPage() {
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sitemapUrl.trim()) {
      setError('الرجاء إدخال رابط الموقع');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/sitemap-parser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: sitemapUrl,
          settings: {
            extractTitleH1: true,
            parseMultimediaSitemaps: false,
            checkCanonicalUrl: false, // تطابق مع DTO الخلفية
            estimateCompetition: false,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle both extractedUrls and urls for compatibility
      const extractedUrls = data.extractedUrls || data.urls || [];
      setResults(extractedUrls);
      
      if (extractedUrls.length === 0) {
        setError('لم يتم العثور على أي روابط في الموقع المحدد');
      }
      
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحليل الموقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          أداة استخراج الكلمات المفتاحية
        </h1>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="sitemap-url" className="block text-sm font-medium text-gray-700 mb-2">
                رابط الموقع أو Sitemap
              </label>
              <input
                id="sitemap-url"
                type="url"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                placeholder="https://example.com/ أو https://example.com/sitemap.xml"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري التحليل...' : 'تحليل الموقع'}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-800">
              <strong>خطأ:</strong> {error}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              النتائج ({results.length} رابط)
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الرابط
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الكلمة المفتاحية
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.slice(0, 50).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all"
                        >
                          {item.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.keyword || 'غير محدد'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {results.length > 50 && (
                <div className="mt-4 text-center text-gray-500">
                  عرض أول 50 نتيجة من أصل {results.length} نتيجة
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
