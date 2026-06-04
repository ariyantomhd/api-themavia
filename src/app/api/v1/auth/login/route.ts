import { NextRequest, NextResponse } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { supabaseAdmin } from '@/lib/supabase/admin';

function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function POST(req: NextRequest) {
  const headers = getCorsHeaders(req);

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      const response = ApiResponseHelper.badRequest('Missing mandatory email or password payload information.');
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const { data, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      const response = ApiResponseHelper.unauthorized(signInError?.message || 'Invalid email or operational password.');
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const response = ApiResponseHelper.success(
      { userId: data.user.id, email: data.user.email },
      'Authentication signature verified and logged in successfully.'
    );
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    return response;

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Fatal crash inside login router channels.';
    const response = ApiResponseHelper.badRequest(message);
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers });
}