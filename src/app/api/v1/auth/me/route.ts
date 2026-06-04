import { NextRequest, NextResponse } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { AuthService } from '@/services/auth/auth.service';

function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    // Di file ini kita mengizinkan metode GET dan OPTIONS
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function GET(req: NextRequest) {
  const headers = getCorsHeaders(req);

  try {
    const sessionUser = await verifyToken(req);
    if (!sessionUser) {
      const response = ApiResponseHelper.unauthorized('Invalid or expired authentication session signature.');
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const refreshedProfile = await AuthService.getUserProfile(sessionUser.id);
    if (!refreshedProfile) {
      const response = ApiResponseHelper.forbidden('Access revoked. Account state is blocked or suspended.');
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const response = ApiResponseHelper.success(
      refreshedProfile,
      'Active user metadata and balance streams synchronized successfully.'
    );
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    return response;

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to parse session profile values.';
    const response = ApiResponseHelper.badRequest(message);
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers });
}