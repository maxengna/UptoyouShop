# Flow จัดการ Layout ระหว่าง Admin กับ Customer

## สถานะปัจจุบัน (Current State)

```
app/layout.tsx (root layout — ใช้ร่วมกันหมด)
├── Header (component เดียว)
├── children
│   ├── (shop)/*       → home, product, category, checkout, about, deals, contact
│   ├── (admin)/*      → dashboard, products, categories, orders
│   └── (auth)/*       → signin, signup, forgot-password
├── Footer
├── CartDrawer
└── StickyCartBar
```

**ปัญหา:**
- Admin กับ Customer ใช้ `Header` + `Footer` ตัวเดียวกัน
- ไม่มี Sidebar หรือ Navigation สำหรับ Admin โดยเฉพาะ
- `(auth)` มี layout แยกแต่ minimal มาก
- `(admin)` ไม่มี layout ของตัวเอง
- ไม่มี role-based redirect หลัง login

---

## โครงสร้าง Route Groups ที่ควรแยก

```
app/
├── layout.tsx                    ← root layout (global providers, fonts)
│
├── (public)/*                    ← หน้าสำหรับผู้ใช้ทั่วไป (ไม่ต้อง login)
│   ├── layout.tsx                ← public layout (Header + Footer)
│   └── page.tsx                  → /
│   └── about/page.tsx            → /about
│   └── contact/page.tsx          → /contact
│   └── deals/page.tsx            → /deals
│
├── (shop)/*                      ← หน้าสำหรับ customer (ต้อง login)
│   ├── layout.tsx                ← shop layout (Header + Footer + CartDrawer)
│   ├── page.tsx                  → /shop
│   ├── product/[slug]/page.tsx   → /shop/product/...
│   ├── category/[slug]/page.tsx  → /shop/category/...
│   ├── checkout/page.tsx         → /shop/checkout
│   ├── profile/page.tsx          → /shop/profile
│   ├── orders/page.tsx           → /shop/orders
│   └── wishlist/page.tsx         → /shop/wishlist
│
├── (admin)/*                     ← หน้าสำหรับ admin เท่านั้น
│   ├── layout.tsx                ← admin layout (Sidebar + Topbar)
│   ├── dashboard/page.tsx        → /admin/dashboard
│   ├── products/...
│   ├── categories/...
│   └── orders/...
│
└── (auth)/*                      ← หน้า auth (ไม่ต้อง login)
    └── layout.tsx                ← auth layout (minimal, ไม่มี Header/Footer)
    └── signin/page.tsx           → /signin
    └── signup/page.tsx           → /signup
    └── forgot-password/page.tsx  → /forgot-password
```

---

## Layout Components ตาม Role

### 1. Public Layout — `(public)/layout.tsx`
```tsx
// สำหรับผู้ใช้ทั่วไป (ไม่ต้อง login)
<Header />          ← แสดง Shop Nav, Search, Login/Signup buttons
<main>{children}</main>
<Footer />
```

### 2. Shop Layout — `(shop)/layout.tsx`
```tsx
// สำหรับ customer ที่ login แล้ว
<Header />          ← แสดง Shop Nav, Search, Cart, User Menu (My Profile, Orders, Wishlist, Logout)
<main>{children}</main>
<Footer />
<CartDrawer />
<StickyCartBar />
```

### 3. Admin Layout — `(admin)/layout.tsx`
```tsx
// สำหรับ admin/super_admin เท่านั้น
<div class="flex">
  <Sidebar />
  <div class="flex-1">
    <Topbar />      ← User info, Logout
    <main>{children}</main>
  </div>
</div>
```

### 4. Auth Layout — `(auth)/layout.tsx`
```tsx
// minimal — ไม่มี Header/Footer
<div class="min-h-screen flex items-center justify-center">
  {children}
</div>
```

---

## Authentication Flow

### Login Flow
```
POST /api/auth/login
  ├── role: CUSTOMER   → redirect ไป /shop
  ├── role: ADMIN      → redirect ไป /admin/dashboard
  └── role: SUPER_ADMIN → redirect ไป /admin/dashboard
```

### Route Protection Flow
```
Request → Middleware (middleware.ts)
  ├── ไม่มี access token → redirect /signin
  ├── role: CUSTOMER
  │   ├── request /admin/*  → 403 Forbidden
  │   └── request /shop/*   → Allow
  ├── role: ADMIN
  │   ├── request /admin/*  → Allow
  │   └── request /shop/*   → Allow
  └── role: SUPER_ADMIN → Allow all
```

### Token Management Flow
```
Login success
  ├── Backend ส่ง tokens ใน response
  │   ├── accessToken (JWT, expires 15m)   → body response
  │   └── refreshToken (expires 7d)        → httpOnly cookie
  │
  ├── Frontend เก็บ accessToken ใน memory/store
  │
  └── Axios interceptor
      ├── แนบ Authorization: Bearer <accessToken>
      ├── ถ้า 401 → เรียก POST /api/auth/refresh
      ├── refresh สำเร็จ → retry request
      └── refresh ไม่สำเร็จ → logout → redirect /signin
```

---

## Role-based Guard (Backend)

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
```

| Endpoint | CUSTOMER | ADMIN | SUPER_ADMIN |
|----------|----------|-------|-------------|
| GET /api/products | ✅ | ✅ | ✅ |
| POST /api/products | ❌ | ✅ | ✅ |
| PUT /api/products/:id | ❌ | ✅ | ✅ |
| DELETE /api/products/:id | ❌ | ✅ | ✅ |
| POST /api/categories | ❌ | ✅ | ✅ |
| PUT /api/categories/:id | ❌ | ✅ | ✅ |
| DELETE /api/categories/:id | ❌ | ✅ | ✅ |
| PUT /api/orders/:id/status | ❌ | ✅ | ✅ |
| GET /api/admin/analytics/* | ❌ | ✅ | ✅ |
| GET /api/admin/orders | ❌ | ✅ | ✅ |
| GET /api/admin/users | ❌ | ✅ | ✅ |
| PUT /api/admin/users/:id/role | ❌ | ❌ | ✅ |
| GET /api/user/profile | ✅ | ✅ | ✅ |
| PUT /api/user/profile | ✅ | ✅ | ✅ |
| GET /api/user/addresses | ✅ | ✅ | ✅ |
| GET /api/user/orders | ✅ | ✅ | ✅ |
| GET /api/user/wishlist | ✅ | ✅ | ✅ |

⚠️ **Note:** ปัจจุบัน Guard ของ Products และ Categories ถูก comment ไว้ ต้องไปเปิด

---

## สิ่งที่ต้องทำ (To-Do List)

1. **แยก Layout** — สร้าง `(shop)/layout.tsx`, `(admin)/layout.tsx`, Public layout
2. **สร้าง Admin Sidebar** — Component sidebar สำหรับ admin navigation
3. **สร้าง Admin Topbar** — Component topbar สำหรับ admin (user info, logout)
4. **สร้าง middleware.ts** — Route protection ตาม role
5. **ต่อ auth จริง** — connect user-store กับ backend API
6. **เพิ่ม token management** — axios interceptor + refresh token
7. **เพิ่มหน้า Profile** — `/shop/profile`, `/shop/orders`, `/shop/wishlist`
8. **เปิด Guard** — uncomment `@UseGuards` ใน Products และ Categories controller
