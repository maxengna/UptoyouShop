import { NextRequest, NextResponse } from 'next/server'
import { addAddress, getUserAddresses } from '@/services/users.service'

export async function GET() {
  const result = await getUserAddresses()
  
  if (result.status) {
    return NextResponse.json(
      { success: result.success, error: result.error, details: result.details },
      { status: result.status }
    )
  }
  
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const result = await addAddress(request)
  
  if (result.status) {
    return NextResponse.json(
      { success: result.success, error: result.error, details: result.details },
      { status: result.status }
    )
  }
  
  return NextResponse.json(result)
}
