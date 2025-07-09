# Sitemap Parser Feature Module

**Version: 1.0**
**Owner: Core Infrastructure Team**
**Status: Active & Stable**

---

## 1. Core Purpose & Project Philosophy (لماذا تم إنشاؤه؟)

This module serves as the primary **Data Ingestion Gateway** for URL-based analysis. Its core responsibility is to abstract the complexity of fetching and parsing external resources (starting with sitemaps) and provide a clean, standardized list of URLs to the rest of the application.

**Philosophical Role:**

- **Encapsulation & Security:** It strictly isolates external network requests to the backend, preventing frontend exposure to CORS issues and other security vulnerabilities. The frontend should **never** know how to fetch a sitemap.
- **Single Responsibility Principle:** This module does one thing and does it well: it turns a sitemap URL into an array of strings. It is not concerned with what happens to these URLs afterward.
- **Foundation for Growth (MVP Mindset):** It was built as a foundational MVP service. Its simple input/output contract (`sitemapUrl` -> `string[]`) allows for massive future expansion without breaking existing consumers.

---

## 2. File & Code Structure (ماذا يحتوي المجلد؟)

- `/dto/parse-sitemap.dto.ts`:
  - **Function:** Defines the "Data Transfer Object" (DTO) for the request body. It specifies the shape and validation rules for incoming data.
  - **Key Logic:** Uses `class-validator`'s `@IsUrl()` decorator to ensure the `sitemapUrl` property is a valid URL string. The `!` modifier is used to satisfy strict TypeScript initialization rules, with the understanding that NestJS's `ValidationPipe` guarantees assignment.

- `/sitemap-parser.service.ts`:
  - **Function:** This is the brain of the module. It contains all the business logic for fetching and parsing the sitemap.
  - **Key Logic:**
    1.  Uses `axios` to perform an asynchronous `GET` request to the provided URL.
    2.  On success, it pipes the XML response data into `xml2js.parseStringPromise` to convert it into a JavaScript object.
    3.  It then maps over the expected object structure (`urlset.url[*].loc[0]`) to extract an array of URL strings.
    4.  Wraps the entire logic in a `try...catch` block to handle network errors or parsing failures, throwing a `BadRequestException` for clear error feedback.

- `/sitemap-parser.controller.ts`:
  - **Function:** This is the public-facing API endpoint. It exposes the service's functionality to the outside world.
  - **Key Logic:**
    - Defines a single `POST` route at `/sitemap-parser/parse`.
    - Uses the `@Body()` decorator to receive the request payload and automatically validate it against the `ParseSitemapDto` (since `ValidationPipe` is global).
    - Injects `SitemapParserService` via dependency injection and calls its `parseSitemap` method.
    - Wraps the resulting array in a `{ urls: [...] }` object for a consistent JSON response.

- `/sitemap-parser.module.ts`:
  - **Function:** The NestJS module definition file. It bundles the Controller and Service together, making them a single, cohesive unit.
  - **Key Logic:** Declares the `SitemapParserController` and `SitemapParserService` within the module's scope. This module is then imported into the root `AppModule` to activate it.

---

## 3. Connectivity & Dependencies (كيف يتصل ويعتمد؟)

- **Incoming Connections:**
  - This module is activated by being imported into `AppModule`.
  - Its endpoint (`/sitemap-parser/parse`) is designed to be called by our own **Frontend Application**. A proxy/rewrite is configured in `next.config.mjs` to forward requests from `/api/sitemap-parser/parse` to this backend endpoint.

- **Outgoing Connections / Dependencies:**
  - **`axios`**: For making external HTTP requests.
  - **`xml2js`**: For parsing XML data.
  - **`@nestjs/common` & `@nestjs/core`**: Core NestJS framework modules.
  - **`class-validator`**: For DTO validation.

---

## 4. Maintenance & Testing (كيفية صيانته واختباره؟)

- **Maintenance:**
  - Primary maintenance involves keeping `axios` and `xml2js` dependencies up-to-date to patch security vulnerabilities.
  - Any changes to the core logic in `sitemap-parser.service.ts` must be accompanied by updated unit tests.

- **Testing Strategy:**
  - **Unit Tests (`*.service.test.ts`):** Focus on the `SitemapParserService`. Use `jest.mock()` to mock the `axios` and `xml2js` modules.
    - **Test Case 1 (Success):** Mock `axios.get` to return a valid XML string. Verify that the service returns the expected array of URLs.
    - **Test Case 2 (Network Failure):** Mock `axios.get` to throw an error. Verify that the service catches it and throws a `BadRequestException`.
    - **Test Case 3 (Parsing Failure):** Mock `axios.get` to return an invalid XML string. Verify that `xml2js`'s failure is caught and results in a `BadRequestException`.
  - **Integration Tests (`*.controller.e2e-test.ts`):** Focus on the `SitemapParserController`. Use `supertest` to make real HTTP requests to the running application instance.
    - **Test Case 1 (Valid Body):** Send a POST request with a valid `sitemapUrl`. Mock the `SitemapParserService` to return a sample array. Assert that the HTTP response is `200 OK` and the body matches the expected output.
    - **Test Case 2 (Invalid Body):** Send a POST request with a malformed body (e.g., not a URL). Assert that the global `ValidationPipe` works and the HTTP response is `400 Bad Request`.

---

## 5. Future Expansion (كيفية توسعته؟)

This module is designed for easy expansion.

- **To Support a New Format (e.g., CSV):**
  1.  Create a new method in `sitemap-parser.service.ts`, e.g., `parseCsv(fileContent: string)`.
  2.  Create a new DTO in the `/dto` folder for the CSV request.
  3.  Create a new endpoint in `sitemap-parser.controller.ts`, e.g., `@Post('parse-csv')`.
  4.  This new endpoint will use the new service method. The core `parseSitemap` logic remains untouched and safe.

- **To Handle Sitemap Indexes:** 1. Modify the `parseSitemap` service method. 2. After parsing, check if the root element is `<sitemapindex>` instead of `<urlset>`. 3. If it is, recursively call `parseSitemap` for each `<loc>` found within the index. 4. Flatten the results into a single array. 5. Existing unit tests must be updated to cover this new recursive logic.

        استكمال والنسخة الحديثة
        دليل المنطق العميق لوكيل الذكاء الاصطناعي (AI Agent Deep Logic Guide)

  الهدف: هذا الملف يرشد وكيل الذكاء الاصطناعي (AI Agent) الذي يعمل على هذا المشروع، لضمان فهمه العميق للمنطق، عملية التنفيذ، الاختبار، وإصلاح الأخطاء بطريقة متسقة ومنهجية تعكس أفضل الممارسات التي بني عليها هذا النظام.

الغرض: يجب على الوكيل فهم أن كل خطوة مصممة لضمان المرونة، الكفاءة، وتقديم قيمة مضافة للمستخدم النهائي، مع الحفاظ على فصل واضح للمسؤوليات بين الـ Frontend والـ Backend ضمن بنية الـ Monorepo.

1. فهم المنطق الأساسي للعملية (Core Operational Logic)
   يجب على وكيل الذكاء الاصطناعي أن يستوعب أن عملية استخراج الكلمات المفتاحية من Sitemap ليست مجرد سلسلة خطية من الخطوات، بل هي دورة تفاعلية ومرنة. يجب أن يركز على فصل الاهتمامات بين الـ apps/backend (مسؤول عن المنطق الأساسي، الجلب، التحليل) والـ apps/frontend (مسؤول عن واجهة المستخدم، التفاعل، عرض البيانات).

المدخل (Input Variability):

المدخل الأساسي هو رابط موقع ويب (Base URL)، وليس بالضرورة رابط Sitemap مباشر.

توقع أن المستخدم قد يدخل روابط صحيحة أو خاطئة، أو مواقع بدون robots.txt، أو مواقع ذات Sitemaps متعددة/معقدة.

اكتشاف Sitemap الذكي (Intelligent Sitemap Discovery - Backend Responsibility):

الأولوية القصوى هي robots.txt: يجب على الـ Backend دائمًا محاولة جلب وتحليل robots.txt أولاً. هذه هي الطريقة المعيارية والموثوقة لاكتشاف Sitemaps.

الاستمرارية والمرونة: في حالة فشل robots.txt (مثل عدم وجود الملف، أو خطأ في الجلب، أو عدم ذكر Sitemap فيه)، يجب أن ينتقل الـ Backend تلقائيًا لمحاولة المسارات الشائعة والمعروفة لملفات Sitemap.

التعامل مع sitemap_index.xml: عند اكتشاف sitemap_index.xml، يجب على الـ Backend تنفيذ عملية تحليل متكررة (recursive parsing) لجلب جميع ملفات Sitemap الفرعية الموجودة فيه. هذا يضمن تغطية شاملة للموقع.

ملفات Sitemap المتعددة: يجب على الـ Backend جمع معلومات عن جميع ملفات Sitemap المكتشفة (بما في ذلك الفرعية) وحالتها (نجاح/خطأ) وعدد الروابط المستخرجة منها، وإعادتها إلى الـ Frontend.

التحليل الغني للبيانات (Rich Data Analysis - Backend & Frontend Collaboration):

الميزات الاختيارية: العديد من ميزات التحليل (مثل استخراج <title>/<h1>، فحص Canonical، تقدير المنافسة، تحليل Sitemaps للوسائط المتعددة) هي ميزات اختيارية يتحكم بها المستخدم من الـ Frontend.

تمرير الإعدادات: يجب على الـ Frontend دائمًا تمرير حالة هذه الإعدادات إلى الـ Backend مع كل طلب تحليل.

تكييف الـ Backend: يجب على الـ Backend تكييف عملية الجلب والتحليل بناءً على هذه الإعدادات (مثلاً، جلب محتوى الصفحات لتحليل <title>/<h1> فقط عند تفعيل الميزة).

البيانات المهيكلة: يجب أن يعيد الـ Backend بيانات مهيكلة وغنية بالمعلومات (الـ URL، الكلمة المفتاحية، Title، H1، حالة Canonical، تقدير المنافسة، تصنيف الـ URL) لتسهيل عرضها ومعالجتها في الـ Frontend.

العرض التفاعلي وإدارة البيانات (Interactive Display & Data Management - Frontend Responsibility):

تغذية راجعة واضحة: يجب على الـ Frontend توفير مؤشرات تحميل واضحة، رسائل خطأ مفهومة (باستخدام AlertDialog بدلاً من alert())، وشريط تقدم للعمليات الطويلة.

عرض Sitemap المكتشفة: يجب أن تعرض الواجهة الأمامية بوضوح جميع ملفات Sitemap التي اكتشفها الـ Backend، وتتيح للمستخدم إمكانية اختيار أي منها (أو كلها) للمعالجة.

إدارة الجدول: توفير أدوات قوية لإدارة البيانات المستخرجة في الجدول (تصفية، فرز، تحديد/إلغاء تحديد، حذف الصفوف المحددة/غير المحددة).

المزامنة الثنائية: يجب أن تظل صناديق النصوص (URLs و Keywords) متزامنة مع بيانات الجدول لتوفير مرونة للمستخدم.

الحفاظ على التفضيلات: يجب حفظ إعدادات المستخدم (تفضيلات الميزات المتقدمة) في التخزين المحلي للمتصفح لتجربة مستخدم متسقة.

2. آلية التنفيذ خطوة بخطوة (Step-by-Step Implementation Flow)
   يجب على وكيل الذكاء الاصطناعي اتباع هذه الخطوات عند تطبيق أي تعديل أو ميزة جديدة:

فهم المتطلب بدقة: تحليل المتطلب لتحديد ما إذا كان يؤثر على الـ Frontend، الـ Backend، أو كليهما.

التصميم أولاً: قبل كتابة الكود، قم بتصميم الواجهات (Interfaces) اللازمة لأي بيانات جديدة. يجب وضع الواجهات المشتركة في D:\Freelance\SEO\internal-linking-analyzer-pro\packages\types\src\sitemap.ts.

تعديل الـ Backend (apps/backend - إن لزم الأمر):

المسار: D:\Freelance\SEO\internal-linking-analyzer-pro\apps\backend\src\sitemap-parser\

الملفات الرئيسية: sitemap-parser.module.ts, sitemap-parser.service.ts, sitemap-parser.controller.ts

ملف الـ DTO: D:\Freelance\SEO\internal-linking-analyzer-pro\apps\backend\src\sitemap-parser\dto\parse-sitemap.dto.ts

الخطوات:

انتقل إلى مجلد الـ Backend: cd D:\Freelance\SEO\internal-linking-analyzer-pro\apps\backend.

قم بتعديل الـ Service لتنفيذ المنطق الجديد (مثل قراءة robots.txt، جلب صفحات، تحليل HTML باستخدام cheerio، التعامل مع Gzip).

تأكد من أن الـ Service تُرجع البيانات الجديدة المطلوبة من الـ Frontend (ParsedPageData[], SitemapInfo[]).

حدث الـ DTO في الـ Controller لاستقبال أي إعدادات جديدة من الـ Frontend.

تأكد من تسجيل SitemapParserModule في D:\Freelance\SEO\internal-linking-analyzer-pro\apps\backend\src\app.module.ts.

تأكد من تمكين CORS في D:\Freelance\SEO\internal-linking-analyzer-pro\apps\backend\src\main.ts لبيئة التطوير.

ارجع إلى المجلد الرئيسي: cd D:\Freelance\SEO\internal-linking-analyzer-pro.

تعديل الـ Frontend (apps/frontend - إن لزم الأمر):

المسار: D:\Freelance\SEO\internal-linking-analyzer-pro\apps\frontend\src\features\keyword-extractor\

الملفات الرئيسية: hooks/useKeywordExtraction.ts, components/KeywordExtractor.tsx

الخطوات:

انتقل إلى مجلد الـ Frontend: cd D:\Freelance\SEO\internal-linking-analyzer-pro\apps\frontend.

في src/features/keyword-extractor/hooks/useKeywordExtraction.ts:

استورد الواجهات من @internal-linking-analyzer-pro/types/sitemap.

عدّل دوال معالجة البيانات لتستقبل وتستخدم البيانات الجديدة القادمة من الـ Backend.

تأكد من إرسال الإعدادات الجديدة في طلب الـ Backend.

تأكد من استخدام متغير البيئة لعنوان الـ Backend:

const backendUrl = process.env.NEXT_PUBLIC_NESTJS_BACKEND_URL || 'http://localhost:3001';
const response = await fetch(`${backendUrl}/sitemap-parser/parse`, {
// ...
});

أضف منطق إدارة الإعدادات (حفظ/تحميل من localStorage).

أضف منطق التصفية والفرز للجدول.

أضف دوال حذف الصفوف.

في src/features/keyword-extractor/components/KeywordExtractor.tsx:

استورد الواجهات من @internal-linking-analyzer-pro/types/sitemap والـ hook.

قم بتحديث واجهة المستخدم لعرض أي بيانات جديدة (أعمدة جديدة في الجدول).

أضف لوحة الإعدادات وعناصر التحكم (Checkboxes) للميزات الاختيارية.

استخدم مكونات shadcn/ui (مثل AlertDialog, Dialog, Checkbox, Label, Separator) لتوفير تجربة مستخدم متسقة وجذابة.

تأكد من استخدام AlertDialog لرسائل الأخطاء والتنبيهات.

أضف حقول التصفية وأزرار الفرز للجدول.

أضف أزرار حذف الصفوف.

ارجع إلى المجلد الرئيسي: cd D:\Freelance\SEO\internal-linking-analyzer-pro.

التعامل مع متغيرات البيئة: تأكد دائمًا من وجود ملف .env.local في مجلد D:\Freelance\SEO\internal-linking-analyzer-pro\apps\frontend\ يحتوي على NEXT_PUBLIC_NESTJS_BACKEND_URL=http://localhost:3001 (مع تحديث العنوان عند النشر).

3. المكتبات والأوامر اللازمة (Required Libraries & Commands)
   يجب على وكيل الذكاء الاصطناعي التأكد من تثبيت المكتبات الصحيحة واستخدام الأوامر المناسبة من المجلد الرئيسي (root) للمشروع D:\Freelance\SEO\internal-linking-analyzer-pro.

المكتبات الجديدة لـ NestJS Backend (apps/backend):

@nestjs/axios (لطلبات HTTP)

xml2js (لتحليل XML)

cheerio (لتحليل HTML بشكل موثوق)

class-validator (للتحقق من صحة DTOs)

class-transformer (لتحويل DTOs)

@types/xml2js (TypeScript typings لـ xml2js)

@types/cheerio (TypeScript typings لـ cheerio)

ملحوظة: zlib هو جزء من Node.js، لا يحتاج لتثبيت منفصل ولكنه مستخدم في الخدمة لفك ضغط gzip.

المكتبات الجديدة لـ Next.js Frontend (apps/frontend):

lucide-react (للأيقونات)

مكونات shadcn/ui: (يجب إعدادها أولاً).

@radix-ui/react-checkbox

@radix-ui/react-dialog

@radix-ui/react-alert-dialog

@radix-ui/react-label

@radix-ui/react-separator

class-variance-authority

clsx

tailwind-merge

tailwindcss-animate

أوامر التثبيت (من المجلد الرئيسي D:\Freelance\SEO\internal-linking-analyzer-pro):

# تثبيت التبعيات لـ Backend

pnpm add @nestjs/axios xml2js cheerio class-validator class-transformer -w --filter ./apps/backend
pnpm add -D @types/xml2js @types/cheerio -w --filter ./apps/backend

# تثبيت التبعيات لـ Frontend

pnpm add lucide-react -w --filter ./apps/frontend

# إذا لم تكن مكونات shadcn/ui مثبتة بالفعل، قم بتشغيل هذا الأمر من الـ ROOT

# pnpm dlx shadcn-ui@latest add button input textarea dialog alert-dialog checkbox table label separator card badge --cwd apps/frontend

شرح: استخدام pnpm add -w --filter ./apps/<app-name> يضمن تثبيت التبعيات في المجلد الفرعي الصحيح ضمن بيئة الـ Monorepo، مع الحفاظ على إدارة الـ workspace بواسطة pnpm.

أوامر التشغيل (من المجلد الرئيسي D:\Freelance\SEO\internal-linking-analyzer-pro):

# لتشغيل الـ Backend

pnpm run start:dev --filter=./apps/backend

# لتشغيل الـ Frontend

pnpm run dev --filter=./apps/frontend

شرح: استخدام pnpm run --filter= يسمح لك بتشغيل السكريبتات المعرفة في package.json الخاص بكل تطبيق فرعي مباشرة من المجلد الرئيسي للمشروع.

4. كيفية الاختبار (How to Test)
   يجب أن يتبع وكيل الذكاء الاصطناعي منهجية اختبار شاملة لضمان الجودة. تذكر أن اختبارات الـ Backend تتم في D:\Freelance\SEO\internal-linking-analyzer-pro\apps\backend\test\ و D:\Freelance\SEO\internal-linking-analyzer-pro\apps\backend\src\sitemap-parser\sitemap-parser.service.test.ts.

اختبار الوحدة (Unit Tests - Backend - apps/backend):

اختبار دالة extractKeywordFromURL في الـ Service مع أنواع مختلفة من الروابط.

اختبار دالة extractSitemapsFromRobotsTxt مع محتوى robots.txt مختلف (بما في ذلك عدم وجود Sitemap:).

اختبار دوال extractTitle، extractH1، extractCanonical مع مقتطفات HTML متنوعة (بما في ذلك حالات عدم وجود العلامة).

اختبار قدرة الخدمة على جلب محتوى من URLs مختلفة (نجاح/فشل، Gzip).

اختبار منطق parseWebsiteSitemaps لاكتشاف Sitemap (من robots.txt، من المسارات الشائعة، لا شيء).

اختبار تحليل sitemap_index.xml والتحقق من جلب جميع الروابط الفرعية.

اختبار جلب وتحليل محتوى الصفحات عند تفعيل extractTitleH1 و checkCanonical عبر الإعدادات.

اختبار التكامل (Integration Tests - Backend - apps/backend):

إرسال طلبات POST إلى http://localhost:3001/sitemap-parser/parse (أو العنوان الخاص بالـ Backend) مع baseUrl وإعدادات مختلفة.

التحقق من أن الـ Backend يقوم باكتشاف robots.txt بشكل صحيح.

التحقق من أن الـ Backend ينتقل إلى المسارات الشائعة عند فشل robots.txt.

اختبار تحليل sitemap_index.xml والتحقق من جلب جميع الروابط الفرعية.

اختبار جلب وتحليل محتوى الصفحات عند تفعيل extractTitleH1 و checkCanonical.

اختبار استجابات الأخطاء (Invalid URL, No Sitemap Found, Parsing Error).

اختبار الواجهة الأمامية (Frontend Testing - apps/frontend):

الواجهة المرئية: التأكد من أن جميع عناصر الـ UI (الأزرار، صناديق النصوص، الجدول، خانات الاختيار للإعدادات، رسائل الخطأ) تظهر بشكل صحيح وتتفاعل كما هو متوقع.

سير العمل الأساسي:

استخراج الكلمات المفتاحية من قائمة URLs يدوية.

استخراج الكلمات المفتاحية من Sitemap باستخدام رابط موقع، والتحقق من عرض معلومات Sitemap المكتشفة.

اختبار الإعدادات:

تفعيل/تعطيل كل ميزة في لوحة الإعدادات والتحقق من أن سلوك الأداة يتغير وفقًا لذلك (ظهور/اختفاء الأعمدة في الجدول، تفعيل/تعطيل منطق معين).

التأكد من أن الإعدادات يتم حفظها واستعادتها بعد تحديث الصفحة (localStorage).

إدارة الجدول:

اختبار التحديد الفردي والمتعدد للصفوف.

اختبار وظائف النسخ، المسح، حذف المحدد، حذف غير المحدد.

اختبار التصفية (Filtering) والفرز (Sorting) على جميع الأعمدة.

معالجة الأخطاء: إدخال روابط غير صالحة أو Sitemaps غير موجودة والتحقق من ظهور رسائل الخطأ الصحيحة في AlertDialog.

شريط التقدم: التأكد من أن شريط التقدم يظهر ويتحدث أثناء عمليات التحميل الطويلة.

5. كيفية إصلاح الأخطاء (How to Troubleshoot)
   عند مواجهة الأخطاء، يجب على وكيل الذكاء الاصطناعي اتباع هذا المنطق لتحديد المشكلة وإصلاحها دون التسبب في أضرار جانبية.

فصل المشكلة (Isolate the Problem):

هل المشكلة في الـ Frontend أم الـ Backend؟

اختبر الـ Backend مباشرة: استخدم أداة مثل Postman أو Insomnia، أو حتى curl، لإرسال طلب POST مباشر إلى http://localhost:3001/sitemap-parser/parse (أو عنوان الـ Backend الخاص بك) مع جسم طلب مطابق لـ ParseSitemapDto.

إذا كان الـ Backend لا يعمل أو يرجع أخطاء، فالمشكلة في الـ Backend.

إذا كان الـ Backend يرجع استجابة صحيحة، فالمشكلة في الـ Frontend.

فحص سجلات الـ Backend (apps/backend Logs):

عندما تواجه مشكلة، راقب مخرجات Console الخاصة بتشغيل NestJS Backend (عادةً في نافذة الـ Terminal التي بدأت منها pnpm run start:dev --filter=./apps/backend). ستوفر رسائل Logger التي أضفتها تتبعًا قيمًا للمكان الذي حدث فيه الخطأ (فشل جلب robots.txt، فشل تحليل XML، فشل جلب صفحة معينة، إلخ).

أدوات المطور في المتصفح (Browser Developer Tools - Frontend - apps/frontend):

Console: ابحث عن أي أخطاء JavaScript.

Network Tab:

تحقق من طلب الـ fetch المرسل إلى الـ Backend: ما هو الـ URL الذي يتصل به؟ هل حالة الاستجابة 200 OK؟ هل هناك أي أخطاء شبكة (CORS، DNS)؟

افحص حمولة (payload) الطلب: هل يتم إرسال baseUrl و settings بشكل صحيح؟

افحص الاستجابة: هل البيانات التي ترجع من الـ Backend مطابقة لتوقعات الـ Frontend؟

Components Tab: فحص حالة (state) مكونات React للتأكد من أن البيانات يتم تخزينها وتحديثها بشكل صحيح.

فهم الأخطاء الشائعة (Common Error Patterns):

CORS (Cross-Origin Resource Sharing): إذا كانت الواجهة الأمامية والواجهة الخلفية تعملان على نطاقات/منافذ مختلفة (مثلاً localhost:3000 و localhost:3001)، قد تحتاج إلى تمكين CORS في NestJS Backend. (يمكن إضافة app.enableCors() في D:\Freelance\SEO\internal-linking-analyzer-pro\apps\backend\src\main.ts للـ Backend).

404 Not Found:

Backend: قد يعني أن مسار الـ API غير صحيح، أو أن الوحدة لم يتم تسجيلها بشكل صحيح في D:\Freelance\SEO\internal-linking-analyzer-pro\apps\backend\src\app.module.ts.

Frontend: قد يعني أن NEXT_PUBLIC_NESTJS_BACKEND_URL غير صحيح في D:\Freelance\SEO\internal-linking-analyzer-pro\apps\frontend\.env.local، أو أن الطلب يذهب إلى pages/api بدلاً من الـ Backend الفعلي.

خطأ في التحليل (Parsing Errors): غالبًا ما تشير إلى أن الـ XML المستلم ليس بالتنسيق المتوقع أو تالف، أو أن الـ Backend تلقى HTML بدلاً من XML.

أخطاء التحقق (Validation Errors - 400 Bad Request): تشير إلى أن الـ Frontend يرسل بيانات غير صحيحة إلى الـ Backend (مثلاً، baseUrl ليس رابطًا صالحًا).

Cannot find module '@internal-linking-analyzer-pro/types/sitemap':

السبب: الحزمة المشتركة packages/types لم يتم إعدادها بشكل صحيح في الـ workspace، أو tsconfig.json لا يشير إليها بشكل صحيح، أو pnpm install لم يتم تشغيله من الـ root بعد التغييرات.

الإصلاح:

تأكد من pnpm-workspace.yaml في الـ root يضم packages/\*.

تأكد من وجود tsconfig.json صحيح في packages/types/ مع declaration: true و outDir: "./dist".

تأكد من paths في tsconfig.json الخاص بالـ Backend والـ Frontend تشير إلى @internal-linking-analyzer-pro/types/_": ["../../packages/types/src/_"].

الأهم: قم بتشغيل pnpm install من المجلد الرئيسي للمشروع (D:\Freelance\SEO\internal-linking-analyzer-pro).

الإصلاح المنهجي (Systematic Fix):

تحديد الجذر: لا تقم بإصلاح الأعراض، بل ابحث عن السبب الجذري للمشكلة.

الخطوات الصغيرة: قم بتطبيق التغييرات خطوة بخطوة، واختبر بعد كل تعديل.

العودة للخلف: إذا أدى التغيير إلى كسر شيء، فارجع إلى الإصدار السابق المعروف بأنه يعمل.

لقد قمت بتصحيح جميع الأخطاء التي ذكرتها في الأكواد، وتحديث الدليل ليعكس هذه التصحيحات والمسارات المطلقة. الآن يجب أن تكون البيئة جاهزة للعمل بشكل سلس.

هل هناك أي شيء آخر تود توضيحه أو تعديله؟
