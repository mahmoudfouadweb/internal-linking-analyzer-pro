/**
 * @domain SitemapParser
 * @layer Application
 * @pattern CQRS Command Handler
 * @description معالج أمر تحليل Sitemap
 */

import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { parseStringPromise } from 'xml2js';
import * as cheerio from 'cheerio';

import { ParseSitemapCommand } from './parse-sitemap.command';
import { SitemapParserDomainService } from '../../domain/services/sitemap-parser.domain.service';
import type { ISitemapParserRepository } from '../../domain/interfaces/sitemap-parser.repository.interface';
import { SitemapParsedEvent } from '../../domain/events/sitemap-parsed.event';
import {
  SitemapInfo,
  ParsedPageData,
  SitemapParserResponse,
  ExtractionSettings,
} from '@internal-linking-analyzer-pro/types';

@Injectable()
export class ParseSitemapHandler {
  private readonly logger = new Logger(ParseSitemapHandler.name);
  private readonly commonSitemapPaths = [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/wp-sitemap.xml',
    '/sitemap.xml.gz',
    '/sitemap_index.xml.gz',
    '/sitemap.php',
    '/sitemap.txt',
    '/post-sitemap.xml',
    '/page-sitemap.xml',
    '/category-sitemap.xml',
    '/sitemap-index.xml',
    '/sitemap/index.xml',
    '/sitemap/sitemap.xml',
  ];

  constructor(
    private readonly domainService: SitemapParserDomainService,
    @Inject('ISitemapParserRepository') private readonly repository: ISitemapParserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * معالجة أمر تحليل Sitemap
   * @param command - أمر التحليل
   */
  async execute(command: ParseSitemapCommand): Promise<SitemapParserResponse> {
    const startTime = Date.now();
    const { baseUrl, settings } = command;

    if (!this.domainService.isValidUrl(baseUrl)) {
      throw new BadRequestException(
        'Invalid or malformed base URL provided. Please provide a valid URL including the protocol (http:// or https://).',
      );
    }

    const cleanedBaseUrl = baseUrl.replace(/\/+$/, '');
    const sitemapsToProcess: Set<string> = new Set();
    const discoveredSitemapsInfo: SitemapInfo[] = [];

    this.logger.log(`Attempting to discover sitemaps via robots.txt for ${cleanedBaseUrl}`);

    // محاولة اكتشاف Sitemap من ملف robots.txt
    await this.discoverSitemapsFromRobotsTxt(cleanedBaseUrl, sitemapsToProcess);

    // إذا لم نجد أي Sitemap، نحاول المسارات الشائعة
    if (sitemapsToProcess.size === 0) {
      this.logger.log(`Falling back to common sitemap paths for ${cleanedBaseUrl}`);
      await this.tryCommonSitemapPaths(cleanedBaseUrl, sitemapsToProcess);
    }

    if (sitemapsToProcess.size === 0) {
      throw new BadRequestException('Could not find any valid sitemap for the provided website.');
    }

    const allExtractedUrls: ParsedPageData[] = [];
    const processedSitemapsUrls: Set<string> = new Set();
    const sitemapProcessingQueue = Array.from(sitemapsToProcess);

    // معالجة كل Sitemap مكتشف
    while (sitemapProcessingQueue.length > 0) {
      const currentSitemapUrl = sitemapProcessingQueue.shift();
      if (!currentSitemapUrl || processedSitemapsUrls.has(currentSitemapUrl)) {
        continue;
      }

      processedSitemapsUrls.add(currentSitemapUrl);
      this.logger.log(`Processing sitemap: ${currentSitemapUrl}`);

      try {
        const { sitemapInfo, childSitemaps, extractedPages } = await this.processSingleSitemap(
          currentSitemapUrl,
          settings,
        );

        discoveredSitemapsInfo.push(sitemapInfo);
        allExtractedUrls.push(...extractedPages);

        // إضافة Sitemaps الفرعية إلى قائمة المعالجة إذا وجدت
        childSitemaps.forEach((childUrl) => {
          if (!processedSitemapsUrls.has(childUrl)) {
            sitemapProcessingQueue.push(childUrl);
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error processing sitemap ${currentSitemapUrl}: ${errorMessage}`);

        discoveredSitemapsInfo.push({
          url: currentSitemapUrl,
          status: 'error',
          urlCount: 0,
          type: this.domainService.getSitemapType(currentSitemapUrl),
          errorMessage,
        });
      }
    }

    // حفظ البيانات المستخرجة
    await this.repository.saveSitemapInfo(discoveredSitemapsInfo);
    await this.repository.saveExtractedPages(allExtractedUrls);

    const processingTimeMs = Date.now() - startTime;

    // إطلاق حدث اكتمال التحليل
    const event = new SitemapParsedEvent(
      baseUrl,
      discoveredSitemapsInfo,
      allExtractedUrls,
      processingTimeMs,
    );

    this.eventEmitter.emit('sitemap.parsed', event);

    return {
      success: true,
      message: 'Sitemap parsing completed successfully',
      sitemaps: discoveredSitemapsInfo,
      extractedUrls: allExtractedUrls,
      processingTimeMs,
    };
  }

  /**
   * محاولة اكتشاف Sitemap من ملف robots.txt
   */
  private async discoverSitemapsFromRobotsTxt(
    baseUrl: string,
    sitemapsToProcess: Set<string>,
  ): Promise<void> {
    try {
      const robotsTxtUrl = `${baseUrl}/robots.txt`;
      const robotsTxtContent = await this.repository.fetchUrlContent(robotsTxtUrl, 'text');

      if (typeof robotsTxtContent === 'string') {
        const sitemapLinks = this.domainService.extractSitemapsFromRobotsTxt(robotsTxtContent);

        if (sitemapLinks.length > 0) {
          sitemapLinks.forEach((link) => sitemapsToProcess.add(link));
          this.logger.log(`Found sitemap(s) in robots.txt: ${sitemapLinks.join(', ')}`);
        } else {
          this.logger.warn(`No Sitemap directives found in robots.txt for ${baseUrl}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Could not fetch or parse robots.txt for ${baseUrl}: ${errorMessage}`);
    }
  }

  /**
   * محاولة المسارات الشائعة للبحث عن Sitemap
   */
  private async tryCommonSitemapPaths(
    baseUrl: string,
    sitemapsToProcess: Set<string>,
  ): Promise<void> {
    for (const path of this.commonSitemapPaths) {
      const sitemapUrl = `${baseUrl}${path}`;

      try {
        // استخدام HEAD request للتحقق من وجود الملف بكفاءة
        const content = await this.repository.fetchUrlContent(sitemapUrl, 'text');

        if (content) {
          sitemapsToProcess.add(sitemapUrl);
          this.logger.log(`Found common sitemap path: ${sitemapUrl}`);
          break; // نكتفي بأول sitemap صالح نجده
        }
      } catch (error) {
        // من المتوقع وجود أخطاء إذا لم يكن المسار موجوداً، لذا نتجاهلها
        this.logger.debug(`Common sitemap path not found or accessible: ${sitemapUrl}`);
        continue;
      }
    }
  }

  /**
   * معالجة ملف Sitemap واحد
   */
  private async processSingleSitemap(
    sitemapUrl: string,
    settings: ExtractionSettings,
  ): Promise<{
    sitemapInfo: SitemapInfo;
    childSitemaps: string[];
    extractedPages: ParsedPageData[];
  }> {
    const sitemapType = this.domainService.getSitemapType(sitemapUrl);
    const sitemapContent = await this.repository.fetchUrlContent(
      sitemapUrl,
      sitemapUrl.endsWith('.gz') ? 'arraybuffer' : 'text',
    );

    if (!sitemapContent) {
      throw new Error('Sitemap content is empty or could not be fetched.');
    }

    let sitemapInfo: SitemapInfo = {
      url: sitemapUrl,
      status: 'success',
      urlCount: 0,
      type: sitemapType,
    };

    let childSitemaps: string[] = [];
    let extractedPages: ParsedPageData[] = [];

    if (sitemapType === 'txt') {
      // معالجة Sitemap من نوع TXT
      const urls = this.domainService.parseTxtSitemap(sitemapContent.toString());
      sitemapInfo.urlCount = urls.length;

      extractedPages = await this.extractPageDataBatch(urls, settings);
    } else {
      // معالجة Sitemap من نوع XML
      const xmlContent = sitemapContent.toString();

      if (
        xmlContent.trim().startsWith('<') &&
        (xmlContent.includes('<!DOCTYPE html>') || xmlContent.includes('<html'))
      ) {
        throw new Error('Received HTML content instead of XML sitemap.');
      }

      const parsedXml = await parseStringPromise(xmlContent);

      if (parsedXml.sitemapindex && parsedXml.sitemapindex.sitemap) {
        // إذا كان الملف هو sitemap index
        childSitemaps = parsedXml.sitemapindex.sitemap
          .map((s: { loc: string[] }) => s.loc[0])
          .filter(Boolean);

        sitemapInfo.urlCount = childSitemaps.length;
        sitemapInfo.sitemapsFound = childSitemaps.map((childUrl: string) => ({
          url: childUrl,
          status: 'pending',
        }));

        this.logger.log(
          `Discovered ${childSitemaps.length} child sitemaps in index: ${sitemapUrl}`,
        );
      } else if (parsedXml.urlset && parsedXml.urlset.url) {
        // إذا كان الملف هو sitemap عادي
        const urls = parsedXml.urlset.url
          .map((entry: { loc: string[] }) => entry.loc[0])
          .filter(Boolean);

        sitemapInfo.urlCount = urls.length;
        this.logger.log(`Found ${urls.length} URLs in sitemap: ${sitemapUrl}`);

        extractedPages = await this.extractPageDataBatch(urls, settings);
      } else {
        throw new Error('Unsupported XML sitemap format or empty sitemap file.');
      }
    }

    return { sitemapInfo, childSitemaps, extractedPages };
  }

  /**
   * استخراج بيانات من مجموعة URLs
   */
  private async extractPageDataBatch(
    urls: string[],
    settings: ExtractionSettings,
  ): Promise<ParsedPageData[]> {
    const results: ParsedPageData[] = [];

    // معالجة 10 URLs في كل مرة لتجنب ضغط الخادم
    const batchSize = 10;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);

      const promises = batch.map((url) => this.extractPageData(url, settings));
      const batchResults = await Promise.all(promises);

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * استخراج بيانات من صفحة واحدة
   */
  private async extractPageData(
    url: string,
    settings: ExtractionSettings,
  ): Promise<ParsedPageData> {
    const pageData: ParsedPageData = {
      url,
      keyword: this.domainService.extractKeywordFromURL(url),
      status: 'pending',
    };

    // إذا لم نحتاج لتحليل المحتوى، نكتفي باستخراج الكلمة المفتاحية من URL
    if (
      !settings.countWords &&
      !settings.countInternalAndExternalLinks &&
      !settings.estimateCompetition
    ) {
      pageData.status = 'success';
      return pageData;
    }

    try {
      const htmlContent = await this.repository.fetchUrlContent(url, 'text');

      if (typeof htmlContent === 'string') {
        const $ = cheerio.load(htmlContent);

        if (settings.checkCanonicalUrl) {
          const canonicalUrl = $('link[rel="canonical"]').attr('href');
          if (canonicalUrl) {
            pageData.canonicalUrl = canonicalUrl;
            pageData.isCanonical = url === canonicalUrl;
          } else {
            pageData.isCanonical = true; // إذا لم يوجد canonical، فالصفحة الحالية هي canonical
          }
        }

        if (settings.countWords) {
          const textContent = $('body').text();
          pageData.wordCount = textContent
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
        }

        if (settings.countInternalAndExternalLinks) {
          const links = $('a[href]');
          let internal = 0;
          let external = 0;

          try {
            const baseUrlObj = new URL(url);
            const baseDomain = baseUrlObj.hostname;

            links.each((_, element) => {
              const href = $(element).attr('href');
              if (href) {
                try {
                  const linkUrl = new URL(href, url);
                  if (linkUrl.hostname === baseDomain) {
                    internal++;
                  } else {
                    external++;
                  }
                } catch {
                  // تجاهل روابط URL غير صالحة
                }
              }
            });

            pageData.internalLinks = internal;
            pageData.externalLinks = external;
          } catch (error) {
            this.logger.warn(
              `Error counting links for ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        }

        if (settings.estimateCompetition) {
          const textLength = $('body').text().length;
          const headerCount = $('h1, h2, h3, h4, h5, h6').length;
          const hasMetaDescription = $('meta[name="description"]').length > 0;
          const images = $('img').length;
          const imagesWithAlt = $('img[alt]').length;
          const hasStructuredData = $('script[type="application/ld+json"]').length > 0;

          const competitionScore = this.domainService.calculateCompetitionScore(
            textLength,
            headerCount,
            hasMetaDescription,
            images,
            imagesWithAlt,
            hasStructuredData,
          );

          pageData.competition = competitionScore;
        }
      }

      pageData.status = 'success';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error extracting page data for ${url}: ${errorMessage}`);
      pageData.status = 'error';
      pageData.errorMessage = errorMessage;
    }

    return pageData;
  }
}
