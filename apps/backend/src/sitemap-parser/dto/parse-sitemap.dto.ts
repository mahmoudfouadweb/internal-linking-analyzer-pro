import { IsString, IsUrl, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// نعرف DTO للإعدادات بشكل منفصل لتحسين إعادة الاستخدام
class ParseSitemapSettingsDto {
  @IsBoolean()
  @IsOptional()
  extractTitleH1?: boolean;

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

// ParseSitemapDto متوافق مع ParseSitemapRequest من حزمة types
export class ParseSitemapDto {
  @IsString()
  @IsUrl({}, { message: 'baseUrl يجب أن يكون رابط URL صالحًا.' })
  baseUrl!: string;

  @IsOptional()
  @Type(() => ParseSitemapSettingsDto)
  settings?: ParseSitemapSettingsDto;
}
