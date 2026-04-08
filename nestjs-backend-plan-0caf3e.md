# NestJS Backend Implementation Plan

Create a complete NestJS backend API in the `backend/` folder with all services (Products, Cart, Orders, Auth, Users, Admin), Passport.js + JWT authentication, and reuse the existing Prisma schema.

## Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── common/                    # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/                    # Configuration
│   │   └── app.config.ts
│   ├── prisma/                    # Prisma module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── auth/                      # Auth module (Passport + JWT)
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       └── refresh-token.dto.ts
│   ├── users/                     # Users module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   ├── products/                  # Products module
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── dto/
│   │       ├── create-product.dto.ts
│   │       ├── update-product.dto.ts
│   │       └── product-query.dto.ts
│   ├── cart/                      # Cart module
│   │   ├── cart.module.ts
│   │   ├── cart.controller.ts
│   │   ├── cart.service.ts
│   │   └── dto/
│   │       ├── add-cart-item.dto.ts
│   │       └── update-cart-item.dto.ts
│   ├── orders/                    # Orders module
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── dto/
│   │       ├── create-order.dto.ts
│   │       └── update-order-status.dto.ts
│   ├── admin/                     # Admin module
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── dto/
│   └── reviews/                   # Reviews module
│       ├── reviews.module.ts
│       ├── reviews.controller.ts
│       ├── reviews.service.ts
│       └── dto/
│           ├── create-review.dto.ts
│           └── update-review.dto.ts
├── test/
├── prisma/
│   └── schema.prisma              # Symlink to ../../database/schema.prisma
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env
```

## Phase 1: Project Setup

1. **Initialize NestJS Project**
   - Use Nest CLI to create new project in `backend/` folder
   - Configure TypeScript strict mode
   - Set up Express platform

2. **Install Dependencies**
   - `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
   - `@nestjs/config` for environment variables
   - `@prisma/client`, `prisma` for ORM
   - `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt` for auth
   - `bcrypt`, `class-validator`, `class-transformer` for validation
   - `zod` for additional validation (consistent with existing code)

3. **Prisma Setup**
   - Create symlink or copy schema from `database/schema.prisma`
   - Generate Prisma client
   - Create Prisma module and service

## Phase 2: Auth Module (Passport + JWT)

1. **Auth Module Structure**
   - `auth.module.ts` - Configure JWT and Passport
   - `auth.controller.ts` - Login, register, refresh endpoints
   - `auth.service.ts` - Business logic
   - `jwt.strategy.ts` - JWT validation strategy
   - `jwt-auth.guard.ts` - Route protection guard
   - `roles.guard.ts` - Role-based access control

2. **JWT Configuration**
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry
   - Store in HttpOnly cookies

3. **DTOs**
   - `LoginDto`: email, password
   - `RegisterDto`: email, password, name, phone
   - `RefreshTokenDto`: refreshToken

## Phase 3: Core API Modules

### Products Module
- `GET /products` - List with pagination, filtering, sorting
- `GET /products/:id` - Get single product
- `POST /products` - Create (Admin only)
- `PUT /products/:id` - Update (Admin only)
- `DELETE /products/:id` - Delete (Admin only)
- `GET /products/:id/reviews` - Get product reviews
- `POST /products/:id/reviews` - Add review (Authenticated)

### Cart Module
- `GET /cart` - Get user cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:id` - Update cart item quantity
- `DELETE /cart/items/:id` - Remove cart item
- `DELETE /cart` - Clear cart
- `POST /cart/apply-coupon` - Apply coupon code

### Orders Module
- `POST /orders` - Create order
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update status (Admin only)
- `GET /orders/tracking/:orderNumber` - Track order

### Users Module
- `GET /user/profile` - Get profile
- `PUT /user/profile` - Update profile
- `GET /user/addresses` - List addresses
- `POST /user/addresses` - Add address
- `PUT /user/addresses/:id` - Update address
- `DELETE /user/addresses/:id` - Delete address
- `GET /user/orders` - Order history
- `GET /user/wishlist` - Get wishlist
- `POST /user/wishlist` - Add to wishlist
- `DELETE /user/wishlist/:id` - Remove from wishlist

### Admin Module
- `GET /admin/analytics/sales` - Sales analytics
- `GET /admin/analytics/products` - Product analytics
- `GET /admin/analytics/customers` - Customer analytics
- `GET /admin/orders` - All orders (Admin only)
- `GET /admin/users` - All users (Admin only)
- `PUT /admin/users/:id/role` - Update user role

## Phase 4: Common Infrastructure

1. **Global Pipes**
   - ValidationPipe with class-validator
   - TransformPipe for DTO transformation

2. **Exception Filters**
   - AllExceptionsFilter for consistent error responses
   - PrismaExceptionFilter for database errors
   - ZodExceptionFilter for validation errors

3. **Interceptors**
   - TransformInterceptor for consistent response format
   - LoggingInterceptor for request logging

4. **Guards**
   - JwtAuthGuard - JWT authentication
   - RolesGuard - Role-based authorization
   - OwnerGuard - Resource ownership check

## Phase 5: Response Format

Standard response format matching existing API:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "errors": []
}
```

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/uptoyou

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Implementation Order

1. Project setup and Prisma configuration
2. Auth module (Passport + JWT)
3. Users module
4. Products module
5. Cart module
6. Orders module
7. Reviews module
8. Admin module
9. Common utilities (filters, interceptors, guards)
10. Testing and documentation

## Notes

- Use existing Prisma schema from `database/schema.prisma`
- Follow NestJS naming conventions (PascalCase for classes, camelCase for methods)
- Maintain consistent API response format with existing services
- Implement proper error handling and logging
- Add Swagger/OpenAPI documentation for all endpoints
