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
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response = ApiResponseHelper.badRequest('Missing standard authorization bearer token header layout.');
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const token = authHeader.split(' ')[1]?.trim();

    if (token) {
      const { error } = await supabaseAdmin.auth.admin.signOut(token, 'local');
      if (error) {
        console.warn('⚠️ [Logout Backend] Admin token revocation warning:', error.message);
      }
    }

    const response = ApiResponseHelper.success(null, 'Session token invalidated and logged out successfully.');
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    return response;

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Fatal crash inside logout router channels.';
    console.error('💥 [POST /auth/logout] Fatal Error:', message);
    
    const response = ApiResponseHelper.badRequest(message);
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers });
}