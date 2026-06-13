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

    // Mengambil query parameters untuk search dan sort
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('search') || '';

    // Query ke database
    let query = supabaseAdmin
      .from('transactions') // Asumsi tabel transaksi
      .select('id, customer_name, customer_email, product_name, amount, status, created_at');

    // Jika ada search query, filter berdasarkan ID atau Email
    if (searchQuery) {
      query = query.or(`id.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Mapping data ke format yang cocok dengan UI
    const formattedOrders = data?.map((order) => ({
      id: order.id,
      customer: order.customer_name,
      email: order.customer_email,
      product: order.product_name,
      amount: order.amount,
      status: order.status,
      date: new Date(order.created_at).toLocaleString('id-ID'),
    }));

    return NextResponse.json(formattedOrders);
  } catch (err) {
    console.error("GET Orders Error:", err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}