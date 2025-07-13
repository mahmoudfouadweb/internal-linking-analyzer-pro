/**
 * @domain SitemapParser
 * @layer Presentation
 * @description متحكم تحليل Sitemap في NestJS
 */

import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';

// استيراد خدمات التطبيق
import { SitemapParserApplicationService } from './application/sitemap-parser.application.service';

// استيراد الأنواع المشتركة
import { ExtractionSettings, SitemapParserResponse } from '@internal-linking-analyzer-pro/types';
import { ParseSitemapDto } from './dto/parse-sitemap.dto';

@Controller('sitemap-parser')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class SitemapParserController {
  private readonly logger = new Logger(SitemapParserController.name);

  constructor(
    // حقن خدمة التطبيق الجديدة
    private readonly sitemapParserApplicationService: SitemapParserApplicationService
  ) { }

  @Post('parse')
  async parseSitemap(@Body() parseSitemapDto: ParseSitemapDto): Promise<SitemapParserResponse & { processingTimeMs: number }> {
    const startTime = Date.now();

    try {
      const { baseUrl, settings } = parseSitemapDto;
      // توفير إعدادات افتراضية إذا لم يتم إرسالها من الواجهة الأمامية
      const effectiveSettings: ExtractionSettings = {
        extractTitleH1: settings?.extractTitleH1 ?? true,
        extractTitle: settings?.extractTitle ?? false,
        extractH1: settings?.extractH1 ?? false,
        parseMultimediaSitemaps: settings?.parseMultimediaSitemaps ?? false,
        checkCanonical: settings?.checkCanonical ?? false,
        estimateCompetition: settings?.estimateCompetition ?? false,
        countWords: settings?.countWords ?? false,
        countInternalAndExternalLinks: settings?.countInternalAndExternalLinks ?? false,
      };

      this.logger.log(`Received request to parse sitemap for: ${baseUrl} with settings:`, effectiveSettings);

      // استخدام خدمة التطبيق الجديدة
      const result = await this.sitemapParserApplicationService.parseWebsiteSitemaps(
        baseUrl,
        effectiveSettings,
      );

      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;

      return {
        ...result,
        processingTimeMs,
      };
    } catch (error: unknown) {
      this.logger.error(`Error parsing sitemap: ${error instanceof Error ? error.message : String(error)}`);

      // إعادة رمي استثناءات HTTP كما هي
      if (error instanceof HttpException) {
        throw error;
      }

      // بالنسبة لأي أخطاء غير متوقعة أخرى، إرجاع خطأ خادم داخلي
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        errorMessage || 'حدث خطأ غير متوقع أثناء تحليل sitemap.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
