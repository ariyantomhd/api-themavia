// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigin = 'https://www.themavia.com';
  
  // Jika origin tidak ada (bukan dari browser), tetap izinkan ke domain utama kita
  const responseOrigin = origin && origin === allowedOrigin ? origin : allowedOrigin;

  // Tangani Preflight (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': responseOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // Cache preflight selama 24 jam
      },
    });
  }

  const response = NextResponse.next();
  
  // Tambahkan header CORS ke respon standar
  response.headers.set('Access-Control-Allow-Origin', responseOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

// PERBAIKAN: Ubah matcher agar menangkap path /api/v1/... 
// Sesuai dengan struktur folder backend Abang (src/app/api/v1/...)
export const config = {
  matcher: '/api/v1/:path*', 
};