/**
 * @domain SitemapParser
 * @layer Domain
 * @description تعريف واجهة المستودع لخدمة تحليل Sitemap
 */

import { SitemapInfo, ParsedPageData } from '@internal-linking-analyzer-pro/types';

export interface ISitemapParserRepository {
  /**
   * جلب محتوى URL مع دعم إعادة المحاولة
   * @param url - عنوان URL للمحتوى المطلوب
   * @param responseType - نوع الاستجابة (نص أو بيانات ثنائية)
   * @param maxRetries - الحد الأقصى لعدد المحاولات
   */
  fetchUrlContent(url: string, responseType: 'text' | 'arraybuffer', maxRetries?: number): Promise<string | ArrayBuffer | null>;

  /**
   * حفظ معلومات عن sitemaps المكتشفة
   * @param sitemaps - معلومات Sitemap التي تم جمعها
   */
  saveSitemapInfo(sitemaps: SitemapInfo[]): Promise<void>;

  /**
   * حفظ بيانات الصفحات المستخرجة من Sitemap
   * @param pages - بيانات الصفحات المستخرجة
   */
  saveExtractedPages(pages: ParsedPageData[]): Promise<void>;
}
