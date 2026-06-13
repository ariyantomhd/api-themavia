import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const sessionUser = await verifyToken(req);
  if (!sessionUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('downloads')
    .select('*, products(*)') // Join dengan tabel products
    .eq('user_id', sessionUser.id)
    .order('downloaded_at', { ascending: false });

  if (error) return NextResponse.json({ message: 'Gagal ambil data download' }, { status: 500 });

  return NextResponse.json(data);
}