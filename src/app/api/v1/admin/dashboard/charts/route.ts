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

    // Mengambil data transaksi dalam 7 hari terakhir
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('amount, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Memproses data dengan tipe yang spesifik (Record<string, number>)
    const chartData = (data || []).reduce((acc: Record<string, number>, curr) => {
      const date = new Date(curr.created_at).toLocaleDateString('id-ID');
      acc[date] = (acc[date] || 0) + (curr.amount || 0);
      return acc;
    }, {});

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Dashboard Charts Error:", error);
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}