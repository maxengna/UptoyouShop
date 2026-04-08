# UpToYouShop NestJS Backend

A complete NestJS backend API for the UpToYouShop e-commerce platform.

## Features

- **Authentication**: Passport.js + JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **API Documentation**: Swagger/OpenAPI
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Class-validator & class-transformer
- **Security**: CORS, cookie-parser, helmet-ready

## Modules

1. **Auth** - Login, register, refresh tokens, JWT authentication
2. **Users** - Profile management, addresses, wishlist, order history
3. **Products** - Product catalog with filtering, sorting, pagination
4. **Cart** - Shopping cart management, coupon application
5. **Orders** - Order creation, tracking, status updates
6. **Reviews** - Product reviews and ratings
7. **Admin** - Sales analytics, user management, order management

## Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── users/          # User management module
│   ├── products/       # Product catalog module
│   ├── cart/           # Shopping cart module
│   ├── orders/         # Order management module
│   ├── reviews/        # Reviews module
│   ├── admin/          # Admin dashboard module
│   ├── prisma/         # Prisma configuration
│   ├── common/         # Guards, filters, interceptors, decorators
│   ├── config/         # App configuration
│   ├── app.module.ts
│   └── main.ts
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Create `.env` file:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/uptoyou
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGIN=http://localhost:3000
COOKIE_SECRET=your-cookie-secret
```

## Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

Once running, access Swagger UI at:
http://localhost:3001/api/docs

## Scripts

- `npm run build` - Build the application
- `npm run start:dev` - Start in development mode
- `npm run start:prod` - Start in production mode
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
