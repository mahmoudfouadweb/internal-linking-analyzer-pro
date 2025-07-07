# ARCHITECTURE.md - الدستور المعماري النهائي لمشروع Internal-linking-Analyzer-Pro

**الإصدار: 1.0 (النسخة التأسيسية)**
**آخر تحديث: 2025-07-07**

---

**📛 تحذير فوري لجميع المطورين والوكلاء الآليين (AI Agents) 📛**

**هذه الوثيقة هي المرجع الرسمي، النهائي، والوحيد للمعمارية والتنفيذ في هذا المشروع. قراءتها وفهمها بالكامل ليس خياراً، بل هو شرط أساسي لكتابة أي سطر كود. أي انحراف عن هذه المبادئ سيؤدي إلى رفض العمل بشكل فوري وقاطع.**

**إذا كنت لا تفهم قاعدة ما، توقف فوراً. مهمتك ليست التخمين، بل طلب التوضيح من المهندس المعماري (Architect).**

---

## 1. الفلسفة والرؤية (Philosophy & Vision)

*   **الرؤية**: بناء منصة تحليلية متخصصة في أدوات تحسين محركات البحث (SEO Analyzer Tool) من الطراز الصناعي (Enterprise-Grade)، تركز بشكل أساسي على تحليل الروابط الداخلية (Internal Linking)، وتتميز بالاستقرار المطلق، الأمان المحصّن، وقابلية التوسع اللانهائية.
*   **الفلسفة**: "الجودة ليست فعلًا، بل هي عادة". نحن لا نصلح الكود الرديء، بل نمنع كتابته من الأساس. هذا الدستور يفرض بيئة تطوير موحدة ومنظمة تضمن الجودة من اللحظة الأولى، مما يسمح للفرق البشرية والآلية بالمساهمة بكفاءة دون تعريض سلامة النظام للخطر.

## 2. الهيكل المعماري للمستودع (Monorepo Architecture)

المشروع مُدار كـ **Monorepo** باستخدام **PNPM Workspaces** و **Turborepo** لضمان أقصى درجات إعادة الاستخدام، سرعة البناء، والاتساق.

internal-linking-analyzer-pro/
│
├── 📁 apps/ # التطبيقات القابلة للنشر (Deployable Applications)
│ ├── 📦 backend/ # الواجهة الخلفية (NestJS API)
│ └── 📦 frontend/ # الواجهة الأمامية (Next.js UI)
│
├── 📁 packages/ # الحزم المشتركة والقابلة لإعادة الاستخدام عبر المشروع
│ ├── 📦 types/ # تعريفات TypeScript المشتركة (@internal-linking-analyzer-pro/types)
│ ├── 📦 config/ # إعدادات الأدوات المشتركة (@internal-linking-analyzer-pro/config)
│ └── 📦 ui/ # مكتبة المكونات المرئية الخام (@internal-linking-analyzer-pro/ui)
│
├── 📁 tools/ # الأدوات المساعدة الخاصة بالمشروع
│ └── 📦 cli/ # سكريبتات الأتمتة (مثل gpt:feature)
│
├── 📁 docs/ # التوثيق المركزي للمشروع (هذا الملف هنا)
│ ├── 📜 ARCHITECTURE.md # الدستور (مصدر الحقيقة الوحيد)
│ └── 📜 CONTEXT.md # سياق العمل وأهداف المشروع
│
├── 📄 .github/ # إعدادات GitHub (Workflows للـ CI/CD)
├── 📄 .husky/ # إعدادات Git Hooks (لفرض الجودة قبل الـ commit)
├── 📄 turbo.json # إعدادات Turborepo
├── 📄 pnpm-workspace.yaml # تعريف مساحات العمل لـ PNPM
├── 📄 package.json # ملف الحزمة الجذري
└── 📄 .gitignore # الملفات المتجاهلة


## 3. الحزمة التقنية الثابتة (The Immutable Tech Stack)

الخيارات التقنية التالية ليست توصيات، بل هي قرارات نهائية. يُمنع منعاً باتاً إدخال أي بديل دون اتباع "آلية إضافة أداة جديدة" المذكورة في القسم 6.1.

*   **Monorepo Tooling**: PNPM + Turborepo
*   **Backend Framework**: NestJS
*   **Frontend Framework**: Next.js (with App Router)
*   **Database ORM**: Prisma
*   **Styling**: Tailwind CSS (حصرياً)
*   **State Management (Frontend)**: Zustand (حصرياً)
*   **Data Fetching (Frontend)**: React Query / TanStack Query (حصرياً)
*   **Form Handling (Frontend)**: React Hook Form + Zod (للتحقق)
*   **Language**: TypeScript (بأقصى درجات الصرامة `strict: true`)
*   **Testing**: Jest + React Testing Library (Frontend) / `@nestjs/testing` (Backend)

---

## 4. دورة حياة الميزة (The Golden Workflow: Lifecycle of a Feature)

هذه هي **العملية الإلزامية** لتطوير أي ميزة جديدة من الفكرة إلى النشر. لا توجد طرق مختصرة.

### الخطوة 1: الإنشاء والتوليد (Generation)
*   **ممنوع إنشاء أي ملف أو مجلد يدوياً لبدء ميزة جديدة.**
*   **الطريقة الوحيدة**: استخدم السكريبت المخصص لذلك. افتح الطرفية (Terminal) في المجلد الجذري ونفذ:
    ```bash
    pnpm gpt:feature <feature-name>
    ```
    *   **مثال**: `pnpm gpt:feature analysis-reports`
*   **ماذا يفعل هذا الأمر؟**:
    1.  ينشئ الهيكل الكامل للميزة في الواجهة الخلفية (`apps/backend/src/analysis-reports`).
    2.  ينشئ الهيكل الكامل للميزة في الواجهة الأمامية (`apps/frontend/src/features/analysis-reports`).
    3.  يضع ملفات `README.md` فارغة داخل كل جزء من الميزة.
    4.  يضيف Headers التوثيق (`@author`, `@description`...) إلى كل ملف مولّد.
    5.  يضيف boilerplate code أساسي للبدء.

### الخطوة 2: التطوير (Development)
*   **الالتزام بالدستور**: كل سطر كود تكتبه يجب أن يتبع القواعد المفصلة في "القسم 5: المعايير التقنية التفصيلية".
*   **الواجهة الخلفية**:
    1.  عرّف الـ Schema في `prisma/schema.prisma`.
    2.  نفّذ `pnpm --filter backend prisma migrate dev` لإنشاء الـ migration.
    3.  عرّف الـ DTOs في `src/[feature]/dto/` مع توثيق Swagger (`@ApiProperty`).
    4.  اكتب منطق العمل في الـ `Service`. **الـ Service هو المكان الوحيد الذي يُسمح له بالتحدث مع PrismaClient.**
    5.  عرّف الـ Endpoints في الـ `Controller`. الـ Controller يجب أن يكون نحيفاً (thin)، وظيفته فقط استلام الطلب، التحقق من DTO، واستدعاء الـ Service.
*   **الواجهة الأمامية**:
    1.  اكتب منطق جلب البيانات (Data Fetching) في `services/`.
    2.  استهلك الـ services عبر Custom Hooks باستخدام `useQuery` أو `useMutation` في `hooks/`.
    3.  قم بإدارة الحالة (State) المتعلقة بالميزة في `zustand-slice.ts` (إذا لزم الأمر).
    4.  ابنِ المكونات (Components) باستخدام Tailwind CSS فقط. يجب أن تكون المكونات غبية (dumb)، تأخذ `props` وتعرض UI. المنطق يجب أن يكون في الـ Hooks.

### الخطوة 3: الاختبار (Testing)
*   **لا يوجد ميزة مكتملة بدون اختبارات.**
*   **المتطلب الأدنى**: 70% تغطية للـ Unit Tests.
*   **Backend**: لكل `Service` يجب وجود اختبارات وحدات (Unit Tests) تغطي منطق العمل. لكل `Controller` يجب وجود اختبار تكاملي (Integration Test) واحد على الأقل يتأكد من أن الـ Endpoint يعمل.
*   **Frontend**: يجب اختبار كل Custom Hook. المكونات المعقدة يجب أن يكون لها اختبارات باستخدام React Testing Library.

### الخطوة 4: التوثيق (Documentation)
*   املأ ملف `README.md` داخل مجلد الميزة (في الخلفية والأمامية) بالمعلومات التالية:
    *   وصف الميزة.
    *   شكل الـ API (Request/Response).
    *   كيفية استخدامها.

### الخطوة 5: الـ Commit
*   يجب أن تتبع رسائل الـ Commit معيار **Conventional Commits** بشكل صارم.
    *   `feat(reports): add pdf export functionality`
    *   `fix(parser): handle malformed URLs gracefully`
    *   `docs(project): update architecture file with new project name`
*   **سيتم رفض أي Commit لا يتبع هذا المعيار بواسطة Git Hooks.**

### الخطوة 6: الـ Pull Request (PR)
*   افتح Pull Request إلى الفرع الرئيسي (`main` أو `develop`).
*   املأ قالب الـ PR (PR Template) بالكامل. اشرح ماذا فعلت وكيف يمكن للمراجع اختباره.
*   تأكد من نجاح جميع فحوصات الـ CI (Linting, Testing, Build).
*   اطلب مراجعة من عضو واحد على الأقل من الفريق. **لا تقم بدمج الـ PR الخاص بك بنفسك.**

---

## 5. المعايير التقنية التفصيلية (The Rulebook)

### 5.1. الواجهة الخلفية (NestJS)
*   **Modules**: كل ميزة هي Module قائم بذاته.
*   **DTOs**: تُكتب يدوياً وتُوثق بـ `@nestjs/swagger`. لا لتوليدها تلقائياً.
*   **Error Handling**: استخدم Exception Filters لتوحيد استجابات الأخطاء.
*   **Configuration**: استخدم `@nestjs/config` لإدارة متغيرات البيئة. لا لكتابة قيم حساسة مباشرة في الكود.

### 5.2. الواجهة الأمامية (Next.js)
*   **هيكل المجلدات**: `feature-based` داخل `src/features/`. المكونات والـ Hooks المشتركة توضع في `src/shared/`. المكونات الأساسية جداً (الخام) توضع في `packages/ui`.
*   **State**: `Zustand` هو الحل الوحيد المعتمد للحالة العامة (Global State). يُسمح باستخدام `useContext` فقط لتمرير البيانات ذات النطاق المحدود التي لا تتغير كثيراً (مثل Theme أو بيانات المصادقة)، وليس كبديل لـ Zustand.
*   **Styling**: `Tailwind CSS` هو الحل الوحيد. ممنوع منعاً باتاً استخدام `inline styles`, `CSS Modules`, أو `styled-components`.

### 5.3. جودة الكود العامة (General Code Quality)
*   **TypeScript**: **ممنوع استخدام `any` نهائياً**. استخدم `unknown` إذا كان النوع غير معروف وقم بالتحقق منه. استخدم `noUncheckedIndexedAccess` في `tsconfig.json` لفرض التحقق عند الوصول إلى عناصر المصفوفات.
*   **DRY (Don't Repeat Yourself)**: لا تكرر الكود. استخلصه في دوال أو hooks مشتركة.
*   **Logging**: `console.log()` ممنوع في الكود النهائي. استخدم مكتبة logging منظمة (مثل Pino) في الخلفية.

---

## 6. الآليات والإجراءات الخاصة (Special Procedures)

### 6.1. آلية إضافة أداة أو مكتبة جديدة (Adding a New Dependency)
هذا إجراء عالي الخطورة ويجب أن يتبع الخطوات التالية بدقة:
1.  **قدم طلباً**: افتح Issue جديدة على GitHub.
2.  **التبرير**: وضح في الـ Issue:
    *   ما هي المشكلة التي ستحلها هذه المكتبة؟
    *   لماذا لا يمكن حلها بالأدوات الموجودة حالياً؟
    *   ما هي البدائل التي قمت بدراستها ولماذا اخترت هذه المكتبة؟
3.  **الفحص الأمني**: أرفق رابطاً لفحص الثغرات الأمنية للمكتبة (مثال: Snyk أو `npm audit`).
4.  **الموافقة المعمارية**: لا تقم بتثبيت المكتبة حتى تحصل على موافقة صريحة من المهندس المعماري.
5.  **التنفيذ**: بعد الموافقة، قم بتثبيت المكتبة وتوثيق سبب وجودها في `CONTEXT.md`.

### 6.2. آلية تعديل كود مشترك (Modifying Shared Code in `packages/`)
تعديل الكود في `packages/` (مثل `ui` أو `types`) يؤثر على المشروع بأكمله.
1.  أي تغيير يجب أن يتم في فرع (branch) خاص به.
2.  يجب أن يكون التغيير مصحوباً باختبارات شاملة تثبت أنه لم يكسر أي شيء في التطبيقات التي تستخدمه.
3.  يجب أن يحصل الـ PR على موافقة من شخصين على الأقل.

### 6.3. آلية إجراء الاختبارات (Running Tests)
*   لتشغيل جميع الاختبارات في المشروع:
    ```bash
    pnpm test
    ```
*   لتشغيل اختبارات تطبيق معين فقط (مثلاً backend):
    ```bash
    pnpm test --filter backend
    ```

---
---

## 7. التحذير النهائي (Final Warning)

**هذه ليست اقتراحات. هذه هي القواعد.**

*   **المصدر الوحيد للحقيقة**: هذا الملف (`/docs/ARCHITECTURE.md`).
*   **نقطة البداية الوحيدة**: سكريبت `pnpm gpt:feature`.
*   **حل التنسيق الوحيد**: `Tailwind CSS`.
*   **حل الحالة الوحيد**: `Zustand`.
*   **ممنوعات مطلقة**: `any`, `console.log`, `inline styles`, `!` (non-null assertion) بدون فحص مسبق.
*   **الالتزامات المطلقة**: Conventional Commits, PR Templates, Unit Tests.

**أي محاولة للتحايل على هذه القواعد هي انتهاك مباشر لسلامة المشروع وستؤدي إلى الرفض الفوري. لقد تم تحذيرك.**

**– المهندس المعماري (Architect)**
cd apps/backend && pnpm start:dev
pnpm --filter backend start:dev
pnpm --filter frontend dev

