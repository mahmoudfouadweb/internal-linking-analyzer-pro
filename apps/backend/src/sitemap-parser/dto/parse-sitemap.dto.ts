import { IsString, IsUrl, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExtractionSettings } from '@internal-linking-analyzer-pro/types';

// نعرف DTO للإعدادات بشكل منفصل لتحسين إعادة الاستخدام
class ParseSitemapSettingsDto implements ExtractionSettings {
  @IsBoolean()
  @IsOptional()
  extractTitleH1?: boolean;

  @IsBoolean()
  @IsOptional()
  extractTitle?: boolean;

  @IsBoolean()
  @IsOptional()
  extractH1?: boolean;

  @IsBoolean()
  @IsOptional()
  countWords?: boolean;

  @IsBoolean()
  @IsOptional()
  countInternalAndExternalLinks?: boolean;

  @IsBoolean()
  @IsOptional()
  parseMultimediaSitemaps?: boolean;

  @IsBoolean()
  @IsOptional()
  checkCanonical?: boolean;

  @IsBoolean()
  @IsOptional()
  estimateCompetition?: boolean;
}

// ParseSitemapDto متوافق مع ParseSitemapRequest من حزمة types
export class ParseSitemapDto {
  @IsString()
  @IsUrl({}, { message: 'baseUrl يجب أن يكون رابط URL صالحًا.' })
  baseUrl!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ParseSitemapSettingsDto)
  settings?: ParseSitemapSettingsDto;
}
