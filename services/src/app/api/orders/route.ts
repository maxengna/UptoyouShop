import { NextRequest, NextResponse } from 'next/server'
import { getOrders, createOrder, getOrderById, updateOrderStatus, getOrderTracking } from '@/services/orders.service'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/').filter(Boolean)
  
  // Handle different GET endpoints
  if (pathSegments.length === 4 && pathSegments[3] === 'tracking') {
    // GET /api/orders/tracking/[orderNumber]
    const orderNumber = pathSegments[4]
    const result = await getOrderTracking(orderNumber)
    
    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error, details: result.details },
        { status: result.status }
      )
    }
    
    return NextResponse.json(result)
  } else if (pathSegments.length === 4) {
    // GET /api/orders/[id]
    const orderId = pathSegments[3]
    const result = await getOrderById(orderId)
    
    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error, details: result.details },
        { status: result.status }
      )
    }
    
    return NextResponse.json(result)
  } else {
    // GET /api/orders (list orders)
    const result = await getOrders(request)
    
    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error, details: result.details },
        { status: result.status }
      )
    }
    
    return NextResponse.json(result)
  }
}

export async function POST(request: NextRequest) {
  const result = await createOrder(request)
  
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
  const pathSegments = url.pathname.split('/').filter(Boolean)
  
  // PUT /api/orders/[id]/status
  if (pathSegments.length === 5 && pathSegments[4] === 'status') {
    const orderId = pathSegments[3]
    const result = await updateOrderStatus(orderId, request)
    
    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error, details: result.details },
        { status: result.status }
      )
    }
    
    return NextResponse.json(result)
  } else {
    return NextResponse.json(
      { success: false, error: 'Invalid endpoint' },
      { status: 404 }
    )
  }
}
