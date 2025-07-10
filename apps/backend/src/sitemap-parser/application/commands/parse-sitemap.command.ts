/**
 * @domain SitemapParser
 * @layer Application
 * @pattern CQRS Command
 * @description أمر لتحليل Sitemap
 */

import { ExtractionSettings } from '@internal-linking-analyzer-pro/types';

export class ParseSitemapCommand {
  constructor(
    public readonly baseUrl: string,
    public readonly settings: ExtractionSettings
  ) {}
}
