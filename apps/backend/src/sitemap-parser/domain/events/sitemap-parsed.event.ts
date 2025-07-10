/**
 * @domain SitemapParser
 * @layer Domain
 * @description حدث يطلق عند اكتمال تحليل Sitemap
 */

import { SitemapInfo, ParsedPageData } from '@internal-linking-analyzer-pro/types';

export class SitemapParsedEvent {
  constructor(
    public readonly baseUrl: string,
    public readonly sitemaps: SitemapInfo[],
    public readonly extractedUrls: ParsedPageData[],
    public readonly processingTimeMs: number,
    public readonly timestamp: Date = new Date()
  ) {}

  /**
   * الحصول على عدد URLs التي تم استخراجها
   */
  get totalUrlsExtracted(): number {
    return this.extractedUrls.length;
  }

  /**
   * الحصول على عدد Sitemaps التي تم تحليلها بنجاح
   */
  get successfulSitemaps(): number {
    return this.sitemaps.filter(sitemap => sitemap.status === 'success').length;
  }

  /**
   * الحصول على عدد Sitemaps التي فشل تحليلها
   */
  get failedSitemaps(): number {
    return this.sitemaps.filter(sitemap => sitemap.status === 'error').length;
  }
}
