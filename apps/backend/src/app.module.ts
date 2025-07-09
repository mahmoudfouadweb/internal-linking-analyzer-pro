// apps/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SitemapParserModule } from './sitemap-parser/sitemap-parser.module'; // Import your new module
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule for environment variables

@Module({
  imports: [
    // ConfigModule.forRoot makes environment variables available throughout the app
    // isGlobal: true means you don't need to import it in other modules
    ConfigModule.forRoot({ isGlobal: true }),
    SitemapParserModule, // Add your SitemapParserModule here
    // Add other modules like AuthModule here if they exist
    // AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
