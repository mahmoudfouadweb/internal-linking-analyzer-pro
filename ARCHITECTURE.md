# ARCHITECTURE.md - الدستور المعماري النهائي لمشروع Internal Linking Analyzer Pro

**الإصدار: 3.0 (النسخة المطورة مع نظام معالجة الأخطاء المتقدم)**  
**آخر تحديث: 2025-07-11**  
**حالة المشروع: ✅ مكتمل ومختبر وجاهز للإنتاج مع نظام معالجة أخطاء متقدم**

---

**📛 تحذير فوري لجميع المطورين والوكلاء الآليين (AI Agents) 📛**

**هذه الوثيقة هي المرجع الرسمي، النهائي، والوحيد للمعمارية والتنفيذ في هذا المشروع. قراءتها وفهمها بالكامل ليس خياراً، بل هو شرط أساسي لكتابة أي سطر كود. أي انحراف عن هذه المبادئ سيؤدي إلى رفض العمل بشكل فوري وقاطع.**

**إذا كنت لا تفهم قاعدة ما، توقف فوراً. مهمتك ليست التخمين، بل طلب التوضيح من المهندس المعماري (Architect).**

---

## 🧠 منهجية التفكير العبقرية للوكلاء الآليين (AI Agent Genius Methodology)

### المبادئ الأساسية لاتخاذ القرارات

#### 1. **مبدأ التحليل المتدرج (Layered Analysis Principle)**
```
قبل أي قرار، اتبع هذا التسلسل:
├── 🔍 فهم السياق (Context Understanding)
├── 📊 تحليل التأثير (Impact Analysis)  
├── 🎯 تحديد الأهداف (Goal Alignment)
├── ⚖️ تقييم المخاطر (Risk Assessment)
├── 🔧 اختيار الحل الأمثل (Optimal Solution Selection)
└── 📝 توثيق القرار (Decision Documentation)
```

#### 2. **مصفوفة اتخاذ القرارات (Decision Matrix)**

| نوع التغيير | مستوى المخاطر | الموافقة المطلوبة | التوثيق المطلوب | الاختبار المطلوب |
|-------------|---------------|------------------|------------------|------------------|
| **إضافة ميزة جديدة** | 🟡 متوسط | مهندس معماري | شامل | 70%+ تغطية |
| **تعديل كود موجود** | 🟠 عالي | مراجعة الكود | تفصيلي | 80%+ تغطية |
| **حذف كود/ميزة** | 🔴 عالي جداً | موافقة فريق | كامل | 90%+ تغطية |
| **تحسين الأداء** | 🟡 متوسط | مراجعة تقنية | متوسط | قياس الأداء |
| **إصلاح خطأ** | 🟢 منخفض | مراجعة سريعة | أساسي | اختبار الحالة |

#### 3. **خوارزمية التفكير النقدي (Critical Thinking Algorithm)**

```typescript
interface DecisionProcess {
  // خطوة 1: تحليل المشكلة
  analyzeProblem(): {
    rootCause: string;
    symptoms: string[];
    affectedComponents: string[];
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
  };

  // خطوة 2: توليد الحلول
  generateSolutions(): Solution[];

  // خطوة 3: تقييم الحلول
  evaluateSolutions(solutions: Solution[]): {
    pros: string[];
    cons: string[];
    complexity: number;
    maintainability: number;
    performance: number;
    security: number;
  }[];

  // خطوة 4: اختيار الحل الأمثل
  selectOptimalSolution(): Solution;

  // خطوة 5: تنفيذ وتتبع
  implementAndTrack(): ExecutionPlan;
}
```

---

## 1. الفلسفة والرؤية المطورة (Enhanced Philosophy & Vision)

### **الرؤية الاستراتيجية**
بناء منصة تحليلية متخصصة في أدوات تحسين محركات البحث (SEO Analyzer Tool) من ا��طراز الصناعي (Enterprise-Grade)، تركز بشكل أساسي على تحليل الروابط الداخلية (Internal Linking) وخرائط المواقع (Sitemap Analysis)، وتتميز بالاستقرار المطلق، الأمان المحصّن، وقابلية التوسع اللانهائية.

### **الفلسفة التطويرية**
"الجودة ليست فعلاً، بل هي عادة راسخة". نحن لا نصلح الكود الرديء، بل نمنع كتابته من الأساس. هذا الدستور يفرض بيئة تطوير موحدة ومنظمة تضمن الجودة من اللحظة الأولى، مما يسمح للفرق البشرية والآلية بالمساهمة بكفاءة دون تعريض سلامة النظام للخطر.

### **المبادئ الجوهرية**
1. **الجودة أولاً**: كل سطر كود يجب أن يمر بمعايير الجودة الصارمة
2. **الأمان بالتصميم**: الأمان ليس إضافة، بل جزء من التصميم الأساسي
3. **قابلية التوسع**: كل قرار تقني يجب أن يدعم النمو المستقبلي
4. **التوثيق الشامل**: كل عنصر يجب أن يكون موثقاً بوضوح
5. **الاختبار ا��إجباري**: لا يوجد كود بدون اختبارات

---

## 2. الهيكل المعماري المطور (Enhanced Monorepo Architecture)

```
internal-linking-analyzer-pro/
│
├── 📁 apps/ # التطبيقات القابلة للنشر (Deployable Applications)
│   ├── 📦 backend/ # الواجهة الخلفية (NestJS API - Port 3002)
│   │   ├── src/
│   │   │   ├── sitemap-parser/ # ✅ مكتمل ومختبر
│   │   │   ├── auth/ # 🔄 جاهز للتطوير
│   │   │   ├── reports/ # 🔄 جاهز للتطوير
│   │   │   └── shared/ # مكونات مشتركة
│   │   ├── test/ # اختبارات شاملة
│   │   └── docs/ # وثائق API
│   └── 📦 frontend/ # الواجهة الأمامية (Next.js UI - Port 3000)
│       ├── src/
│       │   ├── features/ # ميزات منظمة
│       │   │   └── keyword-extractor/ # ✅ مكتمل ومختبر
│       │   ├── shared/ # مكونات مشتركة
│       │   └── app/ # Next.js App Router
│       └── public/ # الملفات العامة
│
├── 📁 packages/ # الحزم المشتركة والقابلة لإعادة الاستخدام
│   ├── 📦 types/ # ✅ تعريفا�� TypeScript المشتركة
│   │   ├── src/sitemap.ts # أنواع تحليل الخرائط
│   │   ├── src/auth.ts # أنواع المصادقة
│   │   └── dist/ # النسخة المبنية
│   ├── 📦 config/ # إعدادات الأدوات المشتركة
│   │   ├── eslint-preset.js # إعدادات ESLint
│   │   ├── prettier.config.js # إعدادات Prettier
│   │   └── tsconfig.base.json # إعدادات TypeScript
│   └── 📦 ui/ # مكتبة المكونات المرئية الخام
│       ├── components/ # مكونات أساسية
│       ├── hooks/ # React hooks مشتركة
│       └── utils/ # دوال مساعدة
│
├── 📁 tools/ # الأدوات المساعدة الخاصة بالمشروع
│   ├── 📦 cli/ # سكريبتات الأتمتة
│   │   ├── feature-generator.js # مولد الميزات
│   │   └── test-runner.js # منفذ الاختبارات
│   └── 📦 scripts/ # سكريبتات البناء والنشر
│
├── 📁 docs/ # التوثيق المركزي للمشروع
│   ├── 📜 ARCHITECTURE.md # الدستور (مصدر الحقيقة الوحيد)
│   ├── 📜 README.md # دليل المشروع الشامل
│   ├── �� PROJECT_STATUS.md # حالة المشروع
│   ├── 📜 FINAL_TEST.md # تقرير الاختبارات النهائية
│   └── 📜 QUICK_START.md # دليل البدء السريع
│
├── 📄 .github/ # إعدادات GitHub (Workflows للـ CI/CD)
│   ├── workflows/ # GitHub Actions
│   ├── ISSUE_TEMPLATE/ # قوالب المشاكل
│   └── PULL_REQUEST_TEMPLATE.md # قالب طلبات السحب
├── 📄 .husky/ # إعدادات Git Hooks (لفرض الجودة قبل الـ commit)
├── 📄 pnpm-workspace.yaml # تعريف مساحات العمل لـ PNPM
├── 📄 package.json # ملف الحزمة الجذري
└── 📄 .gitignore # الملفات المتجاهلة
```

---

## 3. الحزمة التقنية المطورة (Enhanced Immutable Tech Stack)

### **التقنيات الأساسية (Core Technologies)**
```yaml
Backend Framework: 
  name: "NestJS"
  version: "11.x"
  rationale: "Enterprise-grade, TypeScript-first, modular architecture"
  status: "✅ Production Ready"

Frontend Framework:
  name: "Next.js"
  version: "15.x"
  features: ["App Router", "Server Components", "TypeScript"]
  status: "✅ Production Ready"

Language:
  name: "TypeScript"
  version: "5.x"
  strictness: "Maximum (strict: true, noUncheckedIndexedAccess: true)"
  status: "✅ Enforced"

Monorepo Management:
  primary: "PNPM Workspaces"
  build_tool: "Turborepo"
  rationale: "Superior performance, disk efficiency, workspace isolation with modern tooling"
  status: "✅ Configured"
```

### **التقنيات المتخصصة (Specialized Technologies)**
```yaml
Database ORM:
  name: "Prisma"
  status: "🔄 Ready for Integration"
  
Styling:
  name: "Tailwind CSS"
  policy: "EXCLUSIVE - No alternatives allowed"
  status: "✅ Implemented"

State Management:
  name: "Zustand"
  policy: "EXCLUSIVE for global state"
  alternatives: "useContext only for theme/auth"
  status: "✅ Ready"

Data Fetching:
  name: "TanStack Query (React Query)"
  policy: "EXCLUSIVE for server state"
  status: "✅ Configured"

Form Handling:
  primary: "React Hook Form"
  validation: "Zod"
  status: "✅ Ready"

Testing:
  backend: "Jest + @nestjs/testing"
  frontend: "Jest + React Testing Library"
  coverage_requirement: "70% minimum"
  status: "✅ Implemented"
```

---

## 4. دورة حياة الميزة المطورة (Enhanced Golden Workflow)

### **الخطوة 0: التحليل والتخطيط (Analysis & Planning)**
```bash
# قبل بدء أي ميزة، أجب على هذه ال��سئلة:
1. ما هي المشكلة التي تحلها هذه الميزة؟
2. كيف تتماشى مع أهداف المشروع الاستراتيجية؟
3. ما هو التأثير على الأداء والأمان؟
4. ما هي التبعيات والمخاطر المحتملة؟
5. كيف ستقيس نجاح هذه الميزة؟
```

### **الخطوة 1: الإنشاء والتوليد المطور (Enhanced Generation)**
```bash
# الطريقة الوحيدة المعتمدة لإنشاء ميزة جديدة
pnpm gpt:feature <feature-name> --type=<full|backend|frontend> --priority=<low|medium|high|critical>

# مثال متقدم
pnpm gpt:feature link-analysis --type=full --priority=high --with-auth --with-db
```

**ما يفعله الأمر المطور**:
1. ✅ ينشئ الهيكل الكامل مع التوثيق الشامل
2. ✅ يضيف اختبارات أساسية (boilerplate tests)
3. ✅ يكوّن TypeScript types في الحزمة المشتركة
4. ✅ ينشئ ملفات README مع قوالب التوثيق
5. ✅ يضيف Git hooks للجودة
6. ✅ يكوّن CI/CD workflows أساسية

### **الخطوة 2: التطوير المطور (Enhanced Development)**

#### **معايير الكود الإجبارية**
```typescript
/**
 * @fileoverview مثال على التوثيق الإجباري لكل ملف
 * @description وصف مفصل لغرض الملف ووظائفه الأساسية
 * @author اسم المطور أو الوكيل الآلي
 * @created تاريخ الإنشاء (YYYY-MM-DD)
 * @lastModifiedBy آخر من عدّل الملف
 * @lastModified تاريخ آخر تعديل مع وصف التغيير
 * @version رقم الإصدار
 * @architecture-compliance تأكيد الالتزام بالمعمارية
 * @security-review حالة المراجعة الأمنية
 * @performance-impact تقييم تأثير الأداء
 * @dependencies قائمة التبعيات الحرجة
 * @testing-coverage نسبة تغطية الاختبارات
 */

/**
 * @class ExampleService
 * @description وصف شامل للخدمة ومسؤولياتها
 * 
 * @responsibilities
 * - مسؤولية 1: وصف مفصل
 * - مسؤولية 2: وصف مفصل
 * 
 * @dependencies
 * - HttpService: لإجراء طلبات HTTP خارجية
 * - Logger: لتسجيل العمليات والأخطاء
 * 
 * @security-considerations
 * - تحقق من صحة جميع المدخلات
 * - تشفير البيانات الحساسة
 * - تسجيل محاولات الوصول المشبوهة
 * 
 * @performance-notes
 * - استخدام cache للبيانات المتكررة
 * - تحسين استعلامات قاعدة البيانات
 * - تجنب العمليات المتزامنة الثقيلة
 * 
 * @example
 * ```typescript
 * const service = new ExampleService(httpService, logger);
 * const result = await service.processData(inputData);
 * ```
 */
export class ExampleService {
  /**
   * @property logger
   * @description مثيل Logger لتسجيل العمليات والأخطاء
   * @readonly
   * @security يجب عدم تسجيل البيانات الحساسة
   */
  private readonly logger = new Logger(ExampleService.name);

  /**
   * @constructor
   * @description ينشئ مثيل جديد من ExampleService
   * @param httpService - خدمة HTTP للطلبات الخارجية
   * @param configService - خدمة التكوين للإعدادات
   * 
   * @throws {Error} إذا كانت الخدمات المطلوبة غير متوفرة
   * 
   * @example
   * ```typescript
   * const service = new ExampleService(httpService, configService);
   * ```
   */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.validateDependencies();
  }

  /**
   * @method processData
   * @description يعالج البيانات المدخلة ويعيد النتيجة المعالجة
   * 
   * @param inputData - البيانات المراد معالجتها
   * @param options - خيارات المعالجة الاختيارية
   * @returns Promise<ProcessedData> البيانات المعالجة
   * 
   * @throws {ValidationError} إذا كانت البيانات المدخلة غير صحيحة
   * @throws {ProcessingError} إذا فشلت عملية المعالجة
   * @throws {TimeoutError} إذا تجاوزت العملية الوقت المحدد
   * 
   * @performance O(n) حيث n هو حجم البيانات المدخلة
   * @security يتم تحقق من صحة جميع المدخلات
   * 
   * @example
   * ```typescript
   * const inputData = { url: 'https://example.com', settings: {...} };
   * const result = await service.processData(inputData);
   * console.log(result.processedUrls);
   * ```
   */
  async processData(
    inputData: InputData,
    options?: ProcessingOptions,
  ): Promise<ProcessedData> {
    // تحقق من صحة المدخلات
    this.validateInput(inputData);
    
    // تسجيل بداية العملية
    this.logger.log(`Starting data processing for: ${inputData.identifier}`);
    
    try {
      // منطق المعالجة الأساسي
      const result = await this.performProcessing(inputData, options);
      
      // تسجيل نجاح العملية
      this.logger.log(`Successfully processed data: ${result.summary}`);
      
      return result;
    } catch (error) {
      // تسجيل الخطأ مع التفاصيل
      this.logger.error(`Processing failed: ${error.message}`, error.stack);
      
      // إعادة رمي الخطأ مع معلومات إضافية
      throw new ProcessingError(
        `Failed to process data: ${error.message}`,
        error,
      );
    }
  }

  /**
   * @method validateInput
   * @description يتحقق من صحة البيانات المدخلة
   * @private
   * @param inputData - البيانات المراد التحقق منها
   * @throws {ValidationError} إذا كانت البيانات غير صحيحة
   */
  private validateInput(inputData: InputData): void {
    if (!inputData || typeof inputData !== 'object') {
      throw new ValidationError('Input data must be a valid object');
    }
    
    // المزيد من عمليات التحقق...
  }
}
```

### **الخطوة 3: الاختبار المطور (Enhanced Testing)**

#### **معايير الاختبار الإجبارية**
```typescript
/**
 * @fileoverview اختبارات شاملة لـ ExampleService
 * @description يغطي جميع السيناريوهات المحتملة والحالات الحدية
 * @coverage-target 80%+ للكود الحرج، 70%+ للكود العادي
 * @test-types Unit Tests, Integration Tests, E2E Tests
 */

describe('ExampleService', () => {
  let service: ExampleService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // إعداد الـ mocks بطريقة شاملة
    const mockHttpService = createMockHttpService();
    const mockConfigService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  describe('processData', () => {
    it('should process valid data successfully', async () => {
      // ترتيب البيانات
      const inputData = createValidInputData();
      const expectedResult = createExpectedResult();
      
      // إعداد الـ mocks
      httpService.get.mockResolvedValue(createMockResponse());
      
      // تنفيذ العملية
      const result = await service.processData(inputData);
      
      // التحقق من النتائج
      expect(result).toEqual(expectedResult);
      expect(httpService.get).toHaveBeenCalledWith(expectedUrl);
    });

    it('should handle invalid input gracefully', async () => {
      // اختبار البيانات غير الصحيحة
      const invalidData = null;
      
      // التحقق من رمي الخطأ المناسب
      await expect(service.processData(invalidData))
        .rejects
        .toThrow(ValidationError);
    });

    it('should handle network errors properly', async () => {
      // محاكاة خطأ شبكة
      httpService.get.mockRejectedValue(new Error('Network error'));
      
      // التحقق من التعامل مع الخطأ
      await expect(service.processData(validData))
        .rejects
        .toThrow(ProcessingError);
    });

    // اختبارات الأداء
    it('should complete processing within acceptable time', async () => {
      const startTime = Date.now();
      await service.processData(largeDataSet);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // 5 ثوانٍ
    });

    // اختبارات الأمان
    it('should sanitize malicious input', async () => {
      const maliciousData = createMaliciousInput();
      
      await expect(service.processData(maliciousData))
        .rejects
        .toThrow(SecurityError);
    });
  });
});
```

---

## 5. المعايير التقنية المطورة (Enhanced Technical Standards)

### **5.1 معايير الواجهة الخلفية المطورة (Enhanced Backend Standards)**

#### **هيكل الوحدات (Module Structure)**
```typescript
// مثال على هيكل وحدة مطور
@Module({
  imports: [
    // الوحدات المطلوبة مع التكوين
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
      headers: { 'User-Agent': 'InternalLinkingAnalyzerPro/2.0' },
    }),
    ConfigModule.forFeature(featureConfig),
  ],
  controllers: [FeatureController],
  providers: [
    FeatureService,
    // مقدمي الخدمة المخصصين
    {
      provide: 'FEATURE_CONFIG',
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('FEATURE_API_KEY'),
        timeout: configService.get('FEATURE_TIMEOUT', 5000),
      }),
      inject: [ConfigService],
    },
  ],
  exports: [FeatureService], // تصدير للوحدات الأخرى
})
export class FeatureModule implements OnModuleInit {
  /**
   * @method onModuleInit
   * @description يتم استدعاؤها عند تهيئة الوحدة
   * @lifecycle NestJS Module Lifecycle Hook
   */
  async onModuleInit() {
    // منطق التهيئة
    this.logger.log('FeatureModule initialized successfully');
  }
}
```

#### **معايير DTOs المطورة**
```typescript
/**
 * @class CreateFeatureDto
 * @description DTO لإنشاء ميزة جديدة مع التحقق الشامل
 * @swagger-tags Feature Management
 */
export class CreateFeatureDto {
  /**
   * @property name
   * @description اسم الميزة (مطلوب، فريد)
   * @example "advanced-link-analysis"
   * @validation يجب أن يكون بين 3-50 حرف، أحرف وأرقام وشرطات فقط
   */
  @ApiProperty({
    description: 'اسم الميزة الفريد',
    example: 'advanced-link-analysis',
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9-]+$',
  })
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'Name must contain only letters, numbers, and hyphens',
  })
  @IsNotEmpty()
  readonly name: string;

  /**
   * @property description
   * @description وصف مفصل للميزة
   * @example "تحليل متقدم للروابط الداخلية مع إحصائيات مفصلة"
   * @validation اختياري، حد أقصى 500 حرف
   */
  @ApiProperty({
    description: 'وصف مفصل للميزة',
    example: 'تحليل متقدم للروابط الداخلية مع إحصائيات مفصلة',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  /**
   * @property settings
   * @description إعدادات الميزة
   * @validation كائن صحيح مع التحقق من الخصائص الفرعية
   */
  @ApiProperty({
    description: 'إعدادات الميزة',
    type: FeatureSettingsDto,
  })
  @ValidateNested()
  @Type(() => FeatureSettingsDto)
  @IsObject()
  readonly settings: FeatureSettingsDto;
}
```

### **5.2 معايير الواجهة الأمامية المطورة (Enhanced Frontend Standards)**

#### **هيكل المكونات المطور**
``typescript
/**
 * @component FeatureCard
 * @description مكون لعرض بطاقة الميزة مع التفاعلات
 * @author Gemini AI
 * @created 2025-07-08
 * @accessibility WCAG 2.1 AA compliant
 * @responsive Mobile-first design
 * @testing Covered by React Testing Library
 */

interface FeatureCardProps {
  /** بيانات الميزة المراد عرضها */
  feature: Feature;
  /** دالة استدعاء عند النقر على البطاقة */
  onSelect?: (feature: Feature) => void;
  /** حالة التحميل */
  isLoading?: boolean;
  /** تخصيص الأنماط */
  className?: string;
  /** معرف فريد للاختبارات */
  testId?: string;
}

/**
 * @function FeatureCard
 * @description مكون بطاقة الميزة مع دعم إمكانية الوصول والاستجابة
 * 
 * @param props - خصائص المكون
 * @returns JSX.Element
 * 
 * @example
 * ```tsx
 * <FeatureCard
 *   feature={featureData}
 *   onSelect={handleFeatureSelect}
 *   isLoading={false}
 *   testId="feature-card-1"
 * />
 * ```
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  onSelect,
  isLoading = false,
  className = '',
  testId = 'feature-card',
}) => {
  // استخدام hooks مخصصة للمنطق
  const { isSelected, handleKeyPress } = useFeatureCard(feature, onSelect);
  
  // معالج النقر مع التحقق
  const handleClick = useCallback(() => {
    if (!isLoading && onSelect) {
      onSelect(feature);
    }
  }, [feature, onSelect, isLoading]);

  return (
    <div
      data-testid={testId}
      className={cn(
        // الأنماط ال��ساسية
        'relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200',
        // حالات التفاعل
        'hover:shadow-md hover:border-gray-300 focus-within:ring-2 focus-within:ring-blue-500',
        // الحالات الشرطية
        {
          'opacity-50 cursor-not-allowed': isLoading,
          'ring-2 ring-blue-500 border-blue-500': isSelected,
        },
        className,
      )}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`اختيار الميزة: ${feature.name}`}
      aria-pressed={isSelected}
      aria-disabled={isLoading}
    >
      {/* محتوى البطاقة */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {feature.name}
          </h3>
          {feature.description && (
            <p className="mt-2 text-sm text-gray-600">
              {feature.description}
            </p>
          )}
        </div>
        
        {/* مؤشر الحالة */}
        <div className="ml-4 flex-shrink-0">
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <StatusBadge status={feature.status} />
          )}
        </div>
      </div>
      
      {/* معلومات إضافية */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>آخر تحديث: {formatDate(feature.updatedAt)}</span>
        <span>الإصدار: {feature.version}</span>
      </div>
    </div>
  );
};

// Hook مخصص للمنطق
function useFeatureCard(feature: Feature, onSelect?: (feature: Feature) => void) {
  const [isSelected, setIsSelected] = useState(false);
  
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onSelect) {
        onSelect(feature);
      }
    }
  }, [feature, onSelect]);
  
  return { isSelected, handleKeyPress };
}
```

---

## 6. آليات اتخاذ القرارات المطورة (Enhanced Decision-Making Mechanisms)

### **6.1 مصفوفة تقييم التقنيات الجديدة**

```typescript
interface TechnologyEvaluation {
  name: string;
  category: 'framework' | 'library' | 'tool' | 'service';
  
  // معايير التقييم (1-10)
  criteria: {
    performance: number;        // الأداء
    security: number;          // الأمان
    maintainability: number;   // قابلية الصيانة
    community: number;         // دعم المجتمع
    documentation: number;     // جودة التوثيق
    learning_curve: number;    // سهولة التعلم
    compatibility: number;     // التوافق مع النظام الحالي
    future_proof: number;      // الاستدامة المستقبلية
  };
  
  // تحليل المخاطر
  risks: {
    technical: string[];       // مخاطر تقنية
    business: string[];        // مخاطر تجارية
    security: string[];        // مخاطر أمنية
    performance: string[];     // مخاطر الأداء
  };
  
  // خطة التنفيذ
  implementation: {
    effort_estimate: 'low' | 'medium' | 'high' | 'very_high';
    timeline: string;
    dependencies: string[];
    rollback_plan: string;
  };
}

// مثال على تقييم تقنية جديدة
const evaluateNewTechnology = (tech: TechnologyEvaluation): boolean => {
  // حساب النقاط الإجمالية
  const totalScore = Object.values(tech.criteria).reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / Object.keys(tech.criteria).length;
  
  // معايير القبول
  const acceptanceCriteria = {
    minimumScore: 7.0,
    criticalCriteria: ['security', 'performance', 'maintainability'],
    minimumCriticalScore: 8.0,
  };
  
  // فحص المعايير الحرجة
  const criticalScores = acceptanceCriteria.criticalCriteria.map(
    criterion => tech.criteria[criterion as keyof typeof tech.criteria]
  );
  
  const meetsCriticalRequirements = criticalScores.every(
    score => score >= acceptanceCriteria.minimumCriticalScore
  );
  
  return averageScore >= acceptanceCriteria.minimumScore && meetsCriticalRequirements;
};
```

### **6.2 نظام إدارة التغييرات المطور**

```typescript
/**
 * @enum ChangeType
 * @description أنواع التغييرات المختلفة في النظام
 */
enum ChangeType {
  FEATURE_ADD = 'feature_add',
  FEATURE_MODIFY = 'feature_modify',
  FEATURE_REMOVE = 'feature_remove',
  BUG_FIX = 'bug_fix',
  PERFORMANCE_IMPROVEMENT = 'performance_improvement',
  SECURITY_UPDATE = 'security_update',
  DEPENDENCY_UPDATE = 'dependency_update',
  REFACTORING = 'refactoring',
}

/**
 * @interface ChangeRequest
 * @description هيكل طلب التغيير الشامل
 */
interface ChangeRequest {
  id: string;
  type: ChangeType;
  title: string;
  description: string;
  
  // تحليل التأثير
  impact: {
    scope: 'component' | 'feature' | 'application' | 'system';
    affected_components: string[];
    breaking_changes: boolean;
    performance_impact: 'positive' | 'neutral' | 'negative';
    security_impact: 'improves' | 'neutral' | 'degrades';
  };
  
  // متطلبات التنفيذ
  requirements: {
    testing_required: boolean;
    documentation_update: boolean;
    migration_needed: boolean;
    rollback_plan: string;
    approval_level: 'developer' | 'lead' | 'architect' | 'team';
  };
  
  // التتبع
  tracking: {
    created_by: string;
    created_at: Date;
    approved_by?: string;
    approved_at?: Date;
    implemented_by?: string;
    implemented_at?: Date;
    status: 'pending' | 'approved' | 'rejected' | 'implemented' | 'rolled_back';
  };
}

/**
 * @class ChangeManager
 * @description مدير التغييرات المطور للنظام
 */
class ChangeManager {
  /**
   * @method evaluateChange
   * @description يقيم طلب التغيير ويحدد إمكانية الموافقة عليه
   */
  static evaluateChange(request: ChangeRequest): {
    approved: boolean;
    reasons: string[];
    conditions: string[];
  } {
    const evaluation = {
      approved: false,
      reasons: [] as string[],
      conditions: [] as string[],
    };
    
    // قواعد التقييم الأساسية
    if (request.impact.breaking_changes) {
      evaluation.conditions.push('يتطلب موافقة المهندس المعماري');
      evaluation.conditions.push('يجب إنشاء خطة ترحيل مفصلة');
    }
    
    if (request.impact.security_impact === 'degrades') {
      evaluation.approved = false;
      evaluation.reasons.push('التغيير يؤثر سلباً على الأمان');
      return evaluation;
    }
    
    if (request.type === ChangeType.FEATURE_REMOVE) {
      evaluation.conditions.push('يتطلب تحليل تأثير على المستخدمين');
      evaluation.conditions.push('يجب توفير بديل أو مسار ترحيل');
    }
    
    // تقييم مستوى الموافقة المطلوب
    const requiredApproval = this.determineApprovalLevel(request);
    if (request.requirements.approval_level !== requiredApproval) {
      evaluation.conditions.push(`يتطلب موافقة من مستوى: ${requiredApproval}`);
    }
    
    // إذا لم تكن هناك أسباب رفض، الموافقة مشروطة
    if (evaluation.reasons.length === 0) {
      evaluation.approved = true;
    }
    
    return evaluation;
  }
  
  /**
   * @method determineApprovalLevel
   * @description يحدد مستوى الموافقة المطلوب بناءً على نوع التغيير
   */
  private static determineApprovalLevel(request: ChangeRequest): string {
    if (request.impact.breaking_changes || 
        request.impact.scope === 'system' ||
        request.type === ChangeType.SECURITY_UPDATE) {
      return 'architect';
    }
    
    if (request.impact.scope === 'application' ||
        request.type === ChangeType.FEATURE_ADD) {
      return 'lead';
    }
    
    return 'developer';
  }
}
```

---

## 7. معايير الجودة والأداء المطورة (Enhanced Quality & Performance Standards)

### **7.1 مقاييس الجودة الإجبارية**

```typescript
/**
 * @interface QualityMetrics
 * @description مقاييس الجودة الإجبارية لكل مكون
 */
interface QualityMetrics {
  // تغطية الاختبارات
  test_coverage: {
    unit_tests: number;        // الحد الأدنى: 70%
    integration_tests: number; // الحد الأدنى: 60%
    e2e_tests: number;        // الحد الأدنى: 50%
  };
  
  // جودة الكود
  code_quality: {
    complexity_score: number;  // الحد الأقصى: 10
    duplication_rate: number;  // الحد الأقصى: 5%
    maintainability_index: number; // الحد الأدنى: 80
  };
  
  // الأداء
  performance: {
    response_time_p95: number; // الحد الأقصى: 2000ms
    memory_usage: number;      // الحد الأقصى: 512MB
    cpu_usage: number;         // الحد الأقصى: 80%
  };
  
  // الأمان
  security: {
    vulnerability_count: number; // الحد الأقصى: 0 (عالي/حرج)
    security_score: number;       // الحد الأدنى: 8/10
  };
  
  // إمكانية الوصول
  accessibility: {
    wcag_compliance: 'AA' | 'AAA';
    lighthouse_score: number; // الحد الأدن��: 90
  };
}

/**
 * @class QualityGate
 * @description بوابة الجودة للتحقق من المعايير
 */
class QualityGate {
  /**
   * @method validateQuality
   * @description يتحقق من استيفاء معايير الجودة
   */
  static validateQuality(metrics: QualityMetrics): {
    passed: boolean;
    violations: string[];
    warnings: string[];
  } {
    const result = {
      passed: true,
      violations: [] as string[],
      warnings: [] as string[],
    };
    
    // فحص تغطية الاختبارات
    if (metrics.test_coverage.unit_tests < 70) {
      result.violations.push(`تغطية اختبارات الوحدة منخفضة: ${metrics.test_coverage.unit_tests}% (المطلوب: 70%)`);
      result.passed = false;
    }
    
    // فحص الأداء
    if (metrics.performance.response_time_p95 > 2000) {
      result.violations.push(`زمن الاستجابة مرتفع: ${metrics.performance.response_time_p95}ms (المسموح: 2000ms)`);
      result.passed = false;
    }
    
    // فحص الأمان
    if (metrics.security.vulnerability_count > 0) {
      result.violations.push(`توجد ثغرات أمنية: ${metrics.security.vulnerability_count}`);
      result.passed = false;
    }
    
    // تحذيرات (لا تمنع النشر لكن تحتاج انتباه)
    if (metrics.code_quality.complexity_score > 8) {
      result.warnings.push(`تعقيد الكود مرتفع: ${metrics.code_quality.complexity_score}`);
    }
    
    return result;
  }
}
```

### **7.2 نظام المراقبة والتنبيهات**

```typescript
/**
 * @interface MonitoringConfig
 * @description تكوين نظام المراقبة المطور
 */
interface MonitoringConfig {
  // مقاييس الأداء
  performance_metrics: {
    response_time_threshold: number;
    error_rate_threshold: number;
    throughput_threshold: number;
    memory_usage_threshold: number;
  };
  
  // مقاييس الأعمال
  business_metrics: {
    user_satisfaction_threshold: number;
    conversion_rate_threshold: number;
    feature_adoption_threshold: number;
  };
  
  // التنبيهات
  alerts: {
    critical: string[]; // قنوات التنبيه للمشاكل الحرجة
    warning: string[];  // قنوات التنبيه للتحذيرات
    info: string[];     // قنوات التنبيه للمعلومات
  };
}

/**
 * @class PerformanceMonitor
 * @description مراقب الأداء المطور
 */
class PerformanceMonitor {
  /**
   * @method trackMetric
   * @description يتتبع مقياس أداء معين
   */
  static trackMetric(
    metricName: string,
    value: number,
    tags: Record<string, string> = {},
  ): void {
    // تسجيل المقياس
    this.recordMetric(metricName, value, tags);
    
    // فحص العتبات والتنبيهات
    this.checkThresholds(metricName, value);
    
    // تحليل الاتجاهات
    this.analyzeTrends(metricName, value);
  }
  
  /**
   * @method generateHealthReport
   * @description ينشئ تقرير صحة النظام
   */
  static generateHealthReport(): SystemHealthReport {
    return {
      overall_status: this.calculateOverallHealth(),
      component_status: this.getComponentHealth(),
      performance_summary: this.getPerformanceSummary(),
      recommendations: this.generateRecommendations(),
      timestamp: new Date(),
    };
  }
}
```

---

## 8. التحذير النهائي المطور (Enhanced Final Warning)

### **🚨 قواعد غير قابلة للتفاوض**

1. **المصدر الوحيد للحقيقة**: هذا الملف (`ARCHITECTURE.md`) هو المرجع الوحيد والنهائي
2. **نقطة البداية الإجبارية**: `pnpm gpt:feature` للميزات الجديدة
3. **التقنيات الحصرية**: 
   - Tailwind CSS (التصميم)
   - Zustand (إدارة الحالة)
   - TanStack Query (جلب البيانات)
4. **الممنوعات المطلقة**:
   - `any` في TypeScript
   - `console.log` في الكود النهائي
   - `inline styles`
   - `!` (non-null assertion) بدون فحص مسبق
5. **الالتزامات الإجبارية**:
   - Conventional Commits
   - PR Templates
   - Unit Tests (70%+ تغطية)
   - توثيق شامل

### **🤖 تعليمات خاصة للوكلاء الآليين**

```typescript
/**
 * @interface AIAgentInstructions
 * @description تعليمات إجبارية لجميع الوكلاء الآليين
 */
interface AIAgentInstructions {
  // قبل أي تغيير
  before_any_change: [
    "قراءة ARCHITECTURE.md بالكامل",
    "فهم السياق والأهداف",
    "تحليل التأثير المحتمل",
    "التحقق من التوافق مع المعايير"
  ];
  
  // أثناء التطوير
  during_development: [
    "اتباع معايير التوثيق الشاملة",
    "كتابة اختبارات شاملة",
    "التحقق من الأداء والأمان",
    "مراجعة الكود قبل الإرسال"
  ];
  
  // بعد التنفيذ
  after_implementation: [
    "تشغيل جميع الاختبارات",
    "التحقق من معايير الجودة",
    "تحديث التوثيق",
    "مراقبة الأداء"
  ];
  
  // في حالة الشك
  when_in_doubt: [
    "التوقف فوراً",
    "طلب التوضيح",
    "عدم التخمين أو الافتراض",
    "الرجوع للمهندس المعماري"
  ];
}
```

### **⚡ آلية الاستجابة السريعة للمشاكل**

```typescript
/**
 * @enum ProblemSeverity
 * @description مستويات خطورة المشاكل
 */
enum ProblemSeverity {
  CRITICAL = 'critical',    // يؤثر على الإنتاج
  HIGH = 'high',           // يؤثر على الوظائف الأساسية
  MEDIUM = 'medium',       // يؤثر على تجربة المستخدم
  LOW = 'low',            // مشاكل تجميلية أو تحسينات
}

/**
 * @interface IncidentResponse
 * @description خطة الاستجابة للحوادث
 */
interface IncidentResponse {
  detection: {
    automated_monitoring: boolean;
    manual_reporting: boolean;
    user_feedback: boolean;
  };
  
  response_time: {
    [ProblemSeverity.CRITICAL]: '15 minutes';
    [ProblemSeverity.HIGH]: '1 hour';
    [ProblemSeverity.MEDIUM]: '4 hours';
    [ProblemSeverity.LOW]: '24 hours';
  };
  
  escalation_path: string[];
  communication_channels: string[];
  rollback_procedures: string[];
}
```

---

**أي محاولة للتحايل على هذه القواعد المطورة هي انتهاك مباشر لسلامة المشروع وستؤدي إلى الرفض الفوري والقاطع. لقد تم تحذيرك بوضوح تام.**

**هذا الدستور ليس مجرد إرشادات، بل هو قانون المشروع الذي يجب اتباعه بحذافيره.**

---

**– المهندس المعماري الرئيسي (Chief Architect)**  
**– نظام الذكاء الاصطناعي المطور (Enhanced AI System)**

**📅 تاريخ الإصدار**: 2025-07-08  
**🔄 حالة المراجعة**: مراجع ومعتمد  
**✅ حالة التنفيذ**: مطبق ومختبر  
**🚀 جاهزية الإنتاج**: مؤكدة
3000
---

## إعدادات المنافذ (Port Configuration)

### بيئة التطوير (Development Environment)
- **الواجهة الأمامية (Frontend)**: Port 3000
- **الواجهة الخلفية (Backend)**: Port 3002

### بيئة الإنتاج (Production Environment - Docker)
- **الواجهة الأمامية (Frontend)**: Port 3000
- **الواجهة الخلفية (Backend)**: Port 4000
- **قاعدة البيانات (Database)**: Port 5432

> **ملاحظة مهمة**: يجب التأكد من تطابق إعدادات المنافذ في جميع ملفات التكوين والوثائق. في بيئة التطوير، يستخدم Backend المنفذ 3002، بينما في بيئة الإنتاج (Docker) يستخدم المنفذ 4000.
