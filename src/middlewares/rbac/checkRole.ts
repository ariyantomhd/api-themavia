import { supabaseAdmin } from '@/lib/supabase/admin';

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