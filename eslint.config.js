export default [
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      // Very basic rules only for JS files
      'no-console': 'off',
      'no-debugger': 'off',
      'prefer-const': 'off',
      'no-var': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    ignores: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.d.ts',
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      '.turbo/**',
      'coverage/**',
      '*.config.*',
      'jest.config.js',
      'jest.setup.js',
      'turbo.json',
      '.eslintrc.js',
      'my-turborepo/**',
      'apps/backend/dist/**',
      'apps/frontend/.next/**',
      'packages/types/dist/**',
      '**/jest.setup.js',
    ],
  },
];