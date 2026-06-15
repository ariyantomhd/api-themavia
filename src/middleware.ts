import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Tentukan Origin
  const origin = request.headers.get('origin');
  const allowedOrigin = 'http://localhost:5173';
  const responseOrigin = (origin && origin === allowedOrigin) ? origin : allowedOrigin;

  // Daftar header yang diizinkan (TAMBAHKAN x-api-secret DI SINI)
  const allowedHeaders = 'Content-Type, Authorization, x-api-secret';

  // 2. Jika ini adalah Preflight (OPTIONS), berikan respon langsung
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': responseOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': allowedHeaders,
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 3. Lanjutkan request, tapi tambahkan header CORS ke response
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', responseOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders);

  return response;
}

// Gunakan array untuk matcher yang lebih eksplisit
export const config = {
  matcher: ['/api/v1/:path*'],
};