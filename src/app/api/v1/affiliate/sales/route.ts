import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '../../../../../middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * GET: Extracts the complete referral sales ledger and commission records for the active affiliate.
 * Accessible via: GET /api/v1/affiliate/sales
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

    // 2. Query the referral logs joined with order details where the session user is the affiliate beneficiary
    const { data: salesHistory, error } = await supabaseAdmin
      .from('affiliate_earnings')
      .select(`
        id,
        order_id,
        amount,
        commission_rate,
        created_at,
        orders (
          status,
          total_price
        )
      `)
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return ApiResponseHelper.badRequest('Failed to extract referral conversion ledger records.');
    }

    // 3. Format payload output cleanly for client consumption
    const formattedSales = (salesHistory || []).map((sale) => {
      // Cast the joined data layer to extract nested order states safely
      const linkedOrder = sale.orders as unknown as { status: string; total_price: number } | null;
      
      return {
        id: sale.id,
        orderId: sale.order_id,
        commissionEarned: sale.amount,
        rateApplied: sale.commission_rate,
        convertedAt: sale.created_at,
        orderStatus: linkedOrder?.status || 'unknown',
        orderTotalValue: linkedOrder?.total_price || 0,
      };
    });

    return ApiResponseHelper.success(
      formattedSales,
      `Successfully synchronized ${formattedSales.length} referral conversion nodes.`
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Critical referral tracker exception.';
    return ApiResponseHelper.badRequest(message);
  }
}