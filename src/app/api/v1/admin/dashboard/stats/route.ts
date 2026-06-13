import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || 'buyer', ['admin'])) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Gunakan destructuring untuk menangkap error dari supabase
    const { count, error: countError } = await supabaseAdmin
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError; // Lempar ke catch jika gagal

    const { data: salesData, error: salesError } = await supabaseAdmin
      .from('transactions')
      .select('amount');

    if (salesError) throw salesError;

    const totalRevenue = salesData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    return NextResponse.json({
      totalRevenue,
      totalOrders: count || 0,
    });
  } catch (error) {
    console.error("Admin Dashboard Stats Error:", error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}