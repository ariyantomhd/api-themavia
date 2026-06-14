import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { createClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supabase = createClient();

    // Ambil parameter dengan tipe data yang eksplisit
    const category = searchParams.get('category') || undefined;
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || 1000;

    // Build Query Supabase
    let query = supabase
      .from('products')
      .select('*')
      .gte('price', minPrice)
      .lte('price', maxPrice);

    // Perbaikan: Gunakan 'categoryId' sesuai skema tabel Abang
    if (category) {
      query = query.eq('categoryId', category);
    }

    // Perbaikan: Gunakan 'createdAt' (CamelCase) sesuai skema tabel Abang
    if (sort === 'newest') {
      query = query.order('createdAt', { ascending: false });
    } else if (sort === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price-high') {
      query = query.order('price', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return ApiResponseHelper.success(data || [], 'Marketplace data extracted.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data.';
    console.error('❌ [API Error]:', error);
    return ApiResponseHelper.error(message, 500);
  }
}