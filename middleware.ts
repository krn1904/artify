import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Public routes accessible without authentication
const PUBLIC_PATHS: RegExp[] = [
  /^\/$/,
  /^\/login$/,
  /^\/signup$/,
  /^\/explore(\/.*)?$/,
  /^\/artists(\/.*)?$/,
  /^\/commissions(\/.*)?$/,
]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((rx) => rx.test(pathname))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths to proceed
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check for a valid session token using NextAuth JWT
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.href)
    loginUrl.searchParams.set('reason', 'auth')
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Run on all non-static, non-API routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)'],
}
