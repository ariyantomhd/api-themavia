import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

export async function GET(req: NextRequest) {
  try {
    // 1. Verifikasi Admin
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || 'buyer', ['admin'])) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 2. Query 5 transaksi terbaru
    const { data: orders, error } = await supabaseAdmin
      .from('transactions')
      .select('id, invoice_number, buyer_email, amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Recent Orders Error:", error);
    return NextResponse.json({ error: 'Failed to fetch recent orders' }, { status: 500 });
  }
}