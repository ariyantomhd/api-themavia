import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Strict typing for statistical aggregation maps
interface MetricsSummary {
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  availableBalance: number;
}

/**
 * GET: Aggregates analytics metadata snapshots for the active affiliate user profile.
 * Accessible via: GET /api/v1/affiliate/dashboard
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authorization Shield & RBAC Security Verification
    const user = await verifyToken(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Session signature expired or invalid. Access blocked.');
    }

    const hasClearance = checkRole(user.role || 'buyer', ['affiliate', 'admin']);
    if (!hasClearance) {
      return ApiResponseHelper.forbidden('Access denied. Insufficient affiliate profile role.');
    }

    // 2. Aggregate Click and Conversion counters from the affiliate links table
    const { data: linkMetrics, error: linkError } = await supabaseAdmin
      .from('affiliate_links')
      .select('clicks, conversions')
      .eq('user_id', user.id);

    if (linkError) {
      return ApiResponseHelper.badRequest('Failed to aggregate link tracking metadata logs.');
    }

    // Calculate sums using strict native reducers
    const totalClicks = (linkMetrics || []).reduce((acc, curr) => acc + (curr.clicks || 0), 0);
    const totalConversions = (linkMetrics || []).reduce((acc, curr) => acc + (curr.conversions || 0), 0);

    // 3. Extract financial performance variables (Total Earnings vs Wallet Balance)
    const { data: earningsData, error: earningsError } = await supabaseAdmin
      .from('affiliate_earnings')
      .select('amount')
      .eq('affiliate_id', user.id);

    if (earningsError) {
      return ApiResponseHelper.badRequest('Failed to calculate historical earning summaries.');
    }

    const totalEarnings = (earningsData || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // 4. Fetch dynamic active wallet liquid balance row
    const { data: walletRow, error: walletError } = await supabaseAdmin
      .from('profiles')
      .select('affiliate_balance')
      .eq('id', user.id)
      .single();

    if (walletError) {
      return ApiResponseHelper.badRequest('Failed to synchronize current wallet stream nodes.');
    }

    // 5. Construct structural analytical summary package
    const statisticalSnapshot: MetricsSummary = {
      totalClicks,
      totalConversions,
      totalEarnings,
      availableBalance: walletRow?.affiliate_balance ?? 0
    };

    return ApiResponseHelper.success(
      statisticalSnapshot,
      'Affiliate analytical dashboard matrix calculated and synchronized successfully.'
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Critical dashboard analytics breakdown.';
    return ApiResponseHelper.badRequest(message);
  }
}