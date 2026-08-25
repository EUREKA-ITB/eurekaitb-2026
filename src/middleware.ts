import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hostname = request.nextUrl.hostname;

  const applyNoCacheHeaders = (res: NextResponse) => {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  };

  if (hostname === 'mini-competition.eurekaitb.com') {
    if (path === '/') {
      return applyNoCacheHeaders(
        NextResponse.rewrite(new URL('/mini-competition', request.url))
      );
    }
  }

  if (path.startsWith('/admin-se')) {
    return applyNoCacheHeaders(
      NextResponse.redirect(new URL(path.replace('/admin-se', '/adm-se'), request.url))
    );
  }

  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isLocked = process.env.LOCK_MAIN_WEB === 'true';

  if (isLocked) {
    const isAdmin = token?.role === 'admin' || token?.role === 'admin_se';
    const isParticipant = token?.role === 'participant';

    // Peserta coba akses dashboard/kompetisi saat dikunci -> Lempar ke mini compe
    if (isParticipant && (path.startsWith('/dashboard') || path.startsWith('/competition') || path.startsWith('/settings'))) {
      return applyNoCacheHeaders(
        NextResponse.redirect(new URL('/mini-competition', request.url))
      );
    }

    const isPublicLockedPath = path === '/' || path.startsWith('/faq') || path.startsWith('/about');
    if (isPublicLockedPath && !isAdmin) {
      return applyNoCacheHeaders(
        NextResponse.redirect(new URL('/mini-competition', request.url))
      );
    }
  }

  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/settings') || path.startsWith('/competition');
  if (isProtectedPath) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', path);
      return applyNoCacheHeaders(NextResponse.redirect(url));
    }
  }

  if (path.startsWith('/adm-se')) {
    if (!token) {
      return applyNoCacheHeaders(NextResponse.redirect(new URL('/login', request.url)));
    }
    if (token.role !== 'admin' && token.role !== 'admin_se') {
      return applyNoCacheHeaders(NextResponse.redirect(new URL('/dashboard', request.url)));
    }
  }

  const validCompetitions = ['physics-olympiad', 'science-project', 'industrial-case'];
  if (path.startsWith('/competition/')) {
    const category = path.split('/')[2];
    if (category && !validCompetitions.includes(category)) {
      return applyNoCacheHeaders(NextResponse.redirect(new URL('/', request.url)));
    }
  }

  return applyNoCacheHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/', 
    '/login',
    '/faq/:path*', 
    '/about/:path*',          
    '/dashboard/:path*',
    '/settings/:path*',
    '/competition/:path*',
    '/adm-se/:path*',
    '/admin-se/:path*',
    '/api/auth/:path*'
  ],
};