import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    // 1. KEAMANAN BERLAPIS: Validasi token dan pastikan hanya Owner/Admin yang lolos
    const adminUser = await verifyToken(req);
    if (!adminUser) {
      return ApiResponseHelper.unauthorized('Invalid security authorization credentials.');
    }

    const hasClearance = checkRole(adminUser.role || 'buyer', ['admin']);
    if (!hasClearance) {
      return ApiResponseHelper.forbidden('Access denied. Admin clearance level required.');
    }

    // 2. PARALLEL FETCHING (Anti-Lag): Ambil metrik agregat web sekaligus dari Supabase
    const [transactionsCount, productsCount, usersCount, pendingWD] = await Promise.all([
      // Ambil seluruh data transaksi sukses untuk hitung total gross revenue & net profit
      supabaseAdmin.from('transactions').select('amount, commission_amount').eq('status', 'success'),
      // Hitung total script DeFi & UI Kits milik Abang yang terdaftar
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
      // Hitung akumulasi user (buyer + affiliate) di platform
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      // Hitung antrean dana withdrawal affiliate yang statusnya masih 'pending'
      supabaseAdmin.from('withdrawals').select('amount').eq('status', 'pending')
    ]);

    const transactions = transactionsCount.data || [];
    let totalRevenue = 0;
    let totalCommissionAllocated = 0;

    // Kalkulasi cepat di level memori server Next.js
    transactions.forEach(tx => {
      totalRevenue += tx.amount || 0;
      totalCommissionAllocated += tx.commission_amount || 0;
    });

    const netProfit = totalRevenue - totalCommissionAllocated;
    const pendingWdAmount = pendingWD.data?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    // 3. AMBIL LOG AKTIVITAS TERBARU (Untuk komponen Recent Orders & Recent Users)
    const [recentSalesQuery, recentUsersQuery] = await Promise.all([
      supabaseAdmin.from('transactions').select('id, amount, product_name, buyer_email, created_at').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('profiles').select('id, email, full_name, is_affiliate, created_at').order('created_at', { ascending: false }).limit(5)
    ]);

    // 4. BUNGKUS PAYLOAD JSON UNTUK KEBUTUHAN UTAMA UI DASHBOARD
    const masterDashboardStats = {
      summary: {
        total_revenue: totalRevenue,              // Omset kotor penjualan pribadi
        net_profit: netProfit,                    // Cuan bersih setelah dipotong komisi affiliate
        total_sales_count: transactions.length,   // Berapa kali script terjual
        total_listed_assets: productsCount.count || 0, // Total produk tayang
        total_registered_users: usersCount.count || 0  // Total user ekosistem Themavia
      },
      affiliate_pool: {
        total_commission_paid: totalCommissionAllocated,
        pending_withdrawal_request: pendingWdAmount // Total nominal WD yang musti Abang approve
      },
      recent_activities: {
        sales: recentSalesQuery.data || [],
        users: recentUsersQuery.data || []
      }
    };

    return ApiResponseHelper.success(masterDashboardStats, 'Master admin analytical data blocks successfully compiled.');

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Admin dashboard engine panic collapse.';
    return ApiResponseHelper.badRequest(message);
  }
}