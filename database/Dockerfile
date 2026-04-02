# Stage 1: Generate Prisma Client
FROM node:20-alpine AS prisma-generator
WORKDIR /app
# Install Prisma CLI only
RUN npm install -g prisma
# Copy schema and generate client
COPY schema.prisma ./prisma/
RUN npx prisma generate

# Stage 2: Production Image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install Prisma CLI for migrations
RUN npm install -g prisma

# Copy generated Prisma client
COPY --from=prisma-generator /app/node_modules ./node_modules
COPY --from=prisma-generator /app/prisma ./prisma

# Copy application files
COPY prisma.ts ./
COPY seed.ts ./

# Create non-root user for security
RUN addgroup -g 1001 -S prisma && \
    adduser -S prisma -u 1001
USER prisma

# Run database migrations and seed
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed --preview-feature && echo 'Database setup completed'"]