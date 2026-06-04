import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

// [GET] Tarik seluruh daftar user terdaftar
export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || 'buyer', ['admin'])) {
      return ApiResponseHelper.forbidden('Access denied. Admin clearance level required.');
    }

    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, is_affiliate, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ApiResponseHelper.success(users, 'User account records successfully synchronized.');
  } catch (error: unknown) {
    return ApiResponseHelper.badRequest(error instanceof Error ? error.message : 'Users API failure.');
  }
}

// [PATCH] Mengubah status/role user (misal: set akun jadi admin atau affiliate)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { user_id, role, is_affiliate } = body;

    if (!user_id) return ApiResponseHelper.badRequest('Missing target user identity context.');

    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update({ role, is_affiliate, updated_at: new Date().toISOString() })
      .eq('id', user_id)
      .select()
      .single();

    if (error) throw error;
    return ApiResponseHelper.success(updatedProfile, 'User privilege matrix updated successfully.');
  } catch (error: unknown) {
    return ApiResponseHelper.badRequest(error instanceof Error ? error.message : 'User modification crash.');
  }
}