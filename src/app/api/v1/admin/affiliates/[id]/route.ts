import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

// 1. GET: Detail Mitra Afiliasi
export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // params sekarang Promise
) {
  try {
    const { id } = await params; // Wajib di-await!
    
    const adminUser = await verifyToken(req);
    // checkRole bersifat async, jadi wajib di-await
    if (!adminUser || !(await checkRole(adminUser.id, ['admin']))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET Affiliate Detail Error:", err);
    return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
  }
}

// 2. PATCH: Update Status (Approve/Reject/Ban)
export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // params sekarang Promise
) {
  try {
    const { id } = await params; // Wajib di-await!

    const adminUser = await verifyToken(req);
    // checkRole bersifat async, jadi wajib di-await
    if (!adminUser || !(await checkRole(adminUser.id, ['admin']))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status } = await req.json();

    const { error } = await supabaseAdmin
      .from('affiliates')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Affiliate status updated' });
  } catch (err) {
    console.error("PATCH Affiliate Error:", err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}