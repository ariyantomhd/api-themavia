import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '../../../../../middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';
// 🌟 Fixed: 'Product' is now actively used to strictly type database entity returns
import { Product } from '@/types/marketplace';

// 🌟 Diperbarui untuk Next.js 15: params sekarang wajib berbentuk Promise
interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET: Retrieves the full metadata portfolio of a single digital product by its unique ID.
 * Accessible via: GET /api/v1/products/[id]
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // 🌟 Diperbarui untuk Next.js 15: wajib di-await sebelum digunakan
    const { id } = await params;

    if (!id) {
      return ApiResponseHelper.badRequest('Target product ID parameter is required.');
    }

    // Explicitly casting the database single row capture to comply with Product interface specifications
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return ApiResponseHelper.notFound('The requested digital asset could not be found.');
    }

    const product = data as Product; // 🌟 Type verification utilized here
    return ApiResponseHelper.success(product, 'Product data structure resolved successfully.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to resolve product record.';
    return ApiResponseHelper.badRequest(message);
  }
}

/**
 * PUT: Updates metadata coordinates of an existing product listing.
 * Accessible via: PUT /api/v1/products/[id]
 * Restricted to Admins or Authorized Vendors.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // 🌟 Diperbarui untuk Next.js 15: wajib di-await sebelum digunakan
    const { id } = await params;

    // 1. RBAC Guard Shield
    const user = await verifyToken(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Invalid security authorization credentials.');
    }

    const hasClearance = checkRole(user.role || 'buyer', ['admin', 'vendor']);
    if (!hasClearance) {
      return ApiResponseHelper.forbidden('Access denied. Insufficient role authority clearance.');
    }

    const body = await req.json();

    // Anti-Hack: Prevent client from sneakily modifying fixed immutable counters via raw body injection
    delete body.id;
    delete body.sales;
    delete body.rating;
    delete body.created_at;

    // 2. Perform safe updates restricted strictly to dynamic meta fields
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return ApiResponseHelper.badRequest(error?.message || 'Failed to update the target asset record.');
    }

    const updatedProduct = data as Product; // 🌟 Type verification utilized here too
    return ApiResponseHelper.success(updatedProduct, 'Marketplace catalogue asset modified successfully.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Product adjustment fatal failure.';
    return ApiResponseHelper.badRequest(message);
  }
}

/**
 * DELETE: Hard deletes or archives a product structure from the centralized catalogue.
 * Accessible via: DELETE /api/v1/products/[id]
 * Restricted strictly to High-Level Administrators.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // 🌟 Diperbarui untuk Next.js 15: wajib di-await sebelum digunakan
    const { id } = await params;

    // 1. Absolute Authority Guard: Only administrative roles can delete items
    const user = await verifyToken(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Invalid security authorization credentials.');
    }

    const hasClearance = checkRole(user.role || 'buyer', ['admin']);
    if (!hasClearance) {
      return ApiResponseHelper.forbidden('Access denied. Admin authorization required.');
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return ApiResponseHelper.badRequest('Database constraints prevented asset deletion.');
    }

    return ApiResponseHelper.success({ deletedId: id }, 'Digital product permanently purged from marketplace index.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Product purge transaction failed.';
    return ApiResponseHelper.badRequest(message);
  }
}