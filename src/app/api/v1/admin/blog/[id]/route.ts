import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const adminUser = await verifyToken(req);
  if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from('posts').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 });
  
  return NextResponse.json({ success: true });
}