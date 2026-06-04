import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

// [GET] Tarik seluruh list data performa affiliator untuk dipantau Admin
export async function GET(req: NextRequest) {
  try {
    // 1. KEAMANAN: Validasi hak akses Admin/Owner
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || 'buyer', ['admin'])) {
      return ApiResponseHelper.forbidden('Access denied. Admin clearance level required.');
    }

    // 2. QUERY UTAMA: Ambil daftar user yang terdaftar sebagai affiliate
    // Kita urutkan berdasarkan saldo komisi terbesar (Top Affiliator)
    const { data: affiliates, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        affiliate_balance,
        is_affiliate,
        created_at
      `)
      .eq('is_affiliate', true)
      .order('affiliate_balance', { ascending: false });

    if (error) throw error;

    // 3. ENHANCEMENT ANALYTICS (Opsional): Gabungkan dengan metrik performa eksternal
    // Di sini kita bisa memetakan total klik link atau jumlah transaksi yang mereka hasilkan
    const enrichedAffiliates = await Promise.all(
      (affiliates || []).map(async (aff) => {
        // Hitung berapa kali link milik affiliate ini menghasilkan penjualan sukses
        const { count: totalSales } = await supabaseAdmin
          .from('transactions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'success')
          .eq('affiliate_name', aff.full_name); // Atau relasi id affiliate jika ada

        return {
          ...aff,
          total_successful_referrals: totalSales || 0
        };
      })
    );

    return ApiResponseHelper.success(enrichedAffiliates, 'Global affiliate performance metrics compiled successfully.');
  } catch (error: unknown) {
    return ApiResponseHelper.badRequest(error instanceof Error ? error.message : 'Affiliate Admin API failed.');
  }
}