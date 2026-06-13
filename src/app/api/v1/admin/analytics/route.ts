import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

// Interface untuk data dari database
interface Transaction {
  amount: number;
  created_at: string;
}

interface Product {
  category: string;
  sales_count: number;
}

// Interface untuk hasil olahan data chart
interface MonthlyData {
  name: string;
  revenue: number;
  sales: number;
}

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: transData, error: transError } = await supabaseAdmin
      .from('transactions')
      .select('amount, created_at')
      .order('created_at', { ascending: true });

    if (transError) throw transError;

    const { data: catData, error: catError } = await supabaseAdmin
      .from('products')
      .select('category, sales_count');

    if (catError) throw catError;

    // Olah data untuk Line Chart (Agregasi per bulan)
    const transactions = (transData as Transaction[]) || [];
    const monthlyData = transactions.reduce((acc: MonthlyData[], curr) => {
      const month = new Date(curr.created_at).toLocaleString('default', { month: 'short' });
      const existing = acc.find((item) => item.name === month);
      
      if (existing) {
        existing.revenue += curr.amount;
        existing.sales += 1;
      } else {
        acc.push({ name: month, revenue: curr.amount, sales: 1 });
      }
      return acc;
    }, []);

    // Olah data untuk Pie Chart
    const products = (catData as Product[]) || [];
    const totalSales = products.reduce((sum, item) => sum + item.sales_count, 0);
    const categoryData = products.map((item) => ({
      name: item.category,
      value: totalSales > 0 ? Math.round((item.sales_count / totalSales) * 100) : 0,
    }));

    return NextResponse.json({
      monthlyData,
      categoryData,
      stats: {
        avgOrderValue: 84.20,
        conversionRate: 3.2,
        retentionRate: 24,
        itemsPerOrder: 1.4
      }
    });
  } catch (err) {
    console.error("GET Analytics Error:", err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}