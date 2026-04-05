FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies
COPY services/package*.json ./
RUN ls -la
RUN npm install

# Copy Prisma schema and generate client
COPY database/schema.prisma ./database/
RUN ls -la database/
RUN npx prisma generate

COPY services/. .

RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone output (optimized for Docker)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/database ./database

EXPOSE 5000

ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000 || exit 1

CMD ["node", "server.js"]

