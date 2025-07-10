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
import { IsUrl, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

// استيراد خدمات التطبيق
import { SitemapParserApplicationService } from './application/sitemap-parser.application.service';
// نحافظ على الاستيراد القديم للتوافق
import { SitemapParserService } from './sitemap-parser.service';

// استيراد الأنواع المشتركة
import { ExtractionSettings, SitemapParserResponse } from '@internal-linking-analyzer-pro/types';

// تعريف كائنات نقل البيانات (DTOs)
class ParseSitemapSettingsDto implements ExtractionSettings {
  @IsBoolean()
  @IsOptional()
  extractTitle?: boolean;

  @IsBoolean()
  @IsOptional()
  extractH1?: boolean;

  @IsBoolean()
  @IsOptional()
  parseMultimediaSitemaps?: boolean;

  @IsBoolean()
  @IsOptional()
  checkCanonicalUrl?: boolean;

  @IsBoolean()
  @IsOptional()
  estimateCompetition?: boolean;
}

class ParseSitemapDto {
  @IsUrl({}, { message: 'baseUrl يجب أن يكون رابط URL صالحًا.' })
  baseUrl!: string;

  @IsOptional()
  @Type(() => ParseSitemapSettingsDto)
  settings?: ParseSitemapSettingsDto;
}

@Controller('sitemap-parser')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class SitemapParserController {
  private readonly logger = new Logger(SitemapParserController.name);

  constructor(
    // حقن خدمة التطبيق الجديدة
    private readonly sitemapParserApplicationService: SitemapParserApplicationService,
    // نحافظ على الخدمة القديمة للتوافق
    private readonly sitemapParserService: SitemapParserService
  ) { }

  @Post('parse')
  async parseSitemap(@Body() parseSitemapDto: ParseSitemapDto): Promise<SitemapParserResponse> {
    try {
      const { baseUrl, settings } = parseSitemapDto;
      // توفير إعدادات افتراضية إذا لم يتم إرسالها من الواجهة الأمامية
      const effectiveSettings: ExtractionSettings = {
        extractTitleH1: settings?.extractTitle ?? false,
        extractH1: settings?.extractH1 ?? false,
        parseMultimediaSitemaps: settings?.parseMultimediaSitemaps ?? false,
        checkCanonical: settings?.checkCanonicalUrl ?? false,
        estimateCompetition: settings?.estimateCompetition ?? false,
        countWords: false,
        countInternalAndExternalLinks: false,
      };

      this.logger.log(`Received request to parse sitemap for: ${baseUrl}`);

      // استخدام خدمة التطبيق الجديدة
      const result = await this.sitemapParserApplicationService.parseWebsiteSitemaps(
        baseUrl,
        effectiveSettings,
      );

      return result;
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
