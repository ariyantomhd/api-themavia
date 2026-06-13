import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Pastikan field di sini sesuai dengan interface di UI Abang
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('id, userId, amount, method, account_details, status, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Fetch Withdrawals Error:", error);
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
  }
}