import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection and authentication
 * 
 * Security Layers:
 * 1. Middleware (this file) - Fast cookie-based checks for authentication and role
 * 2. Server Components (admin/layout.tsx) - Server-side session validation
 * 3. API Routes - Individual endpoint protection
 * 
 * Admin Role Enforcement:
 * - Middleware checks 'user-role' cookie (set during sign-in in lib/auth.ts)
 * - Admin layout performs server-side session validation (lib/auth-server.ts)
 * - Double-layer protection ensures security even if cookies are tampered with
 */

// Routes that require authentication
const protectedRoutes = [
  '/bookings',
  '/profile',
  '/check-in',
  '/select-seats',
  '/passenger-details',
  '/payment',
  '/confirmation',
];

// Admin-only routes (requires authentication + admin role)
const adminRoutes = [
  '/admin',
];

// Public routes (accessible without auth)
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact',
  '/faq',
  '/airlines',
  '/search',
  '/flights',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session cookie
  const sessionCookie = request.cookies.get('better-auth.session_token');
  const isAuthenticated = !!sessionCookie;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Admin route protection (two-layer security)
  if (isAdminRoute) {
    // Layer 1: Check authentication
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Layer 2: Check admin role from cookie (set during sign-in)
    const userRole = request.cookies.get('user-role')?.value;
    if (userRole !== 'admin') {
      // Non-admin users are redirected to home
      // Note: Admin layout also performs server-side validation for additional security
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|icon).*)',
  ],
};
