import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get('knd_uid')) {
    const uid = crypto.randomUUID();
    response.cookies.set('knd_uid', uid, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1年
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|images/|icon\\.svg|.*\\.png$).*)',
  ],
};
