import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isPublicPath } from '@/lib/publicPaths'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths to proceed
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check for a valid session token using NextAuth JWT
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.error('NEXTAUTH_SECRET is not set')
    // Don't block in development
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.next()
    }
  }

  try {
    const token = await getToken({ req, secret })
    
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.href)
      loginUrl.searchParams.set('reason', 'auth')
      return NextResponse.redirect(loginUrl)
    }
  } catch (error) {
    console.error('Token validation error:', error)
    // Allow through on error to avoid blocking everything
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Run on all non-static, non-API routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)'],
}
