import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { User } from '@/types/marketplace';

/**
 * Middleware untuk verifikasi token.
 * Fokus: Mengekstrak token dengan aman dari Cookie (sb-auth-token)
 * yang disimpan sebagai JSON string.
 */
export async function verifyToken(req: NextRequest): Promise<User | null> {
  let token: string | null = null;

  // 1. Ambil Cookie 'sb-auth-token'
  const authCookie = req.cookies.get('sb-auth-token');

  if (authCookie) {
    try {
      // 2. Karena kita menyimpan session sebagai JSON string
      const session = JSON.parse(authCookie.value);
      
      // Ambil access_token dari objek session Supabase
      token = session.access_token || null;
    } catch (e) {
      console.error('❌ [VerifyToken] Gagal parse JSON cookie:', e);
      return null;
    }
  }

  // 3. Jika token tidak ditemukan (berarti belum login/cookie kosong)
  if (!token) {
    console.warn('⚠️ [VerifyToken] Token tidak ditemukan di Cookie.');
    return null;
  }

  // 4. Verifikasi ke Supabase Admin
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.warn('⚠️ [VerifyToken] Token tidak valid atau user tidak ditemukan.');
      return null;
    }

    // 5. Mapping data Supabase ke Interface User aplikasi
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? 'User',
      username: user.user_metadata?.username,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      role: user.user_metadata?.role ?? 'buyer',
      status: user.user_metadata?.status ?? 'active',
      balance: user.user_metadata?.balance ?? 0,
      affiliate_balance: user.user_metadata?.affiliate_balance ?? 0,
      total_withdrawn: user.user_metadata?.total_withdrawn ?? 0,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
    } as User;
    
  } catch (err) {
    console.error('💥 [VerifyToken] Fatal error saat memvalidasi user:', err);
    return null;
  }
}