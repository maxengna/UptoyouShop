FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and shared schema
COPY frontend/ ./

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone output (optimized for Docker)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
