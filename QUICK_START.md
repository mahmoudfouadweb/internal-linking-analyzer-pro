# Quick Start Guide - Internal Linking Analyzer Pro

## 🚀 Get Started in 3 Minutes

### Prerequisites
- Node.js 20.10.0+
- PNPM 8.x+

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Build Shared Types
```bash
pnpm --filter @internal-linking-analyzer-pro/types run build
```

### 3. Start Both Servers

**Terminal 1 - Backend (Port 3002)**:
```bash
pnpm --filter backend run start:dev
```

**Terminal 2 - Frontend (Port 3000)**:
```bash
pnpm --filter frontend run dev
```

### 4. Test the Application

**Option A: Use the Web Interface**
1. Open http://localhost:3000
2. Click "أداة استخراج الكلمات" in sidebar
3. Enter: `https://plumbingservicesinkuwait.com`
4. Enable all settings
5. Click "تحليل الموقع"

**Option B: Test API Directly**
```bash
curl -X POST http://localhost:3002/sitemap-parser/parse \
  -H "Content-Type: application/json" \
  -d '{
    "baseUrl": "https://plumbingservicesinkuwait.com",
    "settings": {
      "extractTitleH1": true,
      "checkCanonical": true,
      "estimateCompetition": true
    }
  }'
```

## ✅ Expected Results

- **Backend**: Should extract 50+ URLs with Arabic keywords
- **Frontend**: Should display results in organized table
- **Processing Time**: ~5-10 seconds for typical websites

## 🔧 Troubleshooting

**Port Conflicts**: 
- Backend uses port 3002
- Frontend uses port 3000

**Build Issues**:
```bash
# Clean and rebuild
pnpm --filter backend run build
pnpm --filter frontend run build
```

**Type Errors**:
```bash
# Rebuild shared types
pnpm --filter @internal-linking-analyzer-pro/types run build
```

## 🧪 Running Tests

### Backend Tests
```bash
# Run all backend tests
pnpm --filter backend run test

# Run tests with coverage report
pnpm --filter backend run test:cov

# Run tests in watch mode during development
pnpm --filter backend run test:watch
```

### Frontend Tests
```bash
# Run all frontend tests
pnpm --filter frontend run test

# Run tests with coverage report
pnpm --filter frontend run test:coverage

# Run tests in watch mode during development
pnpm --filter frontend run test:watch
```

### Using MSW for Testing
Mock Service Worker (MSW) is configured for frontend tests to intercept API requests:

```typescript
// Example MSW handler in a test file
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.post('http://localhost:3002/sitemap-parser/parse', (req, res, ctx) => {
    return res(ctx.json({ 
      urls: [{url: 'https://example.com', title: 'Example'}]
    }))
  })
)

beforeAll(() => server.listen())
aftereEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## 📚 Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for development guidelines
- Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for completion details
- Review [FINAL_TEST.md](./FINAL_TEST.md) for test results
- Explore [TESTING.md](./TESTING.md) for detailed testing documentation

---

**Ready to analyze sitemaps! 🎉**