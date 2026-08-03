import { NextResponse } from 'next/server';
import { tokenManager } from './lib/api.js';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password-otp',
  '/jobs',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

// Role-based route mapping
const roleRoutes = {
  jobseeker: [
    '/jobseeker',
    '/jobseeker/dashboard',
    '/jobseeker/profile',
  ],
  employer: [
    '/employer',
    '/employer/dashboard',
    '/employer/profile',
    '/employer/post-job',
  ],
  admin: [
    '/admin',
    '/admin/dashboard',
  ],
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(route => 
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('authToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
