import { Module } from '@nestjs/common';
import { SitemapParserController } from '../sitemap-parser.controller';
import { SitemapParserService } from './sitemap-parser.service';

@Module({
  controllers: [SitemapParserController],
  providers: [SitemapParserService],
})
export class SitemapParserModule {}