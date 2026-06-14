import { NextResponse } from 'next/server';
import { supabaseAdmin } from "@/lib/supabase/admin"; 

export async function GET() {
  try {
    // Menggunakan supabaseAdmin untuk mengambil produk flash sale
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('isFlashSale', true); // Filter spesifik untuk flash sale

    if (error) {
      console.error("Supabase Error (Flash Sale):", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data flash sale" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data flash sale produk berhasil dimuat",
      data: data || []
    });
  } catch (error) {
    console.error("Unexpected Error (Flash Sale):", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}