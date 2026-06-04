import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin'; // 🟢 Ganti ke admin murni untuk server-side

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

/**
 * Memvalidasi token JWT dari header Authorization (Bearer Token)
 * Mengembalkan objek user jika valid, atau null jika tidak valid/expired.
 */
export async function verifyToken(req: NextRequest) {
  try {
    // Ambil header dengan toleransi case-insensitive alternatif jika "authorization" kosong
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ [VerifyToken] Handshake gagal: Header Authorization tidak ditemukan atau format bukan Bearer.');
      return null;
    }

    // Bersihkan token dari spasi yang tidak sengaja terbawa
    const token = authHeader.split(' ')[1]?.trim();

    if (!token) {
      console.warn('⚠️ [VerifyToken] Handshake gagal: String token kosong setelah diekstrak.');
      return null;
    }

    // 🟢 VERIFIKASI LANGSUNG DI SERVER: Gunakan admin auth ledger untuk mengambil data user aktif
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error('❌ [VerifyToken] Supabase menolak token:', error?.message || 'User tidak ditemukan.');
      return null;
    }

    // Kembalikan struktur data user yang sah untuk dipakai di Route /api/v1/auth/me
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch {
    // Variabel 'err' dihapus agar lolos sensor aturan ketat ESLint Abang
    console.error('💥 [VerifyToken] Fatal crash saat parsing token.');
    return null;
  }
}

/**
 * Memeriksa apakah user memiliki salah satu role yang diizinkan di database.
 * Memanfaatkan supabaseAdmin untuk membaca tabel profil user secara aman.
 */
export async function checkRole(userId: string, allowedRoles: string[]): Promise<boolean> {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return false;
    }

    return allowedRoles.includes(profile.role);
  } catch {
    // Variabel err dihapus karena tidak digunakan
    return false;
  }
}