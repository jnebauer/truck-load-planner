import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes
  const publicRoutes = [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/api/auth',
    '/apps' // Apps dashboard is accessible to all authenticated users
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For all other routes, allow them to proceed
  // The client-side AuthContext will handle authentication checks
  // and redirect to login if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
