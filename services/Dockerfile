FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files to services/
COPY services/package*.json ./services/
COPY database/schema.prisma ./database/
COPY database/prisma.ts ./database/

RUN npm ci --prefix services

# Generate Prisma client
RUN npx prisma generate --schema database/schema.prisma

WORKDIR /app/services

# Copy services preserving structure
COPY services/. .

RUN npm run build


FROM node:20-alpine AS runner

ENV NODE_ENV=production

# Copy standalone output
COPY --from=builder /app/services/.next/standalone ./app
COPY --from=builder /app/services/.next/static ./app/.next/static
COPY --from=builder /app/database ./database

WORKDIR /app/app

EXPOSE 5000

ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000 || exit 1

CMD ["node", "server.js"]
