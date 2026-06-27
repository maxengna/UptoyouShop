import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/deals',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api',
  '/_next',
]

const adminRoutes = ['/admin', '/dashboard', '/products', '/categories', '/orders', '/customers', '/analytics']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files, API routes, and Next.js internals
  if (
    publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/')) ||
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get('auth')

  // Not logged in
  if (!authCookie?.value) {
    const signinUrl = new URL('/signin', request.url)
    signinUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signinUrl)
  }

  // Verify JWT auth cookie (HttpOnly, signed by backend)
  try {
    const { payload } = await jwtVerify(
      authCookie.value,
      new TextEncoder().encode(process.env.JWT_SECRET!),
    )
    const role = payload.role as string

    if (adminRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  } catch {
    // Invalid or expired token, redirect to signin
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|images).*)',
}
