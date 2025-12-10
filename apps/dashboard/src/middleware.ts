import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'strapi_token'
  )?.value;
  const { pathname } = request.nextUrl;

  console.log('🔥 Middleware ejecutado en:', pathname);
  console.log('🔥 strapi_token existe:', !!token);
  console.log('🔥 Todas las cookies:', request.cookies.getAll());

  // Guest: si está logueado y va a login → dashboard
  if (pathname.startsWith('/login') && token) {
    console.log('🔥 Guest redirect: login → dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Auth: si no está logueado y va a dashboard → login
  if (pathname.startsWith('/dashboard') && !token) {
    console.log('🔥 Auth redirect: dashboard → login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('🔥 Continuando...');
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
