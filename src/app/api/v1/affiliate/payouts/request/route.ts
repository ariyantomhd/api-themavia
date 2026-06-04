import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * GET: Extracts the absolute historical liquidation/payout records for the active affiliate.
 * Accessible via: GET /api/v1/affiliate/payouts
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authorization Shield & RBAC Verification
    const user = await verifyToken(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Session signature expired or falsified. Access denied.');
    }

    const hasClearance = checkRole(user.role || 'buyer', ['affiliate', 'admin']);
    if (!hasClearance) {
      return ApiResponseHelper.forbidden('Access denied. Insufficient affiliate clearance.');
    }

    // 2. Query the withdrawals ledger with strict filter parameters
    // 🌟 Fixed: Added .eq('balance_type', 'affiliate') to prevent vendor payout leakage
    const { data: payoutHistory, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .eq('balance_type', 'affiliate') // Mengunci hanya riwayat dompet afiliasi saja
      .order('created_at', { ascending: false });

    if (error) {
      return ApiResponseHelper.badRequest('Failed to extract affiliate disbursement records.');
    }

    // 3. Return isolated financial ticket list to frontend
    return ApiResponseHelper.success(
      payoutHistory || [],
      `Successfully retrieved ${payoutHistory?.length || 0} affiliate payout ticket logs.`
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Critical payout tracker exception.';
    return ApiResponseHelper.badRequest(message);
  }
}