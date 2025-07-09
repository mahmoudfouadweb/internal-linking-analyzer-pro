// apps/backend/src/sitemap-parser/sitemap-parser.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SitemapParserService } from './sitemap-parser.service';
import { IsUrl, IsBoolean, IsOptional } from 'class-validator'; // For validation
import { Type } from 'class-transformer'; // For nested objects

// Import shared interfaces from the 'packages/types' workspace
import { ExtractionSettings, SitemapParserResponse } from '@internal-linking-analyzer-pro/types';

// Define the DTO (Data Transfer Object) for the request body
class ParseSitemapSettingsDto implements ExtractionSettings {
  @IsBoolean()
  @IsOptional()
  extractTitleH1: boolean = false;

  @IsBoolean()
  @IsOptional()
  parseMultimediaSitemaps: boolean = false;

  @IsBoolean()
  @IsOptional()
  checkCanonical: boolean = false;

  @IsBoolean()
  @IsOptional()
  estimateCompetition: boolean = false;
}

class ParseSitemapDto {
  @IsUrl({}, { message: 'baseUrl يجب أن يكون رابط URL صالحًا.' })
  baseUrl!: string;

  @IsOptional()
  @Type(() => ParseSitemapSettingsDto) // Ensure nested object is validated
  settings?: ParseSitemapSettingsDto;
}

@Controller('sitemap-parser')
// Apply ValidationPipe globally or at controller level for DTO validation
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class SitemapParserController {
  constructor(private readonly sitemapParserService: SitemapParserService) {}

  @Post('parse')
  async parseSitemap(@Body() parseSitemapDto: ParseSitemapDto): Promise<SitemapParserResponse> {
    try {
      const { baseUrl, settings } = parseSitemapDto;
      // Provide default settings if not sent from frontend
      const effectiveSettings: ExtractionSettings = {
        extractTitleH1: settings?.extractTitleH1 ?? false,
        parseMultimediaSitemaps: settings?.parseMultimediaSitemaps ?? false,
        checkCanonical: settings?.checkCanonical ?? false,
        estimateCompetition: settings?.estimateCompetition ?? false,
      };

      const result = await this.sitemapParserService.parseWebsiteSitemaps(
        baseUrl,
        effectiveSettings,
      );
      return result;
    } catch (error: unknown) {
      // Fixed: 'error' is of type 'unknown'
      // Log the error for debugging
      console.error('Error in SitemapParserController:', error);
      // Return appropriate HTTP status codes based on error type
      if (error instanceof HttpException) {
        throw error;
      }
      // For any other unexpected errors, return InternalServerError
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        errorMessage || 'An unexpected error occurred during sitemap parsing.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
