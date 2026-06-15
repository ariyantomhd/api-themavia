import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('createdAt', { ascending: false }) 
      .limit(8);

    if (error) throw error;

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (error: unknown) {
    // Mengganti 'any' dengan 'unknown' untuk mengikuti aturan ESLint
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}