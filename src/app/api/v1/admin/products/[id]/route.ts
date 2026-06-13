import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

// 1. GET: Detail Produk berdasarkan ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET Product Error:", err);
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
}

// 2. PATCH: Update sebagian data produk
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { error } = await supabaseAdmin
      .from('products')
      .update(body)
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error("PATCH Product Error:", err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// 3. DELETE: Hapus produk
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error("DELETE Product Error:", err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}