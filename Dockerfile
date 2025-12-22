# استخدام Node.js 20 Alpine كصورة أساسية
FROM node:20-alpine AS base

# تثبيت dependencies المطلوبة لـ Sharp
RUN apk add --no-cache libc6-compat

WORKDIR /app

# ===== المرحلة 1: تثبيت Dependencies =====
FROM base AS deps

# نسخ ملفات package
COPY package.json package-lock.json* ./

# تثبيت dependencies
RUN npm ci

# ===== المرحلة 2: البناء =====
FROM base AS builder

WORKDIR /app

# استقبال build argument
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# نسخ node_modules من مرحلة deps
COPY --from=deps /app/node_modules ./node_modules

# نسخ كل ملفات المشروع
COPY . .

# تعطيل telemetry في Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# بناء التطبيق
RUN npm run build

# ===== المرحلة 3: Production =====
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# إنشاء مستخدم غير root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# نسخ الملفات الضرورية فقط
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# نسخ ملفات البناء مع الصلاحيات الصحيحة
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# التبديل إلى المستخدم غير root
USER nextjs

# فتح المنفذ 3000
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# تشغيل التطبيق
CMD ["node", "server.js"]
