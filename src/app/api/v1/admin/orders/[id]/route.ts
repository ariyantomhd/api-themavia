import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

// 1. GET: Detail satu pesanan
export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // Menggunakan Promise
) {
  try {
    const { id } = await params; // Wajib di-await

    const adminUser = await verifyToken(req);
    // checkRole bersifat async, jadi wajib di-await
    if (!adminUser || !(await checkRole(adminUser.id, ['admin']))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET Order Detail Error:", err);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
}

// 2. PATCH: Update status pesanan
export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // Menggunakan Promise
) {
  try {
    const { id } = await params; // Wajib di-await

    const adminUser = await verifyToken(req);
    if (!adminUser || !(await checkRole(adminUser.id, ['admin']))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status } = await req.json();

    const { error } = await supabaseAdmin
      .from('transactions')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Order status updated successfully' });
  } catch (err) {
    console.error("PATCH Order Status Error:", err);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}