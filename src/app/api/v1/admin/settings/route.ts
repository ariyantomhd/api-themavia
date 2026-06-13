import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

// Interface untuk pengaturan marketplace
interface MarketplaceSettings {
  marketplace_name: string;
  support_email: string;
  commission_rate: number;
  maintenance_mode: boolean;
}

// 1. GET: Ambil konfigurasi saat ini
export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 1) // Asumsi hanya ada 1 baris setting dengan ID 1
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET Settings Error:", err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// 2. PATCH: Update konfigurasi
export async function PATCH(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: MarketplaceSettings = await req.json();

    const { error } = await supabaseAdmin
      .from('settings')
      .update({
        marketplace_name: body.marketplace_name,
        support_email: body.support_email,
        commission_rate: body.commission_rate,
        maintenance_mode: body.maintenance_mode,
      })
      .eq('id', 1);

    if (error) throw error;
    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error("PATCH Settings Error:", err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}