// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil response objek
  const response = NextResponse.next();

  // 2. Set Header CORS agar Frontend (www.themavia.com) bisa akses
  response.headers.set('Access-Control-Allow-Origin', 'https://www.themavia.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 3. Penting: Handle request "OPTIONS" (preflight request) dari browser
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

// 4. Pastikan middleware ini hanya berjalan untuk API
export const config = {
  matcher: '/api/:path*',
};