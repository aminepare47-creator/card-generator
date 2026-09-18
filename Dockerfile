# MyCard — image de production (Node 22 + Next.js standalone)
# Utilisable sur Koyeb, Hugging Face Spaces, Fly.io, Render, un VPS…

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# sharp a besoin de ces libs sur Alpine pour les images.
RUN apk add --no-cache libc6-compat vips-dev build-base python3 \
  && npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat vips-dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT=standalone
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat vips \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
# In a Docker build the project lives at /app, so the standalone server is
# /app/.next/standalone/server.js. The fallback covers the (rare) case where
# Next nests it under a sub-folder.
CMD ["sh", "-c", "if [ -f server.js ]; then exec node server.js; fi; d=$(find . -maxdepth 4 -name server.js -not -path './node_modules/*' | head -n 1); exec node \"$d\""]