import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

// 1. GET: Detail satu pesanan
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET Order Detail Error:", err);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
}

// 2. PATCH: Update status pesanan
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status } = await req.json(); // Kita hanya butuh update status

    const { error } = await supabaseAdmin
      .from('transactions')
      .update({ status })
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ message: 'Order status updated successfully' });
  } catch (err) {
    console.error("PATCH Order Status Error:", err);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}