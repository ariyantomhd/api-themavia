import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    // Tambahkan ?? '' untuk memastikan role selalu string
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    // Tambahkan ?? '' untuk memastikan role selalu string
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, price, description, stock, category_id } = body;

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{ name, price, description, stock, category_id }]);

    if (error) throw error;

    return NextResponse.json({ message: 'Product created successfully', data }, { status: 201 });
  } catch (error) {
    console.error("Create Product Error:", error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}