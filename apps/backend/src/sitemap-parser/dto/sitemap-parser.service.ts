import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class SitemapParserService {
  async parseSitemap(sitemapUrl: string): Promise<string[]> {
    try {
      const response = await axios.get(sitemapUrl);
      const xmlData = response.data;
      const parsedData = await parseStringPromise(xmlData);

      // استخراج الروابط من بنية sitemap القياسية
      const urls = parsedData.urlset.url.map((entry: any) => entry.loc[0]);
      return urls;
    } catch (error) {
      throw new BadRequestException('لا يمكن جلب أو تحليل ملف sitemap. تأكد من أن الرابط صحيح ويمكن الوصول إليه.');
    }
  }
}