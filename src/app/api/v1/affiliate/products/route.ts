import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

// 🌟 Declaring an explicit inline interface for our specific database partial select slice
interface PromotionalProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  preview_url: string | null;
  platform: string;
  commission_rate: number | null;
  sales: number | null;
}

/**
 * GET: Retrieves the marketplace product catalogue formatted specifically for affiliate tracking and asset selection.
 * Accessible via: GET /api/v1/affiliate/products
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

    // 2. Fetch active listed products that are eligible for affiliate marketing promotion
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, name, description, price, preview_url, platform, commission_rate, sales')
      .order('created_at', { ascending: false });

    if (error) {
      return ApiResponseHelper.badRequest('Failed to extract affiliate promotional catalog ledger.');
    }

    // 3. 🌟 Fixed: Cast raw data to a strict local row type matrix, absolutely zero 'any' allowed
    const rawItems = (data || []) as PromotionalProductRow[];
    
    const promotionalCatalog = rawItems.map((item) => {
      // Safely apply defaults for potentially nullable database columns
      const rate = item.commission_rate ?? 10;
      const priceValue = item.price;

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: priceValue,
        previewUrl: item.preview_url,
        platform: item.platform,
        salesCount: item.sales ?? 0,
        commissionPercentage: rate, 
        estimatedEarnings: (priceValue * rate) / 100
      };
    });

    return ApiResponseHelper.success(
      promotionalCatalog,
      `Successfully synchronized ${promotionalCatalog.length} promotional asset coordinates for active distribution.`
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Critical promotional catalog index failure.';
    return ApiResponseHelper.badRequest(message);
  }
}