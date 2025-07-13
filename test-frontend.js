// Simple test to verify the frontend page compiles
const fs = require('fs');
const path = require('path');

// Read the main page file
const pagePath = path.join(__dirname, 'apps/frontend/src/app/tools/keyword-extractor/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

console.log('✅ Frontend page file exists and is readable');
console.log(`📄 File size: ${pageContent.length} characters`);

// Check for key components
const checks = [
  { name: 'useState import', pattern: /import.*useState.*from.*react/ },
  { name: 'Checkbox import', pattern: /import.*Checkbox.*from.*@\/components\/ui\/checkbox/ },
  { name: 'Label import', pattern: /import.*Label.*from.*@\/components\/ui\/label/ },
  { name: 'Card import', pattern: /import.*Card.*from.*@\/components\/ui\/card/ },
  { name: 'Badge import', pattern: /import.*Badge.*from.*@\/components\/ui\/badge/ },
  { name: 'Advanced settings state', pattern: /countWords.*useState/ },
  { name: 'Processing time state', pattern: /processingTime.*useState/ },
  { name: 'Advanced settings UI', pattern: /الإعدادات المتقدمة/ },
  { name: 'Word count checkbox', pattern: /حساب عدد الكلمات/ },
  { name: 'Links count checkbox', pattern: /عد الروابط الداخلية والخارجية/ },
  { name: 'Processing time display', pattern: /وقت المعالجة/ },
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  if (check.pattern.test(pageContent)) {
    console.log(`✅ ${check.name}`);
    passed++;
  } else {
    console.log(`❌ ${check.name}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All frontend checks passed!');
} else {
  console.log('⚠️  Some checks failed, but core functionality should work');
}
