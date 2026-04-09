FROM node:18-alpine AS base

# 阶段 1: 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 启用 pnpm
RUN corepack enable pnpm

# 复制依赖清单并安装
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i --frozen-lockfile

# 阶段 2: 构建项目
FROM base AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 提供临时的构建期环境变量，防止 Next.js 在预渲染 API 时因找不到变量而崩溃
ENV UPSTASH_URL="https://dummy-for-build.upstash.io"
ENV UPSTASH_TOKEN="dummy_token"

# 执行构建命令
RUN pnpm run build

# 阶段 3: 运行环境
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# 创建非 root 用户，提升安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制 public 目录
COPY --from=builder /app/public ./public

# 创建 .next 目录并赋予权限
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 复制 standalone 产物和静态文件 (依赖于 next.config.mjs 中的 output: 'standalone')
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]