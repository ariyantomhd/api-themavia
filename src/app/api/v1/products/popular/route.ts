import { NextResponse } from 'next/server';
import { supabaseAdmin } from "@/lib/supabase/admin"; 

export async function GET() {
  try {
    // Menggunakan supabaseAdmin untuk mengambil produk popular
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('isPopular', true); // Filter spesifik untuk produk populer

    if (error) {
      console.error("Supabase Error (Popular Products):", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data produk populer" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data produk populer berhasil dimuat",
      data: data || []
    });
  } catch (error) {
    console.error("Unexpected Error (Popular Products):", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}