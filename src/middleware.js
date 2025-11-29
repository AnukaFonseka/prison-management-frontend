import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get token from request (if you're using cookies)
  // For localStorage-based auth, we'll handle this on the client side
  // This middleware is primarily for initial page loads

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if user is authenticated (from cookie if you implement it)
  // For now, we'll rely on client-side checks
  // const token = request.cookies.get('accessToken');

  // If accessing auth pages while logged in, redirect to dashboard
  if (isPublicRoute) {
    // You can add cookie check here if you store token in cookies
    // if (token) {
    //   return NextResponse.redirect(new URL('/dashboard', request.url));
    // }
    return NextResponse.next();
  }

  // Allow all other routes to pass through
  // Client-side AuthContext will handle authentication checks
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};