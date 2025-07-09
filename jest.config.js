/**
 * @file jest.config.js
 * @description إعدادات Jest الرئيسية للمشروع
 */

module.exports = {
  projects: [
    '<rootDir>/apps/backend/jest.config.js',
    '<rootDir>/apps/frontend/jest.config.js',
  ],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/.next/**',
    '!**/jest.config.js',
    '!**/jest.setup.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testEnvironment: 'node',
};