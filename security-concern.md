# Security Concerns — UpToYouShop

> Audit date: 2026-06-26 | Full report: `C:\Users\Lenovo\security-audit-skill\UptoyouShop\run-1\REPORT.md`

---

## 🔴 ต้องแก้ทันที (วันนี้)

### 1. Google OAuth Client Secret รั่วใน git

- **ไฟล์:** `frontend/.env.local:16`
- **ค่า:** `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`
- ** action:** ไป Revoke ที่ Google Cloud Console ทันที และลบ secret ออกจาก version control
- ตรวจสอบให้แน่ใจว่า `.env.local` อยู่ใน `.gitignore` แล้ว

### 2. Upload, Product, Category CRUD ไม่มี Authentication

- **ไฟล์:**
  - `services/app/api/upload/route.ts` — POST (อัปโหลด), DELETE (ลบไฟล์)
  - `services/app/api/products/route.ts` — POST (สร้างสินค้า)
  - `services/app/api/products/[id]/route.ts` — PUT (แก้ไข), DELETE (ลบสินค้า)
  - `services/app/api/categories/routes.ts` — POST (สร้างหมวดหมู่)
- **ผลกระทบ:** ใครก็ได้ที่ไม่ต้อง login สามารถอัปโหลดไฟล์, สร้าง/ลบสินค้า, สร้างหมวดหมู่ได้
- **แก้โดย:** เพิ่ม authentication guard (admin role check) ทุก endpoint

### 3. Path Traversal ใน DELETE Upload

- **ไฟล์:** `services/app/api/upload/route.ts:120-135`
- **ปัญหา:** เช็ค path ด้วย `startsWith("/uploads/")` ซึ่ง bypass ได้ เช่น `/uploads/../../../.env`
- **ผลกระทบ:** ลบไฟล์ .env หรือไฟล์ระบบอื่นๆ ได้
- **แก้โดย:** ใช้ `path.resolve()` แล้วตรวจสอบว่า canonical path อยู่ใน `/uploads/` จริงๆ

### 4. Auth Cookie ไม่มี HttpOnly + ใช้ Client Cookie ตัดสิน Role

- **ไฟล์:**
  - `frontend/src/lib/auth-cookie.ts:14` — ตั้ง cookie ผ่าน `document.cookie` โดยไม่มี HttpOnly
  - `frontend/src/middleware.ts:42-48` — parse JSON จาก cookie เพื่อตรวจ role (ปลอมแปลงได้)
- **ผลกระทบ:**
  - XSS สามารถขโมย cookie ได้
  - ผู้โจมตีสามารถปลอม cookie `{role:"SUPER_ADMIN"}` เพื่อ bypass middleware ได้
- **แก้โดย:** ตั้ง cookie ฝั่ง server ด้วย HttpOnly, Secure, SameSite=Strict และห้าม trust cookie ที่ client ตั้ง

---

## 🟡 ควรแก้ภายใน 1-3 วัน

### 5. Race Condition ตอนสร้าง Order (Overselling)

- **ไฟล์:** `backend/src/orders/orders.service.ts:28-129`
- **ปัญหา:** เช็ค stock → สร้าง order → reserve inventory ไม่ได้อยู่ใน transaction เดียวกัน
- **ผลกระทบ:** สินค้า stock=1 ขายได้พร้อมกัน 10 ออเดอร์
- **แก้โดย:** ใช้ Prisma interactive transaction ห่อหุ้มทั้ง 3 ขั้นตอน

### 6. JWT Access Token เก็บใน localStorage

- **ไฟล์:** `frontend/src/store/user-store.ts:163-168`
- **ปัญหา:** Zustand persist middleware เขียน JWT ลง localStorage
- **ผลกระทบ:** XSS สามารถขโมย JWT และ impersonate ผู้ใช้ได้
- **แก้โดย:** ไม่ persist accessToken ไว้ใน localStorage เก็บแค่ใน memory closure (`_accessToken` ใน `api.ts`)

### 7. สร้าง Order ได้โดยไม่ต้องชำระเงิน

- **ไฟล์:** `backend/src/orders/orders.service.ts:20`
- **ปัญหา:** สร้าง order แล้ว reserve inventory ทันที โดยไม่รอให้ยืนยัน payment
- **ผลกระทบ:** ผู้ใช้สามารถจอง stock ทั้งหมดได้ฟรี ไม่ต้องจ่ายเงิน
- **แก้โดย:** Reserve inventory หลังจาก payment confirmation เท่านั้น + เพิ่ม cron job ปล่อย stock สำหรับ unpaid orders

### 8. ฟังก์ชัน hashPassword ปลอม

- **ไฟล์:** `services/lib/utils/api.ts:201-210`
- **รหัส:**
  ```typescript
  export async function hashPassword(password: string) {
    return `hashed_${password}`  // ไม่ได้ hash จริง!
  }
  ```
- **ผลกระทบ:** ตอนนี้ไม่ถูกเรียกใช้ แต่ถ้ามีใคร import ไปใช้ จะเก็บ password ในรูปแบบ plaintext
- **แก้โดย:** ลบฟังก์ชันทั้งสองออกทันที

---

## 🟢 ควรแก้ภายใน 1 สัปดาห์

### 9. Public Product Listing Show All Products

- **ไฟล์:** `backend/src/products/products.controller.ts:28-32`
- **ปัญหา:** `GET /products?showAll=true` — คนไม่ต้อง login ก็เห็นสินค้าที่ inactive ได้
- **แก้โดย:** กัน `showAll` ไว้สำหรับ admin เท่านั้น

### 10. ไม่มี Content Security Policy (CSP)

- **ไฟล์:** `frontend/next.config.js`
- **แก้โดย:** เพิ่ม security headers: CSP, X-Content-Type-Options, X-Frame-Options

### 11. Validate items array ใน Create Order

- **ไฟล์:** `backend/src/orders/create-order.dto.ts:76`
- **ปัญหา:** ไม่มี `@ArrayMinSize(1)` — สร้าง order โดยไม่มีสินค้าได้
- **แก้โดย:** เพิ่ม `@ArrayMinSize(1)` decorator

### 12. Default Secrets ใน Config

- **ไฟล์:** `backend/src/config/app.config.ts:8-13`
- **ค่า:** `JWT_SECRET` default เป็น `"default-secret"`, `COOKIE_SECRET` เป็น `"default-cookie-secret"`
- **แก้โดย:** ลบ default หรือ throw error ถ้าไม่ได้ set env var

---

> ดูรายละเอียดเพิ่มเติมได้ที่ `C:\Users\Lenovo\security-audit-skill\UptoyouShop\run-1\FINDINGS-DETAIL.md`
