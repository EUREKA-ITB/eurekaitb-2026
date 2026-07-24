import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hostname = request.nextUrl.hostname;

  // 1. SIHIR DOMAIN KHUSUS SIDE EVENT (TRAP SYSTEM)
  if (hostname === 'side-event.eurekaitb.com') {
    // A. Kalau buka halaman utama, arahkan ke /side-event diam-diam
    if (path === '/') {
      return NextResponse.rewrite(new URL('/side-event', request.url));
    }
    // B. Kalau nyasar ke halaman lomba/lainnya, tendang balik ke halaman depan!
    // (Kecuali halaman admin /adm-se dan file sistem bawaan Next.js)
    if (!path.startsWith('/adm-se') && !path.startsWith('/_next') && !path.startsWith('/api')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  // 1. Protected Routes (Peserta & Admin)
  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/settings') || path.startsWith('/competition');
  if (isProtectedPath) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
  }

  // 2. Admin Routes (KHUSUS ADMIN SIDE EVENT & SUPER ADMIN)
  if (path.startsWith('/adm-se')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Jika role bukan 'admin' DAN bukan 'admin_se', tendang ke dashboard!
    if (token.role !== 'admin' && token.role !== 'admin_se') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. Competition Typo Protection
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
    '/', // <--- TAMBAHKAN BARIS INI BIAR SIHIRNYA JALAN
    '/dashboard/:path*',
    '/settings/:path*',
    '/competition/:path*',
    '/adm-se/:path*'
  ],
};