import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Protected Routes (Require Login)
  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/settings') || path.startsWith('/competition');

  if (isProtectedPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
  }

  // 2. Competition Typo Protection
  const validCompetitions = ['physics_olympiad', 'science_project', 'industrial_case'];
  if (path.startsWith('/competition/')) {
    const category = path.split('/')[2];
    if (category && !validCompetitions.includes(category)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/competition/:path*'
  ],
};