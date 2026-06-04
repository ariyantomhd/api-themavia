import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Order } from '@/types/marketplace';

/**
 * GET: Extracts the complete historical invoice ledger owned by the active session buyer.
 * Accessible via: GET /api/v1/orders/me
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Session Guard: Ensure request originates from an authenticated network identity
    const user = await verifyToken(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Session signature expired or falsified. Access denied.');
    }

    // 2. Query the orders registry ledger matching the authenticated user ID
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return ApiResponseHelper.badRequest('Failed to retrieve user operational invoice history.');
    }

    // 3. Enforce precise type assertion to map rows into explicit Order structural entities
    const orderHistory = (data || []) as Order[];

    // 4. Yield the payload securely to the frontbridge layer
    return ApiResponseHelper.success(
      orderHistory,
      `Successfully extracted ${orderHistory.length} ledger logs for the active user account.`
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Critical order tracker runtime collapse.';
    return ApiResponseHelper.badRequest(message);
  }
}