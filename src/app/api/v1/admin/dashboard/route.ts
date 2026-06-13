import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

// Interface untuk data mentah dari database
interface Transaction {
  amount: number;
  created_at: string;
}

// Interface untuk elemen chart data
interface ChartDataPoint {
  name: string;
  revenue: number;
  sales: number;
}

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || '', ['admin'])) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parallel fetch
    const [
      { data: transactions, error: transError },
      { count: totalOrders, error: countError },
      { count: totalCustomers, error: custError },
      { count: activeProducts, error: prodError }
    ] = await Promise.all([
      supabaseAdmin.from('transactions').select('amount, created_at'),
      supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ]);

    if (transError || countError || custError || prodError) throw new Error('Database query failed');

    const transactionList = (transactions as Transaction[]) || [];

    // Proses Data Revenue
    const totalRevenue = transactionList.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Proses Chart Data (7 Hari terakhir) dengan tipe yang jelas
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const chartData = transactionList
      .filter((t) => new Date(t.created_at) >= sevenDaysAgo)
      .reduce((acc: ChartDataPoint[], curr) => {
        const day = new Date(curr.created_at).toLocaleDateString('en-US', { weekday: 'short' });
        const existing = acc.find((item) => item.name === day);
        
        if (existing) {
          existing.revenue += curr.amount;
          existing.sales += 1;
        } else {
          acc.push({ name: day, revenue: curr.amount, sales: 1 });
        }
        return acc;
      }, []);

    return NextResponse.json({
      stats: {
        totalRevenue: `$${totalRevenue.toLocaleString()}`,
        totalOrders,
        totalCustomers,
        activeProducts
      },
      chartData
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}