# Dockerfile for Mindmap Web App (Next.js)
# Multi-stage build for production deployment

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./
COPY pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Copy workspace package files
COPY apps/mindmap-web/package.json ./apps/mindmap-web/
COPY packages/domain/package.json ./packages/domain/
COPY packages/editor/package.json ./packages/editor/
COPY packages/flashcard/package.json ./packages/flashcard/
COPY packages/sync/package.json ./packages/sync/

# Install dependencies
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code
COPY . .

# Build packages first
RUN npm run build --workspace=packages/domain
RUN npm run build --workspace=packages/editor
RUN npm run build --workspace=packages/flashcard
RUN npm run build --workspace=packages/sync

# Build web app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/mindmap-web

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/mindmap-web/public ./apps/mindmap-web/public

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/mindmap-web/.next ./apps/mindmap-web/.next
COPY --from=builder /app/apps/mindmap-web/package.json ./apps/mindmap-web/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/apps/mindmap-web

CMD ["npm", "start"]

