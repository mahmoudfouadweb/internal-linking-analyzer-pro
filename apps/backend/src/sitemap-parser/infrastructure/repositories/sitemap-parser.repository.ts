/**
 * @domain SitemapParser
 * @layer Infrastructure
 * @implements ISitemapParserRepository
 * @dependencies @nestjs/axios, zlib
 * @description تنفيذ مستودع تحليل Sitemap
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, timeout, retry } from 'rxjs';
import { promisify } from 'util';
import * as zlib from 'zlib';

import { ISitemapParserRepository } from '../../domain/interfaces/sitemap-parser.repository.interface';
import { SitemapInfo, ParsedPageData } from '@internal-linking-analyzer-pro/types';

@Injectable()
export class SitemapParserRepository implements ISitemapParserRepository {
  private readonly logger = new Logger(SitemapParserRepository.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * جلب محتوى URL مع دعم إعادة المحاولة
   * @param url - عنوان URL للمحتوى المطلوب
   * @param responseType - نوع الاستجابة (نص أو بيانات ثنائية)
   * @param maxRetries - الحد الأقصى لعدد المحاولات
   */
  async fetchUrlContent(
    url: string,
    responseType: 'text' | 'arraybuffer',
    maxRetries: number = 3
  ): Promise<string | ArrayBuffer | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await lastValueFrom(
          this.httpService.get(url, {
            responseType,
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; InternalLinkingAnalyzerPro/1.0; +http://example.com/bot)',
              'Accept-Encoding': 'gzip, deflate',
            },
          }).pipe(
            timeout(15000),
            retry(1)
          )
        );

        if (responseType === 'arraybuffer' && url.endsWith('.gz')) {
          // فك ضغط المحتوى المضغوط
          const gunzip = promisify(zlib.gunzip);
          const decompressed = await gunzip(Buffer.from(response.data));
          return decompressed.toString('utf-8');
        }

        return responseType === 'arraybuffer' ? response.data : response.data.toString();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        this.logger.warn(`Attempt ${attempt}/${maxRetries} failed for ${url}: ${lastError.message}`);

        if (attempt < maxRetries) {
          // انتظار قبل إعادة المحاولة مع زيادة فترة الانتظار تدريجياً
          await this.delay(1000 * attempt);
        }
      }
    }

    // فشلت جميع المحاولات
    this.logger.error(`Failed to fetch content from ${url} after ${maxRetries} attempts`);
    return null;
  }

  /**
   * حفظ معلومات عن sitemaps المكتشفة
   * @param sitemaps - معلومات Sitemap التي تم جمعها
   */
  async saveSitemapInfo(sitemaps: SitemapInfo[]): Promise<void> {
    // في هذه النسخة، لن نقوم بتخزين البيانات في قاعدة بيانات
    // يمكن إضافة منطق التخزين هنا في المستقبل
    this.logger.log(`[Mock] Saved ${sitemaps.length} sitemap information records`);
    return Promise.resolve();
  }

  /**
   * حفظ بيانات الصفحات المستخرجة من Sitemap
   * @param pages - بيانات الصفحات المستخرجة
   */
  async saveExtractedPages(pages: ParsedPageData[]): Promise<void> {
    // في هذه النسخة، لن نقوم بتخزين البيانات في قاعدة بيانات
    // يمكن إضافة منطق التخزين هنا في المستقبل
    this.logger.log(`[Mock] Saved ${pages.length} extracted page records`);
    return Promise.resolve();
  }

  /**
   * تأخير التنفيذ لعدد محدد من الميلي ثانية
   * @param ms - وقت التأخير بالميلي ثانية
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
