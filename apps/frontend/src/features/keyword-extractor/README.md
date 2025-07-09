# Keyword Extractor Feature

## What this does
This feature provides a UI to extract potential keywords from a list of URLs. It parses the last segment of each URL's path as a keyword.

## How to use it
1.  Paste URLs into the textarea, one per line.
2.  Click "Extract Keywords".
3.  Select desired rows and click "Copy Selected" to copy URL-keyword pairs to the clipboard.

## State used
This feature uses local state managed within the `useKeywordExtraction` hook (`useState`). It does not rely on global state (Zustand).

## Related Components/Services
-   `components/KeywordExtractor.tsx`: The main UI component.
-   `hooks/useKeywordExtraction.ts`: Encapsulates all business logic for this feature.

# Sitemap Parser Service

**الإصدار: 1.0**
**المؤلف: Mahmoud & Gemini**

---

## 1. الفلسفة والرؤية المستقبلية (Philosophy & Vision)

هذه الخدمة ليست مجرد "محلل sitemap"، بل هي **بوابة جلب البيانات الأولية (Initial Data Ingestion Gateway)** للمشروع بأكمله. تم تصميمها كـ MVP (منتج قابل للتطبيق بحد أدنى) لتكون نقطة البداية لأي عملية تتطلب استيعاب كميات كبيرة من الروابط لتحليلها.

**الفلسفة:**
*   **فصل الاهتمامات (SoC):** الواجهة الأمامية لا يجب أن تعرف أبدًا كيفية جلب أو تحليل البيانات الخام من مصادر خارجية. هذه مسؤولية الواجهة الخلفية حصرًا لتوفير الأمان، الكفاءة، وقابلية التوسع.
*   **المدخلات الموحدة:** هذه الخدمة هي البداية. في المستقبل، يمكن أن تتطور لتستقبل أنواعًا أخرى من المدخلات (مثل ملفات CSV، أو الاتصال المباشر بـ Google Search Console API) ولكنها ستعيد دائمًا نفس المخرج: قائمة نظيفة من الروابط جاهزة للمعالجة.

**الرؤية المستقبلية للتطوير:**
1.  **دعم `sitemap_index.xml`:** التطور الطبيعي التالي هو جعل الخدمة قادرة على تحليل ملفات فهرس الـ sitemap التي تحتوي على روابط لملفات sitemap أخرى، والقيام بجلبها وتحليلها جميعًا بشكل متكرر (recursively).
2.  **المهام في الخلفية (Background Jobs):** للمواقع الضخمة التي تحتوي على مئات الآلاف من الروابط، سيتم تطوير هذه الخدمة لتشغيل مهمة تحليل في الخلفية باستخدام (Queues) مثل BullMQ، وإعلام المستخدم عند اكتمال التحليل بدلاً من إجباره على الانتظار.
3.  **التخزين المؤقت (Caching):** سيتم إضافة طبقة Caching (باستخدام Redis مثلاً) لتخزين نتائج تحليل الـ sitemaps التي تم طلبها بشكل متكرر، مما يقلل من الحمل على الخادم ويسرع الاستجابة.

---

## 2. آلية معالجة البيانات (Data Processing Workflow)

العملية الحالية بسيطة ومباشرة، مصممة لتحقيق هدف الـ MVP بكفاءة:

1.  **الاستقبال والتحقق (Receive & Validate):**
    *   يستقبل الـ `Controller` طلب `POST` على الـ Endpoint `/api/sitemap-parser/parse`.
    *   يحتوي الطلب على `JSON body` به مفتاح `sitemapUrl`.
    *   يتم استخدام `class-validator` (عبر `ValidationPipe`) للتأكد من أن القيمة المرسلة هي رابط URL صالح. إذا لم تكن كذلك، يتم إرجاع خطأ `400 Bad Request` تلقائيًا.

2.  **الجلب (Fetch):**
    *   يستدعي الـ `Controller` دالة `parseSitemap` في الـ `Service`.
    *   يستخدم الـ `Service` مكتبة `axios` لإرسال طلب `GET` إلى `sitemapUrl` المحدد لجلب محتوى ملف الـ XML كنص خام.

3.  **التحليل (Parse):**
    *   يستخدم الـ `Service` مكتبة `xml2js` لتحويل نص الـ XML الذي تم جلبه إلى كائن JavaScript منظم.
    *   هذه العملية تتم بشكل غير متزامن (`async/await`) لتجنب حجب (blocking) الخادم.

4.  **الاستخراج (Extract):**
    *   بعد التحويل، يقوم الكود بالوصول إلى المسار المتوقع للروابط داخل كائن JavaScript، وهو `parsedData.urlset.url`.
    *   يتم استخدام `map()` لاستخلاص قيمة كل رابط (`entry.loc[0]`) ووضعها في مصفوفة جديدة من السلاسل النصية.

5.  **الإرجاع (Return):**
    *   يعيد الـ `Service` مصفوفة الروابط النظيفة إلى الـ `Controller`.
    *   يقوم الـ `Controller` بوضع هذه المصفوفة داخل كائن `JSON` تحت مفتاح `urls` ويرسلها كاستجابة `200 OK` للواجهة الأمامية.

**معالجة الأخطاء:**
إذا فشلت أي خطوة في `try` block (مثلاً، الرابط غير موجود ويعيد خطأ 404، أو أن محتوى الملف ليس XML صالحًا)، يتم التقاط الخطأ في `catch` block، ويتم إرجاع استجابة `400 Bad Request` مع رسالة خطأ واضحة.

---

## 3. طرق الاختبار (Testing Strategy)

الالتزام بنسبة تغطية 70% يتطلب اختبار هذه الخدمة من عدة زوايا:

1.  **اختبارات الوحدات (Unit Tests) للـ `Service`:**
    *   **الهدف:** اختبار منطق التحليل بشكل معزول.
    *   **السيناريوهات:**
        *   **اختبار الحالة الناجحة:** يتم عمل `mock` لـ `axios.get` ليعيد نص XML صالحًا، ونتأكد من أن الدالة تعيد المصفوفة الصحيحة من الروابط.
        *   **اختبار رابط غير صالح:** يتم عمل `mock` لـ `axios.get` ليرمي خطأ (throw error)، ونتأكد من أن خدمتنا تقوم بالتقاط هذا الخطأ وإعادة `BadRequestException`.
        *   **اختبار محتوى XML غير صالح:** يتم عمل `mock` لـ `axios.get` ليعيد نص XML تالفًا، ونتأكد من أن `parseStringPromise` يرمي خطأ وأن خدمتنا تعالجه بشكل صحيح.

2.  **اختبارات التكامل (Integration Tests) للـ `Controller`:**
    *   **الهدف:** اختبار الـ Endpoint بالكامل، من استقبال الطلب إلى إرجاع الاستجابة.
    *   **السيناريوهات:**
        *   **اختبار طلب صالح:** إرسال طلب `POST` إلى `/sitemap-parser/parse` مع `body` يحتوي على رابط sitemap صالح (يتم عمل `mock` للـ Service ليعيد بيانات ناجحة)، ونتأكد من أن الـ Endpoint يعيد استجابة `200` مع مصفوفة الروابط.
        *   **اختبار طلب غير صالح (Bad Body):** إرسال طلب `POST` مع `body` لا يحتوي على رابط URL صالح، ونتأكد من أن `ValidationPipe` يعمل ويعيد استجابة `400` قبل الوصول إلى الـ Service.

---

## 4. نماذج مدخلات صالحة (Valid Input Samples)

هذه الخدمة مصممة للتعامل مع ملفات `sitemap.xml` القياسية.

**نموذج رابط Sitemap صالح:**
https://plumbingservicesinkuwait.com/post-sitemap.xml

مثال لرابط مقال
https://plumbingservicesinkuwait.com/%d8%b3%d8%a8%d8%a7%d9%83-%d8%b5%d8%ad%d9%8a/


**نموذج محتوى `sitemap.xml` بسيط تتعامل معه الخدمة:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://plumbingservicesinkuwait.com/%d8%b3%d8%a8%d8%a7%d9%83-%d8%b5%d8%ad%d9%8a/</loc>
      <lastmod>2025-01-01</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
   </url>
   <url>
      <loc>https://plumbingservicesinkuwait.com/%d8%aa%d8%b3%d9%84%d9%8a%d9%83-%d9%85%d8%ac%d8%a7%d8%b1%d9%8a-%d8%a7%d9%84%d8%b3%d8%a7%d9%84%d9%85%d9%8a%d8%a9/</loc>
      <lastmod>2025-02-01</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.5</priority>
   </url>
</urlset> 