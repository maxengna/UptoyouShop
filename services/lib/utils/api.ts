import { NextResponse } from 'next/server'

// Standard API response handler
export function handleApiResponse(result: any) {
  if (result.status) {
    return NextResponse.json(
      { 
        success: result.success, 
        error: result.error, 
        details: result.details,
        data: result.data,
        message: result.message 
      },
      { status: result.status }
    )
  }
  
  return NextResponse.json({
    success: result.success,
    error: result.error,
    details: result.details,
    data: result.data,
    message: result.message
  })
}

// Success response helper
export function successResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

// Error response helper
export function errorResponse(error: string, status: number = 500, details?: any) {
  return NextResponse.json({
    success: false,
    error,
    details,
  }, { status })
}

// Validation error response
export function validationErrorResponse(errors: any) {
  return NextResponse.json({
    success: false,
    error: 'Validation failed',
    details: errors,
  }, { status: 400 })
}

// Unauthorized response
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 401 })
}

// Forbidden response
export function forbiddenResponse(message: string = 'Insufficient permissions') {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 403 })
}

// Not found response
export function notFoundResponse(message: string = 'Resource not found') {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 404 })
}

// Conflict response
export function conflictResponse(message: string = 'Resource already exists') {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 409 })
}

// Bad request response
export function badRequestResponse(message: string = 'Invalid request') {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 400 })
}

// Rate limit response
export function rateLimitResponse(message: string = 'Too many requests') {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 429 })
}

// Server error response
export function serverErrorResponse(message: string = 'Internal server error') {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 500 })
}

// CORS headers helper
export function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

// Pagination helper
export function createPaginationResponse(
  items: any[],
  page: number,
  limit: number,
  total: number
) {
  const pages = Math.ceil(total / limit)
  
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  }
}

// Format price helper
export function formatPrice(price: number | string, currency: string = 'USD'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(numPrice)
}

// Generate order number helper
export function generateOrderNumber(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// Generate SKU helper
export function generateSKU(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const timestamp = Date.now().toString(36).toUpperCase()
  return `${cleaned.substr(0, 8)}-${timestamp}`
}

// Generate slug helper
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Validate email helper
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone helper
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone)
}

// Sanitize string helper
export function sanitizeString(input: string): string {
  return input.trim().replace(/<[^>]*>/g, '')
}

// Generate random string helper
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Hash password helper (bcrypt would be used in real implementation)
export async function hashPassword(password: string): Promise<string> {
  // This is a placeholder - use bcrypt in production
  return `hashed_${password}`
}

// Compare password helper (bcrypt would be used in real implementation)
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  // This is a placeholder - use bcrypt in production
  return hash === `hashed_${password}`
}

// Calculate tax helper
export function calculateTax(amount: number, taxRate: number): number {
  return amount * (taxRate / 100)
}

// Calculate shipping helper
export function calculateShipping(weight: number, baseRate: number = 9.99): number {
  if (weight <= 1) return baseRate
  if (weight <= 5) return baseRate * 1.5
  if (weight <= 10) return baseRate * 2
  return baseRate * 3
}

// Check if product is in stock helper
export function isInStock(stock: number, reserved: number = 0): boolean {
  return stock > reserved
}

// Get available stock helper
export function getAvailableStock(stock: number, reserved: number = 0): number {
  return Math.max(0, stock - reserved)
}

// Format date helper
export function formatDate(date: Date | string, format: string = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString()
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'time':
      return dateObj.toLocaleTimeString()
    case 'datetime':
      return dateObj.toLocaleString()
    default:
      return dateObj.toISOString()
  }
}

// Calculate discount helper
export function calculateDiscount(price: number, discountType: 'PERCENTAGE' | 'FIXED_AMOUNT', discountValue: number): number {
  if (discountType === 'PERCENTAGE') {
    return price * (discountValue / 100)
  } else {
    return Math.min(discountValue, price)
  }
}

// Apply coupon helper
export function applyCoupon(subtotal: number, coupon: {
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  minAmount?: number
}): { discount: number; shippingDiscount: number } {
  let discount = 0
  let shippingDiscount = 0
  
  if (coupon.minAmount && subtotal < coupon.minAmount) {
    return { discount: 0, shippingDiscount: 0 }
  }
  
  switch (coupon.type) {
    case 'PERCENTAGE':
      discount = calculateDiscount(subtotal, 'PERCENTAGE', coupon.value)
      break
    case 'FIXED_AMOUNT':
      discount = calculateDiscount(subtotal, 'FIXED_AMOUNT', coupon.value)
      break
    case 'FREE_SHIPPING':
      shippingDiscount = 9.99 // Standard shipping cost
      break
  }
  
  return { discount, shippingDiscount }
}

// Generate tracking number helper
export function generateTrackingNumber(): string {
  const prefix = 'TRK'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Validate address helper
export function validateAddress(address: any): boolean {
  return !!(
    address.firstName &&
    address.lastName &&
    address.address1 &&
    address.city &&
    address.state &&
    address.zipCode &&
    address.country
  )
}

// Calculate order totals helper
export function calculateOrderTotals(items: Array<{
  price: number
  quantity: number
}>, taxRate: number = 8, shippingCost: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = calculateTax(subtotal, taxRate)
  const total = subtotal + tax + shippingCost
  
  return {
    subtotal,
    tax,
    shipping: shippingCost,
    total,
  }
}
