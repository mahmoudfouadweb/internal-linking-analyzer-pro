// إذا كان هناك مشاكل مع jest، قم بتثبيت @types/jest: npm i --save-dev @types/jest

import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { SitemapParserService } from './sitemap-parser.service';
import { BadRequestException, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';

interface SitemapParserResponse {
  urls: Array<{
    url: string;
    keyword: string;
    title?: string;
    h1?: string;
    isCanonical?: boolean;
    competition?: 'low' | 'medium' | 'high';
  }>;
  foundSitemaps?: string[];
}
describe('SitemapParserService', () => {
  let service: SitemapParserService;
  let httpService: HttpService;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitemapParserService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    })
    .setLogger(new Logger())
    .compile();

    service = module.get<SitemapParserService>(SitemapParserService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseWebsiteSitemaps', () => {
    it('should throw BadRequestException for invalid URL', async () => {
      await expect(
        service.parseWebsiteSitemaps('invalid-url', {
          extractTitle: false,
          extractH1: false,
          parseMultimediaSitemaps: false,
          checkCanonicalUrl: false,
          estimateCompetition: false,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should discover sitemap from robots.txt', async () => {
      const baseUrl = 'https://example.com';
      const robotsTxtContent = 'Sitemap: https://example.com/sitemap.xml';
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
            <loc>https://example.com/page1</loc>
          </url>
        </urlset>`;

      jest.spyOn(httpService, 'get')
        .mockReturnValueOnce(of({ data: robotsTxtContent, status: 200 } as any))
        .mockReturnValueOnce(of({ data: sitemapXml, status: 200 } as any));

      const result = await service.parseWebsiteSitemaps(baseUrl, {
        extractTitle: false,
        extractH1: false,
        parseMultimediaSitemaps: false,
        checkCanonicalUrl: false,
        estimateCompetition: false,
      });

      expect(result.extractedUrls).toHaveLength(1);
      expect(result.extractedUrls[0]?.url).toBe('https://example.com/page1');
      expect(result.extractedUrls[0]?.keyword).toBe('page1');
    });

    it.skip('should fallback to common sitemap paths when robots.txt fails', async () => {
      const baseUrl = 'https://example.com';
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
            <loc>https://example.com/page1</loc>
          </url>
        </urlset>`;

      const httpSpy = jest.spyOn(httpService, 'get');
      
      // Mock robots.txt failure
      httpSpy.mockReturnValueOnce(throwError(() => new Error('robots.txt not found')));
      
      // Mock successful sitemap.xml fetch (first common path)
      httpSpy.mockReturnValueOnce(of({ data: sitemapXml, status: 200 } as any));
      
      // Mock the actual sitemap content fetch
      httpSpy.mockReturnValueOnce(of({ data: sitemapXml, status: 200 } as any));

      const result = await service.parseWebsiteSitemaps(baseUrl, {
        extractTitle: false,
        extractH1: false,
        parseMultimediaSitemaps: false,
        checkCanonicalUrl: false,
        estimateCompetition: false,
      });

      expect(result.extractedUrls).toHaveLength(1);
      expect(result.extractedUrls[0]?.url).toBe('https://example.com/page1');
    });

    it('should throw BadRequestException when no sitemaps are found', async () => {
      const baseUrl = 'https://example.com';

      jest.spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('Not found')));

      await expect(
        service.parseWebsiteSitemaps(baseUrl, {
          extractTitle: false,
          extractH1: false,
          parseMultimediaSitemaps: false,
          checkCanonicalUrl: false,
          estimateCompetition: false,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });
});