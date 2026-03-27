import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct, getProductById, updateProduct, deleteProduct } from '@/services/products.service'

export async function GET(request: NextRequest) {
  const result = await getProducts(request)
  
  if (result.status) {
    return NextResponse.json(
      { success: result.success, error: result.error, details: result.details },
      { status: result.status }
    )
  }
  
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const result = await createProduct(request)
  
  if (result.status) {
    return NextResponse.json(
      { success: result.success, error: result.error, details: result.details },
      { status: result.status }
    )
  }
  
  return NextResponse.json(result)
}
