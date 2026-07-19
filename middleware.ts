import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Proteksi: Jika user mencoba masuk rute kompetisi yang tidak ada (bukan kategori lomba)
  const validCompetitions = ['physics_olympiad', 'science_project', 'industrial_case'];
  if (path.startsWith('/competition/')) {
    const category = path.split('/')[2];
    if (category && !validCompetitions.includes(category)) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }

  // Lockdown utama
  if (process.env.IS_LOCKDOWN === 'true' && path === '/') {
    return NextResponse.redirect(new URL('/links', request.url));
  }
}