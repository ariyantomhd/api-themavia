import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface SessionUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

/**
 * Memvalidasi token JWT dan mengambil metadata user secara lengkap.
 */
export async function verifyToken(req: NextRequest): Promise<SessionUser | null> {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) return null;

    // Verifikasi token via Supabase Admin
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error('❌ [VerifyToken] Supabase menolak token:', error?.message);
      return null;
    }

    // Mengembalikan data user dengan menyertakan name dari user_metadata
    return {
      id: user.id,
      email: user.email,
      // Penting: Mengambil full_name dari user_metadata sesuai skema Supabase Auth
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      role: user.user_metadata?.role || 'buyer',
    };
  } catch {
    console.error('💥 [VerifyToken] Fatal error.');
    return null;
  }
}

/**
 * Memeriksa role user di database (bukan metadata) agar selalu sinkron dengan DB.
 */
export async function checkRole(userId: string, allowedRoles: string[]): Promise<boolean> {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) return false;

    return allowedRoles.includes(profile.role);
  } catch {
    return false;
  }
}