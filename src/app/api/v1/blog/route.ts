import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    // Menambahkan log agar variabel 'error' digunakan dan membantu proses debugging
    console.error('Error fetching posts:', error);
    
    return NextResponse.json(
      { error: 'Gagal mengambil data' }, 
      { status: 500 }
    );
  }
}