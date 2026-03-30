import { NextRequest, NextResponse } from 'next/server'
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/services/cart.service'

export async function GET(request: NextRequest) {
  const result = await getCart(request)
  
  if (result.status) {
    return NextResponse.json(
      { success: result.success, error: result.error, details: result.details },
      { status: result.status }
    )
  }
  
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const result = await addToCart(request)
  
  if (result.status) {
    return NextResponse.json(
      { success: result.success, error: result.error, details: result.details },
      { status: result.status }
    )
  }
  
  return NextResponse.json(result)
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url)
  const itemId = url.pathname.split('/').pop()
  
  if (!itemId) {
    return NextResponse.json(
      { success: false, error: 'Cart item ID required' },
      { status: 400 }
    )
  }
  
  const result = await updateCartItem(itemId, request)
  
  if (result.status) {
    return NextResponse.json(
      { success: result.success, error: result.error, details: result.details },
      { status: result.status }
    )
  }
  
  return NextResponse.json(result)
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  const itemId = url.pathname.split('/').pop()
  
  if (itemId) {
    // Delete specific cart item
    const result = await removeCartItem(itemId)
    
    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error, details: result.details },
        { status: result.status }
      )
    }
    
    return NextResponse.json(result)
  } else {
    // Clear entire cart
    const result = await clearCart()
    
    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error, details: result.details },
        { status: result.status }
      )
    }
    
    return NextResponse.json(result)
  }
}
