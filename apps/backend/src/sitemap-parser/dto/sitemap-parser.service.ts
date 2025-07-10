import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { parseStringPromise } from 'xml2js';
import { lastValueFrom, timeout, retry } from 'rxjs';
import * as cheerio from 'cheerio';
import {
  ExtractionSettings,
  ParsedPageData,
  SitemapInfo,
  SitemapParserResponse,
} from '@internal-linking-analyzer-pro/types';

@Injectable()
export class SitemapParserService {
  private readonly logger = new Logger(SitemapParserService.name);
  private readonly commonSitemapPaths = [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/sitemaps.xml',
    '/sitemap.txt',
  ];

  constructor(private readonly httpService: HttpService) {}

  async parseWebsiteSitemaps(
    baseUrl: string,
    settings: Partial<ExtractionSettings> = {},
  ): Promise<SitemapParserResponse> {
    // توفير القيم الافتراضية
    const defaultSettings: ExtractionSettings = {
      parseMultimediaSitemaps: false,
      estimateCompetition: false,
      countWords: false,
      countInternalAndExternalLinks: false,
    };

    const effectiveSettings = { ...defaultSettings, ...settings };

    if (!this.isValidUrl(baseUrl)) {
      throw new BadRequestException('Invalid URL format provided');
    }

    const cleanedBaseUrl = baseUrl.replace(/\/+$/, '');
    const sitemapsToProcess: Set<string> = new Set();
    const discoveredSitemapsInfo: SitemapInfo[] = [];

    try {
      // محاولة اكتشاف sitemap من robots.txt
      await this.discoverSitemapsFromRobotsTxt(cleanedBaseUrl, sitemapsToProcess);

      // إذا لم نجد أي sitemap، جرب المسارات الشائعة
      if (sitemapsToProcess.size === 0) {
        await this.fallbackToCommonPaths(cleanedBaseUrl, sitemapsToProcess);
      }

      if (sitemapsToProcess.size === 0) {
        throw new BadRequestException('Could not find any valid sitemap for the provided website');
      }

      const allExtractedUrls: ParsedPageData[] = [];
      const processedUrls = new Set<string>();

      // معالجة كل sitemap مكتشف
      for (const sitemapUrl of sitemapsToProcess) {
        try {
          const { sitemapInfo, extractedUrls } = await this.processSingleSitemap(
            sitemapUrl,
            effectiveSettings, // بدلاً من settings
            processedUrls,
          );

          discoveredSitemapsInfo.push(sitemapInfo);
          allExtractedUrls.push(...extractedUrls);
        } catch (error) {
          this.logger.error(`Failed to process sitemap ${sitemapUrl}:`, error);
          discoveredSitemapsInfo.push({
            url: sitemapUrl,
            status: 'error',
            urlCount: 0,
            type: 'xml',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return {
        success: true,
        message: 'Sitemap parsing completed successfully',
        sitemaps: discoveredSitemapsInfo,
        extractedUrls: allExtractedUrls,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error in parseWebsiteSitemaps: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private async discoverSitemapsFromRobotsTxt(
    baseUrl: string,
    sitemapsToProcess: Set<string>,
  ): Promise<void> {
    try {
      const robotsTxtUrl = `${baseUrl}/robots.txt`;
      const robotsTxtContent = await this.fetchUrlContentWithRetry(robotsTxtUrl, 'text');

      if (typeof robotsTxtContent === 'string') {
        const sitemapLinks = this.extractSitemapsFromRobotsTxt(robotsTxtContent);
        sitemapLinks.forEach((link) => sitemapsToProcess.add(link));
        this.logger.log(`Found ${sitemapLinks.length} sitemap(s) in robots.txt`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Could not fetch robots.txt: ${errorMessage}`);
    }
  }

  private async fallbackToCommonPaths(
    baseUrl: string,
    sitemapsToProcess: Set<string>,
  ): Promise<void> {
    this.logger.log('Trying common sitemap paths...');

    for (const path of this.commonSitemapPaths) {
      try {
        const sitemapUrl = `${baseUrl}${path}`;
        const content = await this.fetchUrlContentWithRetry(sitemapUrl, 'text');

        if (content) {
          sitemapsToProcess.add(sitemapUrl);
          this.logger.log(`Found sitemap at: ${sitemapUrl}`);
          break; // نكتفي بأول sitemap نجده
        }
      } catch (error) {
        // تجاهل الأخطاء واستمر في المحاولة
        continue;
      }
    }
  }

  private async processSingleSitemap(
    sitemapUrl: string,
    settings: ExtractionSettings,
    processedUrls: Set<string>,
  ): Promise<{ sitemapInfo: SitemapInfo; extractedUrls: ParsedPageData[] }> {
    const sitemapContent = await this.fetchUrlContentWithRetry(sitemapUrl, 'text');

    if (!sitemapContent || typeof sitemapContent !== 'string') {
      throw new Error('Could not fetch sitemap content');
    }

    let urls: string[] = [];

    // تحديد نوع الملف ومعالجته
    if (sitemapUrl.endsWith('.txt')) {
      urls = this.parseTxtSitemap(sitemapContent);
    } else {
      try {
        const parsedData = await parseStringPromise(sitemapContent);

        // التحقق من نوع sitemap
        if (parsedData.sitemapindex) {
          // معالجة sitemap index
          const indexUrls =
            parsedData.sitemapindex.sitemap?.map((entry: any) => entry.loc[0]) || [];

          // معالجة كل sitemap فرعي
          for (const indexUrl of indexUrls) {
            if (!processedUrls.has(indexUrl)) {
              processedUrls.add(indexUrl);
              try {
                const subResult = await this.processSingleSitemap(
                  indexUrl,
                  settings,
                  processedUrls,
                );
                urls.push(...subResult.extractedUrls.map((item) => item.url));
              } catch (error) {
                this.logger.warn(
                  `Failed to process sub-sitemap ${indexUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
              }
            }
          }
        } else if (parsedData.urlset) {
          // معالجة sitemap عادي
          urls = parsedData.urlset.url?.map((entry: any) => entry.loc[0]) || [];
        }
      } catch (parseError) {
        this.logger.error(`Failed to parse XML content for ${sitemapUrl}:`, parseError);
        throw new Error('Invalid XML format in sitemap');
      }
    }

    // استخراج البيانات من كل URL
    const extractedUrls: ParsedPageData[] = [];

    for (const url of urls) {
      if (!processedUrls.has(url)) {
        processedUrls.add(url);
        const pageData = await this.extractPageData(url, settings);
        extractedUrls.push(pageData);
      }
    }

    const sitemapInfo: SitemapInfo = {
      url: sitemapUrl,
      status: 'success',
      urlCount: urls.length,
      type: sitemapUrl.endsWith('.txt') ? 'txt' : 'xml',
    };

    return { sitemapInfo, extractedUrls };
  }

  private async extractPageData(
    url: string,
    settings: ExtractionSettings,
  ): Promise<ParsedPageData> {
    const pageData: ParsedPageData = {
      url,
      keyword: this.extractKeywordFromURL(url),
      status: 'pending',
    };

    try {
      // إذا لم تكن هناك إعدادات تتطلب جلب المحتوى، ارجع مباشرة
      if (!settings.countWords) {
        pageData.status = 'success';
        return pageData;
      }

      const htmlContent = await this.fetchUrlContentWithRetry(url, 'text');

      if (!htmlContent || typeof htmlContent !== 'string') {
        throw new Error('Could not fetch page content');
      }

      const $ = cheerio.load(htmlContent);

      if (settings.checkCanonicalUrl) {
        pageData.canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
      }

      if (settings.countWords) {
        pageData.wordCount = this.countWordsInHtml(htmlContent);
      }

      if (settings.countInternalAndExternalLinks) {
        const linkCounts = this.countInternalAndExternalLinks(url, htmlContent);
        pageData.internalLinks = linkCounts.internal;
        pageData.externalLinks = linkCounts.external;
      }

      if (settings.estimateCompetition) {
        pageData.competition = this.calculateCompetitionScore(htmlContent);
      }

      pageData.status = 'success';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error extracting page data for ${url}: ${errorMessage}`);
      pageData.status = 'error';
      pageData.errorMessage = errorMessage;
    }

    return pageData;
  }

  private async fetchUrlContentWithRetry(
    url: string,
    responseType: 'text' | 'arraybuffer',
    maxRetries: number = 3,
  ): Promise<string | ArrayBuffer | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await lastValueFrom(
          this.httpService
            .get(url, {
              responseType,
              timeout: 10000,
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; InternalLinkingAnalyzerPro/1.0)',
                'Accept-Encoding': 'gzip, deflate',
              },
            })
            .pipe(timeout(15000), retry(1)),
        );

        return responseType === 'arraybuffer' ? response.data : response.data.toString();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        this.logger.warn(
          `Attempt ${attempt}/${maxRetries} failed for ${url}: ${lastError.message}`,
        );

        if (attempt < maxRetries) {
          await this.delay(1000 * attempt);
        }
      }
    }

    throw lastError || new Error('Failed to fetch URL after retries');
  }

  private extractSitemapsFromRobotsTxt(robotsContent: string): string[] {
    const lines = robotsContent.split('\n');
    const sitemapUrls: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.toLowerCase().startsWith('sitemap:')) {
        const sitemapUrl = trimmedLine.substring(8).trim();
        if (this.isValidUrl(sitemapUrl)) {
          sitemapUrls.push(sitemapUrl);
        }
      }
    }

    return sitemapUrls;
  }

  private parseTxtSitemap(content: string): string[] {
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && this.isValidUrl(line));
  }

  private extractKeywordFromURL(url: string): string {
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

      return cleanPath || 'homepage';
    } catch (error) {
      this.logger.warn(
        `Could not extract keyword from URL ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return 'unknown';
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private countWordsInHtml(html: string): number {
    const $ = cheerio.load(html);
    const textContent = $('body').text();
    const words = textContent
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length;
  }

  private countInternalAndExternalLinks(
    baseUrl: string,
    html: string,
  ): { internal: number; external: number } {
    const $ = cheerio.load(html);
    const links = $('a[href]');
    let internal = 0;
    let external = 0;

    try {
      const baseUrlObj = new URL(baseUrl);
      const baseDomain = baseUrlObj.hostname;

      links.each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          try {
            const linkUrl = new URL(href, baseUrl);
            if (linkUrl.hostname === baseDomain) {
              internal++;
            } else {
              external++;
            }
          } catch {
            // Ignore invalid URLs
          }
        }
      });
    } catch (error) {
      this.logger.warn(
        `Error counting links for ${baseUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return { internal, external };
  }

  private calculateCompetitionScore(html: string): number {
    const $ = cheerio.load(html);

    let score = 0;

    // Basic scoring based on content length
    const textLength = $('body').text().length;
    if (textLength > 1000) score += 1;
    if (textLength > 2000) score += 1;
    if (textLength > 3000) score += 1;

    // Count of headers
    const headerCount = $('h1, h2, h3, h4, h5, h6').length;
    score += Math.min(headerCount / 10, 2);

    // Meta description presence
    if ($('meta[name="description"]').length > 0) {
      score += 1;
    }

    // Check for images with alt text
    const images = $('img').length;
    const imagesWithAlt = $('img[alt]').length;
    if (images > 0) {
      score += (imagesWithAlt / images) * 2;
    }

    // Check for structured data
    if ($('script[type="application/ld+json"]').length > 0) {
      score += 2;
    }

    // Normalize score to 0-100 range
    return Math.min(Math.max(Math.round(score * 10), 0), 100);
  }
}
