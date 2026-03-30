import { NextRequest, NextResponse } from 'next/server'
import { getAdminOrders, getAdminUsers, getSalesAnalytics, getProductAnalytics, getCustomerAnalytics, getSystemHealth } from '@/services/admin.service'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/').filter(Boolean)
  
  // Handle different GET endpoints
  if (pathSegments.length === 4 && pathSegments[3] === 'orders') {
    // GET /api/admin/orders
    const result = await getAdminOrders(request)
    
    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error, details: result.details },
        { status: result.status }
      )
    }
    
    return NextResponse.json(result)
  } else if (pathSegments.length === 4 && pathSegments[3] === 'users') {
    // GET /api/admin/users
    const result = await getAdminUsers(request)
    
    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error, details: result.details },
        { status: result.status }
      )
    }
    
    return NextResponse.json(result)
  } else if (pathSegments.length === 4 && pathSegments[3] === 'analytics') {
    // GET /api/admin/analytics
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    if (type === 'sales') {
      const result = await getSalesAnalytics(request)
      
      if (result.status) {
        return NextResponse.json(
          { success: result.success, error: result.error, details: result.details },
          { status: result.status }
        )
      }
      
      return NextResponse.json(result)
    } else if (type === 'products') {
      const result = await getProductAnalytics(request)
      
      if (result.status) {
        return NextResponse.json(
          { success: result.success, error: result.error, details: result.details },
          { status: result.status }
        )
      }
      
      return NextResponse.json(result)
    } else if (type === 'customers') {
      const result = await getCustomerAnalytics(request)
      
      if (result.status) {
        return NextResponse.json(
          { success: result.success, error: result.error, details: result.details },
          { status: result.status }
        )
      }
      
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid analytics type. Use: sales, products, or customers' },
        { status: 400 }
      )
    }
  } else if (pathSegments.length === 4 && pathSegments[3] === 'health') {
    // GET /api/admin/health
    const result = await getSystemHealth()
    
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
