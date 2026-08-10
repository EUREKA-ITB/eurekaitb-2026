import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hostname = request.nextUrl.hostname;

  if (hostname === 'mini-competition.eurekaitb.com') {
    if (path === '/') {
      return NextResponse.rewrite(new URL('/mini-competition', request.url));
    }
  }

  if (path.startsWith('/admin-se')) {
    return NextResponse.redirect(new URL(path.replace('/admin-se', '/adm-se'), request.url));
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  // ==========================================
  // LOCK MAIN WEB (DIPERKETAT!)
  // ==========================================
  const isLocked = process.env.LOCK_MAIN_WEB === 'true';
  
  // FITUR BARU: Tambahkan halaman auth dan dashboard ke dalam daftar gembok
  const isMainWebPath = 
    path === '/' || 
    path.startsWith('/faq') || 
    path.startsWith('/about') ||
    path.startsWith('/login') ||    // Gembok akses login
    path.startsWith('/register') || // Gembok akses register
    path.startsWith('/dashboard') || // Gembok akses dashboard
    path.startsWith('/competition');

  if (isLocked && isMainWebPath) {
    const isAdmin = token?.role === 'admin' || token?.role === 'admin_se';
    if (!isAdmin) {
      // Jika bukan admin, tendang ke mini compe!
      return NextResponse.redirect(new URL('/mini-competition', request.url));
    }
  }
  // ==========================================

  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/settings') || path.startsWith('/competition');
  if (isProtectedPath) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
  }

  if (path.startsWith('/adm-se')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (token.role !== 'admin' && token.role !== 'admin_se') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

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
    '/', 
    '/faq/:path*', 
    '/about/:path*',          
    '/dashboard/:path*',
    '/settings/:path*',
    '/competition/:path*',
    '/adm-se/:path*',
    '/admin-se/:path*',
    '/login/:path*',
    '/register/:path*'
  ],
};