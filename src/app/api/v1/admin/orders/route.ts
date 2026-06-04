import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || 'buyer', ['admin'])) {
      return ApiResponseHelper.forbidden('Access denied.');
    }

    // Ambil log transaksi transaksi yang sukses maupun pending untuk kebutuhan audit cashflow
    const { data: ledger, error } = await supabaseAdmin
      .from('transactions')
      .select('id, invoice_number, amount, commission_amount, status, buyer_email, product_name, affiliate_name, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ApiResponseHelper.success(ledger, 'Financial ledger records extracted.');
  } catch (error: unknown) {
    return ApiResponseHelper.badRequest(error instanceof Error ? error.message : 'Order ledger collapse.');
  }
}