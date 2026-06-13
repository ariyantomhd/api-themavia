import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mengambil total partner, total payout, dan rata-rata konversi
    // Asumsi ada tabel 'affiliates'
    const { data, error } = await supabaseAdmin
      .from('affiliates')
      .select('earnings, referral_count, status');

    if (error) throw error;

    const totalPartners = data.length;
    const totalPayouts = data.reduce((sum, item) => sum + (item.earnings || 0), 0);
    // Contoh perhitungan konversi sederhana
    const conversionRate = totalPartners > 0 ? (data.filter(a => a.referral_count > 0).length / totalPartners) * 100 : 0;

    return NextResponse.json({
      totalPartners,
      totalPayouts,
      conversionRate: conversionRate.toFixed(1)
    });
  } catch (err) {
    console.error("GET Affiliate Stats Error:", err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}