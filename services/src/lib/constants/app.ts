// App constants
export const APP_NAME = 'UpToYouShop'
export const APP_DESCRIPTION = 'A modern e-commerce platform'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Currency constants
export const CURRENCY = 'USD'
export const CURRENCY_SYMBOL = '$'

// Tax constants
export const TAX_RATE = 0.08 // 8%
export const FREE_SHIPPING_THRESHOLD = 50

// Pagination constants
export const DEFAULT_PAGE_SIZE = 12
export const MAX_PAGE_SIZE = 100

// Image constants
export const DEFAULT_PRODUCT_IMAGE = '/images/product-placeholder.jpg'
export const DEFAULT_CATEGORY_IMAGE = '/images/category-placeholder.jpg'
export const DEFAULT_USER_AVATAR = '/images/user-placeholder.jpg'

// Cart constants
export const CART_EXPIRY_DAYS = 30
export const MAX_CART_ITEMS = 99

// Order constants
export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const

export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  BANK_TRANSFER: 'bank_transfer',
} as const

// User roles
export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

// Address types
export const ADDRESS_TYPES = {
  SHIPPING: 'SHIPPING',
  BILLING: 'BILLING',
} as const

// Coupon types
export const COUPON_TYPES = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  FREE_SHIPPING: 'FREE_SHIPPING',
} as const

// Product constants
export const PRODUCT_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DRAFT: 'DRAFT',
  ARCHIVED: 'ARCHIVED',
} as const

// Review constants
export const REVIEW_RATINGS = {
  MIN: 1,
  MAX: 5,
} as const

// Shipping constants
export const DEFAULT_SHIPPING_COST = 9.99
export const EXPRESS_SHIPPING_COST = 19.99
export const OVERNIGHT_SHIPPING_COST = 29.99

// Inventory constants
export const LOW_STOCK_THRESHOLD = 5
export const OUT_OF_STOCK_THRESHOLD = 0

// Email constants
export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@uptoyoushop.com'
export const SUPPORT_EMAIL = 'support@uptoyoushop.com'

// Social media constants
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/uptoyoushop',
  TWITTER: 'https://twitter.com/uptoyoushop',
  INSTAGRAM: 'https://instagram.com/uptoyoushop',
  LINKEDIN: 'https://linkedin.com/company/uptoyoushop',
} as const

// Analytics constants
export const ANALYTICS_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: '7',
  LAST_30_DAYS: '30',
  LAST_90_DAYS: '90',
  LAST_YEAR: '365',
} as const

// Sort options for products
export const PRODUCT_SORT_OPTIONS = {
  PRICE_ASC: 'price-asc',
  PRICE_DESC: 'price-desc',
  NAME_ASC: 'name-asc',
  NAME_DESC: 'name-desc',
  NEWEST: 'newest',
  RATING: 'rating',
} as const

// API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  CART: '/api/cart',
  ORDERS: '/api/orders',
  USERS: '/api/users',
  AUTH: '/api/auth',
  ADMIN: '/api/admin',
  REVIEWS: '/api/reviews',
  WISHLIST: '/api/wishlist',
  COUPONS: '/api/coupons',
  SHIPPING: '/api/shipping',
} as const

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network error',
  TIMEOUT_ERROR: 'Request timeout',
  RATE_LIMIT_ERROR: 'Too many requests',
  INSUFFICIENT_STOCK: 'Insufficient stock',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  WEAK_PASSWORD: 'Password is too weak',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_ADDRESS: 'Invalid address format',
  PAYMENT_FAILED: 'Payment failed',
  ORDER_NOT_FOUND: 'Order not found',
  PRODUCT_NOT_FOUND: 'Product not found',
  CATEGORY_NOT_FOUND: 'Category not found',
  USER_NOT_FOUND: 'User not found',
  COUPON_EXPIRED: 'Coupon has expired',
  COUPON_USED: 'Coupon has already been used',
  COUPON_NOT_FOUND: 'Coupon not found',
  INVALID_COUPON: 'Invalid coupon code',
  MIN_ORDER_AMOUNT: 'Minimum order amount not met',
  CART_EMPTY: 'Cart is empty',
  CART_EXPIRED: 'Cart has expired',
  SHIPPING_REQUIRED: 'Shipping address required',
  PAYMENT_REQUIRED: 'Payment method required',
  TERMS_REQUIRED: 'You must accept the terms and conditions',
  AGE_VERIFICATION_REQUIRED: 'Age verification required',
  LOCATION_RESTRICTED: 'Product not available in your location',
  QUANTITY_LIMIT: 'Quantity limit exceeded',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  ADDRESS_ADDED: 'Address added successfully',
  ADDRESS_UPDATED: 'Address updated successfully',
  ADDRESS_DELETED: 'Address deleted successfully',
  CART_ITEM_ADDED: 'Item added to cart',
  CART_ITEM_UPDATED: 'Cart item updated',
  CART_ITEM_REMOVED: 'Item removed from cart',
  CART_CLEARED: 'Cart cleared successfully',
  ORDER_PLACED: 'Order placed successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  ORDER_UPDATED: 'Order updated successfully',
  PAYMENT_SUCCESSFUL: 'Payment successful',
  REVIEW_SUBMITTED: 'Review submitted successfully',
  REVIEW_UPDATED: 'Review updated successfully',
  REVIEW_DELETED: 'Review deleted successfully',
  WISHLIST_ITEM_ADDED: 'Item added to wishlist',
  WISHLIST_ITEM_REMOVED: 'Item removed from wishlist',
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  CATEGORY_CREATED: 'Category created successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  CATEGORY_DELETED: 'Category deleted successfully',
  COUPON_CREATED: 'Coupon created successfully',
  COUPON_UPDATED: 'Coupon updated successfully',
  COUPON_DELETED: 'Coupon deleted successfully',
  SHIPPING_METHOD_CREATED: 'Shipping method created successfully',
  SHIPPING_METHOD_UPDATED: 'Shipping method updated successfully',
  SHIPPING_METHOD_DELETED: 'Shipping method deleted successfully',
  EMAIL_SENT: 'Email sent successfully',
  PASSWORD_RESET_SENT: 'Password reset email sent',
  ACCOUNT_VERIFIED: 'Account verified successfully',
} as const

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  ZIP_CODE_US: /^\d{5}(-\d{4})?$/,
  ZIP_CODE_UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  CREDIT_CARD: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
  SLUG: /^[a-z0-9-]+$/,
  SKU: /^[A-Z0-9-]+$/,
  COUPON_CODE: /^[A-Z0-9-]+$/,
  ORDER_NUMBER: /^ORD-\d+-[A-Z0-9]+$/,
  TRACKING_NUMBER: /^TRK-[A-Z0-9-]+$/,
} as const

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  PRODUCT_IMAGE_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  AVATAR_MAX_SIZE: 1 * 1024 * 1024, // 1MB
} as const

// Cache constants
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  USER_PROFILE: 'user_profile',
  CART: 'cart',
  WISHLIST: 'wishlist',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  COUPONS: 'coupons',
  SHIPPING_METHODS: 'shipping_methods',
  ANALYTICS: 'analytics',
} as const

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

// Rate limiting constants
export const RATE_LIMITS = {
  LOGIN: { requests: 5, window: 900 }, // 5 requests per 15 minutes
  REGISTER: { requests: 3, window: 3600 }, // 3 requests per hour
  PASSWORD_RESET: { requests: 3, window: 3600 }, // 3 requests per hour
  API: { requests: 100, window: 60 }, // 100 requests per minute
  SEARCH: { requests: 30, window: 60 }, // 30 requests per minute
} as const

// Feature flags
export const FEATURES = {
  ENABLE_REVIEWS: true,
  ENABLE_WISHLIST: true,
  ENABLE_COUPONS: true,
  ENABLE_GUEST_CHECKOUT: true,
  ENABLE_SOCIAL_LOGIN: true,
  ENABLE_EMAIL_VERIFICATION: true,
  ENABLE_ORDER_TRACKING: true,
  ENABLE_PRODUCT_COMPARISON: false,
  ENABLE_LIVE_CHAT: false,
  ENABLE_SUBSCRIPTIONS: false,
  ENABLE_GIFT_CARDS: false,
  ENABLE_LOYALTY_PROGRAM: false,
} as const
