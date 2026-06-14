import { NextResponse } from 'next/server';
import { supabaseAdmin } from "@/lib/supabase/admin"; // Pastikan path-nya benar

export async function GET() {
  try {
    // Menggunakan supabaseAdmin (Service Role) agar bypass RLS
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('isFeatured', true); // Filter berdasarkan kolom di database Abang

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data dari database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data produk unggulan berhasil dimuat",
      data: data || []
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}