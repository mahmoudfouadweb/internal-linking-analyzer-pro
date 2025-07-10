/**
 * @domain SitemapParser
 * @layer Application
 * @implements SitemapParserService
 * @dependencies EventEmitter2
 * @description خدمة تطبيق تحليل Sitemap - طبقة التطبيق وفقًا لـ Clean Architecture
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ParseSitemapCommand } from './commands/parse-sitemap.command';
import { ParseSitemapHandler } from './commands/parse-sitemap.handler';
import { ExtractionSettings, SitemapParserResponse } from '@internal-linking-analyzer-pro/types';

@Injectable()
export class SitemapParserApplicationService {
  private readonly logger = new Logger(SitemapParserApplicationService.name);

  constructor(
    private readonly parseSitemapHandler: ParseSitemapHandler,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * تحليل sitemaps موقع ويب
   * هذه هي واجهة التطبيق الرئيسية التي تتعامل مع طلبات المستخدم
   * @param baseUrl - عنوان URL الأساسي للموقع
   * @param settings - إعدادات الاستخراج
   */
  async parseWebsiteSitemaps(
    baseUrl: string,
    settings: ExtractionSettings
  ): Promise<SitemapParserResponse> {
    this.logger.log(`Parsing sitemaps for website: ${baseUrl}`);

    const command = new ParseSitemapCommand(baseUrl, settings);

    try {
      return await this.parseSitemapHandler.execute(command);
    } catch (error) {
      // إعادة رمي الخطأ ليتم التعامل معه في طبقة المتحكم
      throw error;
    }
  }
}
