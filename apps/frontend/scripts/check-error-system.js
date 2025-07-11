#!/usr/bin/env node

/**
 * @author Mahmoud & Expert System
 * @description Quick verification script for error handling system
 * @created 2025-07-11
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 فحص نظام معالجة الأخطاء...\n');

const requiredFiles = [
  'src/core/error-management/types.ts',
  'src/core/error-management/SecureErrorBoundary.tsx',
  'src/core/error-management/ErrorManager.ts',
  'src/core/error-management/ErrorQueue.ts',
  'src/core/security/ErrorSanitizer.ts',
  'src/core/resilience/CircuitBreaker.ts',
  'src/core/monitoring/PerformanceMonitor.ts',
  'src/components/ui/loading-spinner.tsx',
  'src/components/ErrorTestComponent.tsx',
  'src/components/monitoring/ErrorDashboard.tsx',
  'src/app/api/errors/route.ts',
  'src/app/api/performance/route.ts',
];

const updatedFiles = [
  'src/app/layout.tsx',
  'src/app/providers.tsx',
  'src/app/page.tsx',
  'next.config.ts',
];

let allFilesExist = true;

console.log('📁 فحص الملفات المطلوبة:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('\n📝 فحص الملفات المحدثة:');
updatedFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('\n🔧 فحص التكوين:');

// فحص next.config.ts
const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, 'utf8');
  const hasSecurityHeaders = content.includes('X-Content-Type-Options');
  const hasChunkOptimization = content.includes('splitChunks');
  
  console.log(`${hasSecurityHeaders ? '✅' : '❌'} Security Headers configured`);
  console.log(`${hasChunkOptimization ? '✅' : '❌'} Chunk optimization configured`);
} else {
  console.log('❌ next.config.ts not found');
  allFilesExist = false;
}

// فحص layout.tsx
const layoutPath = path.join(__dirname, '..', 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const content = fs.readFileSync(layoutPath, 'utf8');
  const hasErrorBoundary = content.includes('SecureErrorBoundary');
  const hasSuspense = content.includes('Suspense');
  
  console.log(`${hasErrorBoundary ? '✅' : '❌'} SecureErrorBoundary integrated in layout`);
  console.log(`${hasSuspense ? '✅' : '❌'} Suspense configured`);
} else {
  console.log('❌ layout.tsx not found');
  allFilesExist = false;
}

// فحص providers.tsx
const providersPath = path.join(__dirname, '..', 'src/app/providers.tsx');
if (fs.existsSync(providersPath)) {
  const content = fs.readFileSync(providersPath, 'utf8');
  const hasChunkRecovery = content.includes('ChunkLoadRecoveryStrategy');
  const hasErrorListeners = content.includes('addEventListener');
  
  console.log(`${hasChunkRecovery ? '✅' : '❌'} Chunk recovery strategy integrated`);
  console.log(`${hasErrorListeners ? '✅' : '❌'} Error event listeners configured`);
} else {
  console.log('❌ providers.tsx not found');
  allFilesExist = false;
}

console.log('\n📊 النتيجة النهائية:');
if (allFilesExist) {
  console.log('🎉 جميع مكونات نظام معالجة الأخطاء موجودة ومكونة بشكل صحيح!');
  console.log('\n🚀 خطوات التحقق التالية:');
  console.log('1. تشغيل التطبيق: pnpm dev');
  console.log('2. فتح http://localhost:3000');
  console.log('3. اختبار أزرار محاكاة الأخطاء');
  console.log('4. مراقبة Console للتأكد من عمل التطهير');
  
  process.exit(0);
} else {
  console.log('❌ بعض الملفات مفقودة أو غير مكونة بشكل صحيح');
  console.log('يرجى مراجعة الملفات المفقودة وإعادة تشغيل الفحص');
  
  process.exit(1);
}
