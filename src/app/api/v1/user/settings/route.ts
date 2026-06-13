import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest) {
  const sessionUser = await verifyToken(req);
  if (!sessionUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(body)
    .eq('id', sessionUser.id);

  if (error) return NextResponse.json({ message: 'Gagal update profile' }, { status: 500 });

  return NextResponse.json({ message: 'Profile updated', data });
}