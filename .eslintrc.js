/**
 * @file .eslintrc.js
 * @description إعدادات ESLint الرئيسية للمشروع
 */

module.exports = {
  root: true,
  extends: ['./packages/config/eslint-preset.js'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.base.json'],
  },
  settings: {
    next: {
      rootDir: ['apps/frontend'],
    },
  },
  rules: {
    // قواعد إضافية خاصة بالمشروع بأكمله
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
  },
};