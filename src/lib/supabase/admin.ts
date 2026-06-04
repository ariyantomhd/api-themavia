import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * 🌟 Diperbarui untuk Next.js 15 Build Compatibility (Tanpa 'any'):
 * Menggunakan Type Assertion 'as SupabaseClient' agar objek Proxy tetap mematuhi
 * kontrak tipe data Supabase Client tanpa merusak IntelliSense VS Code.
 */
export const supabaseAdmin: SupabaseClient = (() => {
  // Jika sedang dalam proses build dan env tidak lengkap, kembalikan proxy aman
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Proxy({} as SupabaseClient, {
      get(_, prop) {
        throw new Error(
          `CRITICAL RUNTIME ERROR: Missing Supabase Service Role Environment Variables. ` +
          `Failed to access property '${String(prop)}'. ` +
          `Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your deployment environment.`
        );
      },
    });
  }

  // Bypasses RLS - Hanya boleh diimpor di server-side services/actions!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
})();