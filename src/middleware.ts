import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Define protected admin routes
  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';

  // If it's an admin route, we'll handle authentication in the client
  // This middleware just ensures we don't cache protected routes
  if (isAdminRoute) {
    const response = NextResponse.next();
    
    // Add headers to prevent caching of admin pages
    response.headers.set('x-middleware-cache', 'no-cache');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};