import { z } from 'zod'

// Registration validation
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must not exceed 255 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must not exceed 100 characters'),
})

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Password reset validation
export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

// Change password validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100, 'New password must not exceed 100 characters'),
})

// Profile update validation
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must not exceed 255 characters').optional(),
  avatar: z.string().url('Please enter a valid URL').optional().nullable(),
  phone: z.string().regex(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number').optional().nullable(),
})

// Address validation
export const addressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING'], {
    errorMap: () => ({ message: 'Address type must be either SHIPPING or BILLING' }),
  }),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name must not exceed 100 characters'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name must not exceed 100 characters'),
  company: z.string().max(100, 'Company name must not exceed 100 characters').optional().nullable(),
  address1: z.string().min(1, 'Address is required').max(255, 'Address must not exceed 255 characters'),
  address2: z.string().max(255, 'Address line 2 must not exceed 255 characters').optional().nullable(),
  city: z.string().min(1, 'City is required').max(100, 'City must not exceed 100 characters'),
  state: z.string().min(1, 'State is required').max(100, 'State must not exceed 100 characters'),
  zipCode: z.string().min(1, 'Zip code is required').max(20, 'Zip code must not exceed 20 characters'),
  country: z.string().min(1, 'Country is required').max(100, 'Country must not exceed 100 characters'),
  phone: z.string().regex(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number').optional().nullable(),
  isDefault: z.boolean().optional(),
})

// Order creation validation
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    variantId: z.string().optional().nullable(),
  })).min(1, 'At least one item is required'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional().nullable(),
})

// Cart item validation
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(99, 'Quantity must not exceed 99'),
  variantId: z.string().optional().nullable(),
})

// Cart item update validation
export const updateCartItemSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1').max(99, 'Quantity must not exceed 99'),
})

// Product creation validation
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Product name must not exceed 255 characters'),
  slug: z.string().min(1, 'Product slug is required').max(255, 'Product slug must not exceed 255 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional().nullable(),
  price: z.number().min(0, 'Price must be a positive number'),
  originalPrice: z.number().min(0, 'Original price must be a positive number').optional().nullable(),
  sku: z.string().min(1, 'SKU is required').max(100, 'SKU must not exceed 100 characters'),
  stock: z.number().min(0, 'Stock must be a non-negative number').default(0),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
  isNew: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  tags: z.array(z.string().max(50, 'Tag must not exceed 50 characters')).max(10, 'Maximum 10 tags allowed').default([]),
  weight: z.number().min(0, 'Weight must be a non-negative number').optional().nullable(),
  dimensions: z.object({
    length: z.number().min(0, 'Length must be a non-negative number'),
    width: z.number().min(0, 'Width must be a non-negative number'),
    height: z.number().min(0, 'Height must be a non-negative number'),
  }).optional().nullable(),
  seoTitle: z.string().max(255, 'SEO title must not exceed 255 characters').optional().nullable(),
  seoDescription: z.string().max(500, 'SEO description must not exceed 500 characters').optional().nullable(),
})

// Product update validation
export const updateProductSchema = createProductSchema.partial()

// Product query validation
export const productQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit must not exceed 100').default(12),
  category: z.string().optional().nullable(),
  search: z.string().max(100, 'Search term must not exceed 100 characters').optional().nullable(),
  minPrice: z.coerce.number().min(0, 'Minimum price must be a non-negative number').optional().nullable(),
  maxPrice: z.coerce.number().min(0, 'Maximum price must be a non-negative number').optional().nullable(),
  sortBy: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest', 'rating']).default('newest'),
  inStock: z.coerce.boolean().optional().nullable(),
})

// Review creation validation
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must not exceed 5'),
  title: z.string().min(1, 'Review title is required').max(255, 'Review title must not exceed 255 characters'),
  content: z.string().min(10, 'Review content must be at least 10 characters').max(1000, 'Review content must not exceed 1000 characters'),
})

// Review update validation
export const updateReviewSchema = createReviewSchema.partial()

// Wishlist item validation
export const wishlistItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
})

// Category creation validation
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Category name must not exceed 255 characters'),
  slug: z.string().min(1, 'Category slug is required').max(255, 'Category slug must not exceed 255 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional().nullable(),
  image: z.string().url('Please enter a valid URL').optional().nullable(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0, 'Sort order must be a non-negative number').default(0),
})

// Category update validation
export const updateCategorySchema = createCategorySchema.partial()

// Coupon creation validation
export const createCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(50, 'Coupon code must not exceed 50 characters').regex(/^[A-Z0-9-]+$/, 'Coupon code can only contain uppercase letters, numbers, and hyphens'),
  name: z.string().min(1, 'Coupon name is required').max(255, 'Coupon name must not exceed 255 characters'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  value: z.number().min(0, 'Value must be a non-negative number'),
  minAmount: z.number().min(0, 'Minimum amount must be a non-negative number').optional().nullable(),
  maxUses: z.number().min(1, 'Max uses must be at least 1').optional().nullable(),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime('Please provide a valid start date and time'),
  expiresAt: z.string().datetime('Please provide a valid expiration date and time'),
})

// Shipping method creation validation
export const createShippingMethodSchema = z.object({
  name: z.string().min(1, 'Shipping method name is required').max(255, 'Name must not exceed 255 characters'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional().nullable(),
  price: z.number().min(0, 'Price must be a non-negative number'),
  minWeight: z.number().min(0, 'Minimum weight must be a non-negative number').optional().nullable(),
  maxWeight: z.number().min(0, 'Maximum weight must be a non-negative number').optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0, 'Sort order must be a non-negative number').default(0),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type CartItemInput = z.infer<typeof cartItemSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type WishlistItemInput = z.infer<typeof wishlistItemSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateCouponInput = z.infer<typeof createCouponSchema>
export type CreateShippingMethodInput = z.infer<typeof createShippingMethodSchema>
