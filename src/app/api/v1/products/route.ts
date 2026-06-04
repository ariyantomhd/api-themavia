import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { ProductsService } from '@/services/products/product.service';
import { Product, NewData } from '@/types/marketplace';

/**
 * GET: Pulls all unclassified digital scripts and layout packages listed in the marketplace.
 * Accessible via: GET /api/v1/products
 */
export async function GET() {
  const catalogue = await ProductsService.listPublicProducts();
  return ApiResponseHelper.success(catalogue, 'Marketplace catalogue data blocks extracted.');
}

/**
 * POST: Registers a new asset product item package into the centralized tables.
 * Accessible via: POST /api/v1/products
 * Restricted to administrative credentials or certified vendors.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Role-Based Access Control (RBAC) Verification
    const adminUser = await verifyToken(req);
    if (!adminUser) {
      return ApiResponseHelper.unauthorized('Invalid security authorization credentials.');
    }

    // 🌟 Fixed: Added a fallback value ('buyer') to eliminate the 'string | undefined' signature conflict
    const hasClearance = checkRole(adminUser.role || 'buyer', ['admin', 'vendor']);
    if (!hasClearance) {
      return ApiResponseHelper.forbidden('Access denied. Insufficient role authority clearance.');
    }

    const body = await req.json() as NewData<Product>;
    const { name, description, price, category_id, files, preview_url, platform } = body;

    // 2. Basic Inbound Parameter Validation Checkpoint
    if (!name || !description || price === undefined || !category_id || !files || !preview_url || !platform) {
      return ApiResponseHelper.badRequest('Missing mandatory metadata structural payload values.');
    }

    // 3. Delegate execution payload down to the storage database engine
    const finalizedProductRecord = await ProductsService.createProduct(body);
    if (!finalizedProductRecord) {
      throw new Error('Database transaction collapsed during asset record creation.');
    }

    return ApiResponseHelper.success(
      finalizedProductRecord,
      'Digital asset successfully deployed into the marketplace catalogue registry.',
      201
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Product registration fatal collapse.';
    return ApiResponseHelper.badRequest(message);
  }
}