import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const sessionUser = await verifyToken(req);
  if (!sessionUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  // Ambil semua order yang sudah 'paid'
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('product_ids')
    .eq('user_id', sessionUser.id)
    .eq('status', 'paid');

  if (error) return NextResponse.json({ message: 'Gagal ambil library' }, { status: 500 });

  return NextResponse.json(data);
}