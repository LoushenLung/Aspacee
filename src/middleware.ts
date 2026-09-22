import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

const middleware = auth(async (request) => {
  const session = request.auth;
  const { pathname } = request.nextUrl;

  // ============================================================
  // PROTECT ADMIN ROUTES
  // ============================================================
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
    }
    if ((session.user as any)?.role !== 'admin_space') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ============================================================
  // PROTECT MEMBER ROUTES
  // ============================================================
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/booking')) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }
    if ((session.user as any)?.role !== 'member') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // ============================================================
  // REDIRECT ALREADY LOGGED IN USERS FROM AUTH PAGES
  // ============================================================
  if (['/login', '/register'].includes(pathname) && session) {
    const role = (session.user as any)?.role;
    if (role === 'admin_space') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
});

export default middleware;
export { middleware };

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/booking/:path*', '/login', '/register'],
};
