import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  _req: NextRequest, 
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  console.log("DEBUG: Mencari produk dengan slug:", slug);

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error("DEBUG: Error Supabase:", error);
    return NextResponse.json({ message: 'Product not found', error }, { status: 404 });
  }

  if (!data) {
    console.log("DEBUG: Data tidak ditemukan untuk slug:", slug);
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}