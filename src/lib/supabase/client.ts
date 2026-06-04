import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables (URL / Anon Key)');
}

// 1. Tetap sediakan fungsi pembuat client (untuk kebutuhan page.tsx produk)
export function createClient() {
  return supabaseCreateClient(supabaseUrl!, supabaseAnonKey!);
}

// 2. Sediakan juga instansiasi instan yang langsung diekspor (untuk SignInForm & Auth)
export const supabase = createClient();

// 3. Cadangan export default agar tidak merusak dependensi tak terduga
export default createClient;