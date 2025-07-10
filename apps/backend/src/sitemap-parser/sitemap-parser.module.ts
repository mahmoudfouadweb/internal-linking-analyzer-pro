/**
 * @domain SitemapParser
 * @layer Infrastructure
 * @description وحدة NestJS لتحليل Sitemap
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EventEmitterModule } from '@nestjs/event-emitter';

// التحكم
import { SitemapParserController } from './sitemap-parser.controller';

// خدمات المجال
import { SitemapParserDomainService } from './domain/services/sitemap-parser.domain.service';

// خدمات التطبيق
import { SitemapParserApplicationService } from './application/sitemap-parser.application.service';
import { ParseSitemapHandler } from './application/commands/parse-sitemap.handler';

// البنية التحتية والمستودعات
import { SitemapParserRepository } from './infrastructure/repositories/sitemap-parser.repository';
import { ISitemapParserRepository } from './domain/interfaces/sitemap-parser.repository.interface';

// للتوافق مع الكود القديم
import { SitemapParserService } from './sitemap-parser.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 (InternalLinkingAnalyzerPro/1.0)',
      },
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [SitemapParserController],
  providers: [
    // خدمات التطبيق
    SitemapParserApplicationService,
    ParseSitemapHandler,

    // خدمات المجال
    SitemapParserDomainService,

    // المستودعات
    {
      provide: 'ISitemapParserRepository',
      useClass: SitemapParserRepository,
    },

    // للتوافق مع الكود القديم
    SitemapParserService,
  ],
  exports: [
    SitemapParserApplicationService,
    SitemapParserService,
  ],
})
export class SitemapParserModule {}
