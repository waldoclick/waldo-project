import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function guestMiddleware(request: NextRequest) {
  const token = request.cookies.get(
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'strapi_token'
  )?.value;

  console.log('GuestMiddleware - Token exists:', !!token);

  // Si hay token, redirigir al dashboard
  if (token) {
    console.log('GuestMiddleware - User logged in, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log('GuestMiddleware - User not logged in, continuing');
  return NextResponse.next();
}
