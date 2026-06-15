import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';

export async function POST(req: NextRequest) {
  try {
    const authHeader =
      req.headers.get('authorization') ||
      req.headers.get('Authorization');

    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token) {
      return ApiResponseHelper.success(null, 'Logged out (no token provided).');
    }

    return ApiResponseHelper.success(null, 'Logged out successfully.');
  } catch (err) {
    console.error('Logout Error:', err);
    return ApiResponseHelper.success(null, 'Logged out.');
  }
}