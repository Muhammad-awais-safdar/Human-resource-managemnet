# ===================================================================
# AWAIS HR — OPTIMIZED ENTERPRISE FRONTEND DOCKERFILE
# Multi-stage Standalone Next.js Build for Minimal Image Footprint
# ===================================================================

# Stage 1: Dependencies Stage
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Stage 2: Standalone Next.js Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ARG NEXT_PUBLIC_API_VERSION=v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_VERSION=$NEXT_PUBLIC_API_VERSION
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Production Hardened Runtime Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG PORT=3000
ENV PORT=$PORT
ENV HOSTNAME="0.0.0.0"

# Security: Unprivileged system user execution (UID 1001)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE $PORT

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/ || exit 1

CMD ["node", "server.js"]
