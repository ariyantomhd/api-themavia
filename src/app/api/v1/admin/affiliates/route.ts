import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  earnings: number;
  referral_count: number;
  status: string;
}

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('affiliates')
      .select('id, name, email, earnings, referral_count, status')
      .order('earnings', { ascending: false });

    if (error) throw error;

    const formatted = (data as Affiliate[]).map(a => ({
      id: a.id,
      name: a.name,
      email: a.email,
      earnings: a.earnings,
      referrals: a.referral_count,
      status: a.status
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET Affiliates List Error:", err);
    return NextResponse.json({ error: 'Failed to fetch list' }, { status: 500 });
  }
}