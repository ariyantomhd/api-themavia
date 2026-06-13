import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

// Update tipe params menjadi Promise dan tambahkan await pada fungsi async
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // Perubahan: Promise
) {
  try {
    // 1. Ambil ID dari params yang sekarang adalah Promise
    const { id } = await params;

    const adminUser = await verifyToken(req);
    
    // 2. checkRole adalah fungsi async, jadi wajib pakai await
    if (!adminUser || !(await checkRole(adminUser.id, ['admin']))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Error:", err);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}