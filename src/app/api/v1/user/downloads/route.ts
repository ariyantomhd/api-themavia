import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const sessionUser = await verifyToken(req);
  if (!sessionUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Menggunakan nama constraint untuk memastikan join berhasil
  // Menggunakan 'created_at' karena 'downloaded_at' tidak ada di DDL
  const { data, error } = await supabaseAdmin
    .from('downloads')
    .select('*, products!downloads_product_id_fkey(*)') 
    .eq('user_id', sessionUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase Error:', error); // Log untuk memantau error di terminal
    return NextResponse.json(
      { message: 'Gagal ambil data download', details: error.message }, 
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}