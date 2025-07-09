import { IsString, IsUrl, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ParseSitemapRequest } from '@internal-linking-analyzer-pro/types/sitemap';

export class ParseSitemapDto implements ParseSitemapRequest {
  @IsString()
  @IsUrl()
  baseUrl!: string;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  options?: {
    fetchTitles?: boolean;
    fetchH1?: boolean;
    checkCanonical?: boolean;
    estimateCompetition?: boolean;
    includeMedia?: boolean;
  };
}
