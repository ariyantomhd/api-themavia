import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  _req: NextRequest, 
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Decode slug untuk memastikan karakter URL (seperti %20) terbaca benar
    const decodedSlug = decodeURIComponent(slug);

    console.log("DEBUG: Mencari produk dengan slug:", decodedSlug);

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('slug', decodedSlug)
      .single();

    if (error) {
      // Jika error bukan karena data kosong (misal: koneksi db), tetap log
      if (error.code !== 'PGRST116') { // PGRST116 adalah kode untuk 'no rows'
        console.error("DEBUG: Error Supabase:", error);
      }
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(data);
    
  } catch (err) {
    console.error("DEBUG: Server Error:", err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}