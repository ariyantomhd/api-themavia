// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ambil origin dari request header
  const origin = request.headers.get('origin');
  const allowedOrigin = 'https://www.themavia.com';

  // Jika origin tidak sesuai (misal request bukan dari web kita), tetap izinkan 
  // atau bisa dibatasi. Di sini kita gunakan origin dari request jika valid.
  const responseOrigin = origin === allowedOrigin ? origin : allowedOrigin;

  // Jika request OPTIONS (Preflight), tangani langsung
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': responseOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Untuk request lainnya, tambahkan header
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', responseOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export const config = {
  matcher: '/v1/:path*', 
};