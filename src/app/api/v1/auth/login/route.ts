import { NextRequest, NextResponse } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { supabaseAdmin } from '@/lib/supabase/admin';

function getCorsHeaders(req: NextRequest) {
  // Pastikan origin sesuai dengan domain frontend Abang
  const origin = req.headers.get('origin') || 'http://localhost:5173';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true', // Wajib untuk akses Cookie
  };
}

export async function POST(req: NextRequest) {
  const headers = getCorsHeaders(req);

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      const response = ApiResponseHelper.badRequest('Missing mandatory email or password.');
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    // 1. Sign In via Supabase Admin
    const { data, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.session) {
      const response = ApiResponseHelper.unauthorized(signInError?.message || 'Invalid credentials.');
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    // 2. Siapkan Response Sukses
    const response = ApiResponseHelper.success(
      { userId: data.user.id, email: data.user.email },
      'Authentication verified.'
    );
    
    // 3. Set Header CORS
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));

    // 4. 🔥 TANAM COOKIE (Sesi Session)
    // Supabase session biasanya adalah objek JSON. 
    // Kita stringify agar bisa disimpan di dalam cookie.
    response.cookies.set('sb-auth-token', JSON.stringify(data.session), {
      httpOnly: true, // Tidak bisa diakses oleh JavaScript (aman dari XSS)
      secure: process.env.NODE_ENV === 'production', // true jika HTTPS
      sameSite: 'lax', // Penting untuk komunikasi cross-port di lokal
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 minggu
    });

    return response;

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Fatal crash inside login router.';
    const response = ApiResponseHelper.badRequest(message);
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers });
}