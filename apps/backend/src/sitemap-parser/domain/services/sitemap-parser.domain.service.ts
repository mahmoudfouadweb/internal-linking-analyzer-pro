/**
 * @domain SitemapParser
 * @layer Domain
 * @implements ISitemapParserDomainService
 * @description خدمة مجال تحليل Sitemap - المنطق الأساسي لاكتشاف وتحليل Sitemaps
 */

import { ParsedPageData, SitemapInfo, ExtractionSettings } from '@internal-linking-analyzer-pro/types';

export class SitemapParserDomainService {
  /**
   * استخراج روابط Sitemap من ملف robots.txt
   * @param content - محتوى ملف robots.txt
   */
  extractSitemapsFromRobotsTxt(content: string): string[] {
    if (!content) return [];

    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.toLowerCase().startsWith('sitemap:'))
      .map(line => line.substring('sitemap:'.length).trim())
      .filter(url => url.startsWith('http://') || url.startsWith('https://'));
  }

  /**
   * تحديد نوع ملف Sitemap بناءً على امتداد الملف
   * @param url - عنوان URL الخاص ب Sitemap
   */
  getSitemapType(url: string): 'xml' | 'txt' {
    if (url.endsWith('.txt') || url.endsWith('.txt.gz')) {
      return 'txt';
    }
    return 'xml';
  }

  /**
   * استخراج كلمة مفتاحية من عنوان URL
   * @param url - عنوان URL للصفحة
   */
  extractKeywordFromURL(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = decodeURIComponent(urlObj.pathname);

      const cleanPath = pathname
        .replace(/\.(html|htm|php|asp|aspx|jsp|cfm)$/i, '')
        .replace(/^\//, '')
        .replace(/\/$/, '')
        .replace(/[-_]/g, ' ')
        .toLowerCase()
        .trim();

      if (!cleanPath) {
        return 'homepage';
      }

      // استخراج الجزء الأخير من المسار كاسم للصفحة
      const segments = cleanPath.split('/');
      return segments[segments.length - 1] || 'homepage';
    } catch {
      return 'unknown';
    }
  }

  /**
   * تحليل محتوى Sitemap من نوع TXT
   * @param content - محتوى ملف Sitemap
   */
  parseTxtSitemap(content: string): string[] {
    if (!content) return [];

    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && this.isValidUrl(line));
  }

  /**
   * حساب درجة المنافسة للصفحة بناءً على محتواها
   * @param textLength - طول النص
   * @param headerCount - عدد العناوين
   * @param hasMetaDescription - وجود وصف تعريفي
   * @param imagesCount - عدد الصور
   * @param imagesWithAltCount - عدد الصور مع نص بديل
   * @param hasStructuredData - وجود بيانات منظمة
   */
  calculateCompetitionScore(
    textLength: number,
    headerCount: number,
    hasMetaDescription: boolean,
    imagesCount: number,
    imagesWithAltCount: number,
    hasStructuredData: boolean
  ): number {
    let score = 0;

    // حساب الدرجة بناءً على طول المحتوى
    if (textLength > 1000) score += 1;
    if (textLength > 2000) score += 1;
    if (textLength > 3000) score += 1;

    // حساب الدرجة بناءً على عدد العناوين
    score += Math.min(headerCount / 10, 2);

    // وجود وصف تعريفي
    if (hasMetaDescription) {
      score += 1;
    }

    // نسبة الصور مع نص بديل
    if (imagesCount > 0) {
      score += (imagesWithAltCount / imagesCount) * 2;
    }

    // وجود بيانات منظمة
    if (hasStructuredData) {
      score += 2;
    }

    // توحيد الدرجة إلى نطاق 0-100
    return Math.min(Math.max(Math.round(score * 10), 0), 100);
  }

  /**
   * التحقق من صحة URL
   * @param url - عنوان URL للتحقق منه
   */
  isValidUrl(url: string): boolean {
    if (!url) return false;

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
