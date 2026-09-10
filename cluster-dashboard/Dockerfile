# ==============================================================================
# Shamssoftware RKE2 & Cilium Enterprise Hub - Container Image
# Multi-stage lightweight production container
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Compile modular HTML template
RUN npm run build:html

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5050

# Security: Non-root user
USER node

COPY --chown=node:node --from=builder /app /app

EXPOSE 5050

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5050/ || exit 1

CMD ["node", "server.js"]
