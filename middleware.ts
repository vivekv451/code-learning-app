import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/schools/lookup'];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    const authHeader = req.headers.get('authorization') || '';
    const cookieToken = req.cookies.get('token')?.value;
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : cookieToken;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', (decoded as any).id || '');
    requestHeaders.set('x-user-email', (decoded as any).email || '');
    requestHeaders.set('x-user-premium', ((decoded as any).isPremium || false).toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
