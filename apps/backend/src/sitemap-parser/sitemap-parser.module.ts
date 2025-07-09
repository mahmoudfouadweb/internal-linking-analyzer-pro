// apps/backend/src/sitemap-parser/sitemap-parser.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Required for making HTTP requests
import { SitemapParserService } from './sitemap-parser.service';
import { SitemapParserController } from './sitemap-parser.controller';

@Module({
  imports: [
    HttpModule.register({
      // Register HttpModule to make HTTP requests
      timeout: 10000, // 10 seconds timeout for HTTP requests
      maxRedirects: 5, // Allow up to 5 redirects
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 (InternalLinkingAnalyzerPro/1.0)',
      },
    }),
  ],
  providers: [SitemapParserService],
  controllers: [SitemapParserController],
})
export class SitemapParserModule {}
