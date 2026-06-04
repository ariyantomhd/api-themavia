import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

// [GET] Pantau seluruh riwayat log unduhan produk digital di Themavia
export async function GET(req: NextRequest) {
  try {
    // 1. KEAMANAN: Pastikan hanya akun dengan role 'admin' yang bisa menarik data log ini
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || 'buyer', ['admin'])) {
      return ApiResponseHelper.forbidden('Access denied. Admin clearance level required.');
    }

    // 2. QUERY DATABASE: Tarik data dari tabel download_logs (atau nama tabel log download Abang)
    // Gabungkan dengan data profil user dan nama produk agar informasinya lengkap di UI Admin
    const { data: downloadLogs, error } = await supabaseAdmin
      .from('download_logs') 
      .select(`
        id,
        ip_address,
        user_agent,
        downloaded_at,
        profiles!user_id (
          email,
          full_name
        ),
        products!product_id (
          product_name,
          version
        )
      `)
      .order('downloaded_at', { ascending: false });

    if (error) {
      // Jika tabel download_logs belum dibuat/kosong, kita kembalikan array kosong agar UI tidak crash
      if (error.code === 'PGRST116' || error.message.includes('not found')) {
        return ApiResponseHelper.success([], 'No download logs recorded yet.');
      }
      throw error;
    }

    return ApiResponseHelper.success(downloadLogs, 'Global download audit logs successfully compiled.');
  } catch (error: unknown) {
    return ApiResponseHelper.badRequest(error instanceof Error ? error.message : 'Downloads API failure.');
  }
}