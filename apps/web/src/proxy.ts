import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()
  
  // Check if we have a session cookie
  const authCookie = req.cookies.get('sb-access-token')
  const session = !!authCookie

  const { pathname } = req.nextUrl

  // Protected routes
  if (pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      if (pathname !== '/') {
        url.searchParams.set('redirect', pathname)
      }
      return NextResponse.redirect(url)
    }
  }

  // Auth routes (redirect to dashboard if already logged in)
  if (pathname === '/login' || pathname === '/signup') {
    if (session) {
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
