#!/bin/sh
# set -e

echo "Pushing database schema..."
npx prisma db push --schema=./database/schema.prisma

echo "Checking if database is already seeded..."
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count()
  .then(c => process.exit(c > 0 ? 0 : 1))
  .finally(() => p.\$disconnect());
"

if [ $? -ne 0 ]; then
  echo "Seeding database..."
  tsx database/seed.ts
else
  echo "Database already seeded, skipping..."
fi

echo "Starting application..."
exec node dist/main.js