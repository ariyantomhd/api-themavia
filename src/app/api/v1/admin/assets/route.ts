import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

// [GET] Tarik semua list produk internal lengkap dengan meta metric (termasuk sales & rating)
export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || 'buyer', ['admin'])) {
      return ApiResponseHelper.forbidden('Access denied.');
    }

    const { data: inventory, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ApiResponseHelper.success(inventory, 'Master product inventory index retrieved.');
  } catch (error: unknown) {
    return ApiResponseHelper.badRequest(error instanceof Error ? error.message : 'Asset fetch failed.');
  }
}

// [DELETE] Menghapus produk dari register marketplace
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const productId = searchParams.get('id');

    if (!productId) return ApiResponseHelper.badRequest('Missing asset ID target parameter.');

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return ApiResponseHelper.success({ deleted_id: productId }, 'Digital asset purged from ledger index.');
  } catch (error: unknown) {
    return ApiResponseHelper.badRequest(error instanceof Error ? error.message : 'Asset destruction collapsed.');
  }
}