/**
 * @fileoverview Sitemap Parser Service - Core business logic for sitemap discovery and parsing
 * @description This service handles the intelligent discovery and parsing of XML sitemaps from websites.
 * It supports multiple sitemap formats, robots.txt discovery, fallback to common paths, and advanced
 * content extraction features including title/H1 extraction, canonical URL checking, and competition estimation.
 *
 * @author Gemini
 * @created 2025-07-08
 * @lastModifiedBy Gemini
 * @lastModified 2025-07-09
 *
 * @architecture-compliance
 * - Follows NestJS service pattern with dependency injection
 * - Uses shared types from @internal-linking-analyzer-pro/types
 * - Implements comprehensive error handling and logging
 * - Supports advanced extraction settings for flexible functionality
 */

import { promisify } from 'util';
import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { parseStringPromise } from 'xml2js';
import { lastValueFrom } from 'rxjs';
import * as zlib from 'zlib';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { SitemapParserDomainService } from './domain/services/sitemap-parser.domain.service';

import {
  ExtractionSettings,
  SitemapInfo,
  ParsedPageData,
  SitemapParserResponse,
  SitemapType,
} from '@internal-linking-analyzer-pro/types';

@Injectable()
/**
 * Service responsible for parsing sitemaps from a given URL.
 * It handles fetching the sitemap, detecting its type (XML, TXT, or a sitemap index),
 * and extracting page data based on provided settings.
 */
export class SitemapParserService {
  private readonly logger = new Logger(SitemapParserService.name);

  private readonly commonSitemapPaths = [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/wp-sitemap.xml',
    '/sitemap.xml.gz',
    '/sitemap_index.xml.gz',
    '/sitemap.php',
    '/sitemap.txt',
    '/post-sitemap.xml',
    '/page-sitemap.xml',
    '/category-sitemap.xml',
    '/sitemap-index.xml',
    '/sitemap/index.xml',
    '/sitemap/sitemap.xml',
  ];

  constructor(
    private readonly httpService: HttpService,
    private readonly domainService: SitemapParserDomainService,
  ) { }

  /**
 * The main public method to discover and parse sitemaps for a website.
 * It orchestrates the entire process from robots.txt discovery, fallback to common paths,
 * processing sitemap indexes and individual sitemaps, and extracting page data.
 * @param baseUrl - The base URL of the website to parse.
 * @param settings - Configuration for the extraction process.
 * @returns A promise that resolves to a `SitemapParserResponse` object.
 */
  async parseWebsiteSitemaps(
    baseUrl: string,
    settings: ExtractionSettings,
  ): Promise<SitemapParserResponse> {
    if (!baseUrl || !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(baseUrl)) {
      throw new BadRequestException(
        'Invalid or malformed base URL provided. Please provide a valid URL including the protocol (http:// or https://).',
      );
    }

    const cleanedBaseUrl = baseUrl.replace(/\/+$/, '');
    const sitemapsToProcess: Set<string> = new Set();
    const discoveredSitemapsInfo: SitemapInfo[] = [];

    this.logger.log(`Attempting to discover sitemaps via robots.txt for ${cleanedBaseUrl}`);
    try {
      const robotsTxtUrl = `${cleanedBaseUrl}/robots.txt`;
      const robotsTxtContent = await this.fetchUrlContent(robotsTxtUrl, 'text');
      if (typeof robotsTxtContent === 'string') {
        const sitemapLinks = this.domainService.extractSitemapsFromRobotsTxt(robotsTxtContent);
        if (sitemapLinks.length > 0) {
          sitemapLinks.forEach((link) => sitemapsToProcess.add(link));
          this.logger.log(`Found sitemap(s) in robots.txt: ${sitemapLinks.join(', ')}`);
        } else {
          this.logger.warn(`No Sitemap directives found in robots.txt for ${cleanedBaseUrl}`);
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Could not fetch or parse robots.txt for ${cleanedBaseUrl}: ${errorMessage}`);
    }

    if (sitemapsToProcess.size === 0) {
      this.logger.log(`Falling back to common sitemap paths for ${cleanedBaseUrl}`);
      for (const path of this.commonSitemapPaths) {
        const sitemapCandidateUrl = `${cleanedBaseUrl}${path}`;
        try {
          // Use HEAD request for efficiency to check existence
          await lastValueFrom(this.httpService.head(sitemapCandidateUrl, { timeout: 5000 }));
          sitemapsToProcess.add(sitemapCandidateUrl);
          this.logger.log(`Found common sitemap path: ${sitemapCandidateUrl}`);
        } catch (e: unknown) {
          // This is expected if path doesn't exist, so debug log is appropriate
          this.logger.debug(`Common sitemap path not found or accessible: ${sitemapCandidateUrl}`);
        }
      }
    }

    if (sitemapsToProcess.size === 0) {
      throw new BadRequestException('Could not find any valid sitemap for the provided website.');
    }

    const allExtractedUrls: ParsedPageData[] = [];
    const processedSitemapsUrls: Set<string> = new Set();
    const sitemapProcessingQueue = Array.from(sitemapsToProcess);

    while (sitemapProcessingQueue.length > 0) {
      const currentSitemapUrl = sitemapProcessingQueue.shift();
      if (!currentSitemapUrl || processedSitemapsUrls.has(currentSitemapUrl)) {
        continue;
      }
      processedSitemapsUrls.add(currentSitemapUrl);

      this.logger.log(`Processing sitemap: ${currentSitemapUrl}`);
      const sitemapType = this.domainService.getSitemapType(currentSitemapUrl);
      let currentSitemapInfo: SitemapInfo = {
        url: currentSitemapUrl,
        status: 'error',
        urlCount: 0,
        type: sitemapType,
        success: false,
      };

      try {
        const sitemapContent = await this.fetchUrlContent(
          currentSitemapUrl,
          currentSitemapUrl.endsWith('.gz') ? 'arraybuffer' : 'text',
        );

        if (!sitemapContent) {
          throw new Error('Sitemap content is empty or could not be fetched.');
        }

        if (sitemapType === 'txt') {
          const urls = sitemapContent.toString().split(/\r?\n/).filter(Boolean);
          const pageDataPromises = urls.map(url => this.extractPageData(url, settings));
          const pages = await Promise.all(pageDataPromises);
          allExtractedUrls.push(...pages);
          currentSitemapInfo = { ...currentSitemapInfo, status: 'success', urlCount: pages.length, type: 'txt', success: true };
        } else { // XML processing
          const xmlContent = sitemapContent.toString();
          if (xmlContent.trim().startsWith('<') && (xmlContent.includes('<!DOCTYPE html>') || xmlContent.includes('<html'))) {
            throw new Error('Received HTML content instead of XML sitemap.');
          }

          const parsedXml = await parseStringPromise(xmlContent);

          if (parsedXml.sitemapindex && parsedXml.sitemapindex.sitemap) { // Sitemap Index
            currentSitemapInfo.type = 'xml';
            const childSitemaps = parsedXml.sitemapindex.sitemap.map((s: { loc: string[] }) => s.loc[0]).filter(Boolean);
            this.logger.log(`Discovered ${childSitemaps.length} child sitemaps in index: ${currentSitemapUrl}`);

            currentSitemapInfo.status = 'success';
            currentSitemapInfo.urlCount = childSitemaps.length;
            currentSitemapInfo.success = true;
            currentSitemapInfo.sitemapsFound = childSitemaps.map((childUrl: string) => ({ url: childUrl, status: 'pending' }));

            childSitemaps.forEach((childUrl: string) => {
              if (!processedSitemapsUrls.has(childUrl)) {
                sitemapProcessingQueue.push(childUrl);
              }
            });
          } else if (parsedXml.urlset && parsedXml.urlset.url) { // URL Set
            currentSitemapInfo.type = 'xml';
            const urlsInThisSitemap: string[] = parsedXml.urlset.url.map((entry: { loc: string[] }) => entry.loc[0]).filter(Boolean);
            currentSitemapInfo.status = 'success';
            currentSitemapInfo.urlCount = urlsInThisSitemap.length;
            currentSitemapInfo.success = true;
            this.logger.log(`Found ${urlsInThisSitemap.length} URLs in sitemap: ${currentSitemapUrl}`);

            const pageDataPromises = urlsInThisSitemap.map(url => this.extractPageData(url, settings));
            const pages = await Promise.all(pageDataPromises);
            allExtractedUrls.push(...pages);
          } else {
            throw new Error('Unsupported XML sitemap format or empty sitemap file.');
          }
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        this.logger.error(`Error processing sitemap ${currentSitemapUrl}: ${errorMessage}`);
        currentSitemapInfo.status = 'error';
        currentSitemapInfo.success = false;
        currentSitemapInfo.errorMessage = errorMessage;
      } finally {
        discoveredSitemapsInfo.push(currentSitemapInfo);
      }
    }

    return {
      success: true,
      message: 'Sitemap parsing completed successfully.',
      sitemaps: discoveredSitemapsInfo,
      extractedUrls: allExtractedUrls,
    };
  }

  private async fetchUrlContent(url: string, responseType: 'text' | 'arraybuffer'): Promise<string | null> {
    const gunzip = promisify(zlib.gunzip);
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          responseType: responseType,
        }),
      );

      if (response.status >= 400) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = response.data;

      if (url.endsWith('.gz')) {
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
        const decompressedData = await gunzip(buffer);
        return decompressedData.toString('utf-8');
      }

      return String(data);
    } catch (error) {
      let errorMessage: string;
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      this.logger.error(`Failed to fetch content from: ${url}. Reason: ${errorMessage}`);
      throw new Error(`Failed to fetch content from ${url}: ${errorMessage}`);
    }
  }

  private async extractPageData(url: string, settings: ExtractionSettings): Promise<ParsedPageData> {
    const pageData: ParsedPageData = {
      url: url,
      keyword: this.domainService.extractKeywordFromURL(url),
      status: 'pending',
      title: '',
      h1: '',
      canonicalUrl: '',
      isCanonical: false,
      wordCount: 0,
      internalLinks: 0,
      externalLinks: 0,
      competition: 0,
      errorMessage: '',
    };

    try {
      const htmlContent = await this.fetchUrlContent(url, 'text');
      if (!htmlContent) {
        throw new Error('Could not fetch page content.');
      }

      const $ = cheerio.load(htmlContent.toString());

      if (settings.extractTitleH1) {
        pageData.title = $('title').text().trim();
        pageData.h1 = $('h1').first().text().trim();
      }
      if (settings.checkCanonical) {
        pageData.canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
        pageData.isCanonical = pageData.canonicalUrl === url;
      }
      if (settings.countWords) {
        pageData.wordCount = this.countWordsInHtml(htmlContent.toString());
      }
      if (settings.countInternalAndExternalLinks) {
        const links = this.countInternalAndExternalLinks(url, htmlContent.toString());
        pageData.internalLinks = links.internal;
        pageData.externalLinks = links.external;
      }
      if (settings.estimateCompetition) {
        // Placeholder for competition estimation logic
        pageData.competition = Math.floor(Math.random() * 100) + 1; // Example random value
      }
      pageData.status = 'success';
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.logger.error(`Error extracting page data for ${url}: ${errorMessage}`);
      pageData.status = 'error';
      pageData.errorMessage = errorMessage;
    }
    return pageData;
  }

  private countWordsInHtml(htmlContent: string): number {
    const $ = cheerio.load(htmlContent);
    const text = $('body').text();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  private countInternalAndExternalLinks(baseUrl: string, htmlContent: string): { internal: number; external: number } {
    const $ = cheerio.load(htmlContent);
    let internalLinks = 0;
    let externalLinks = 0;

    $('a[href]').each((_i, link) => {
      const href = $(link).attr('href');
      if (href) {
        try {
          const url = new URL(href, baseUrl);
          if (url.hostname === new URL(baseUrl).hostname) {
            internalLinks++;
          } else {
            externalLinks++;
          }
        } catch (e) {
          this.logger.debug(`Invalid URL found: ${href}`);
        }
      }
    });
    return { internal: internalLinks, external: externalLinks };
  }


}
