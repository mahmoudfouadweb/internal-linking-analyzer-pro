# استخدام صورة Node.js الرسمية كصورة أساسية
FROM node:20-alpine AS base

# تثبيت PNPM
ENV PNPM_HOME=/usr/local/bin
RUN corepack enable && corepack prepare pnpm@latest --activate

# تعيين دليل العمل
WORKDIR /app

# نسخ ملفات التكوين
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/ui/package.json ./packages/ui/package.json

# تثبيت التبعيات
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

# مرحلة البناء
FROM base AS builder

# نسخ كل الملفات المصدرية
COPY . .

# بناء التطبيق
RUN pnpm build

# مرحلة الإنتاج للواجهة الأمامية
FROM node:20-alpine AS frontend
WORKDIR /app

ENV NODE_ENV=production

# نسخ الملفات المبنية من مرحلة البناء
COPY --from=builder /app/apps/frontend/.next /app/.next
COPY --from=builder /app/apps/frontend/public /app/public
COPY --from=builder /app/apps/frontend/package.json /app/package.json
COPY --from=builder /app/apps/frontend/next.config.ts /app/next.config.ts

# تثبيت تبعيات الإنتاج فقط
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --prod

# تعريض المنفذ
EXPOSE 3000

# تشغيل التطبيق
CMD ["pnpm", "start"]

# مرحلة الإنتاج للواجهة الخلفية
FROM node:20-alpine AS backend
WORKDIR /app

ENV NODE_ENV=production

# نسخ الملفات المبنية من مرحلة البناء
COPY --from=builder /app/apps/backend/dist /app/dist
COPY --from=builder /app/apps/backend/package.json /app/package.json

# تثبيت تبعيات الإنتاج فقط
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --prod

# تعريض المنفذ
EXPOSE 4000

# تشغيل التطبيق
CMD ["node", "dist/main.js"]