import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { createClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  // 1. CEK API KEY (Proteksi Akses)
  const secretKey = req.headers.get('x-api-secret');
  const expectedSecret = process.env.API_SECRET_KEY;

  if (!expectedSecret || secretKey !== expectedSecret) {
    return ApiResponseHelper.error('Access denied', 403);
  }

  try {
    const { searchParams } = new URL(req.url);
    const supabase = createClient();

    // 2. Sanitasi input
    const category = searchParams.get('category') || undefined;
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || 1000;

    // 3. Tentukan kolom publik
    const publicColumns = `
      id, name, description, price, discountPrice, 
      rating, sales, previewUrl, categoryId, slug, 
      platform, isPopular, isFeatured, isFlashSale
    `;

    // 4. Build Query
    let query = supabase
      .from('products')
      .select(publicColumns)
      .gte('price', minPrice)
      .lte('price', maxPrice);

    if (category) {
      query = query.eq('categoryId', category);
    }

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return ApiResponseHelper.error('Gagal mengambil data.', 500);
  }
}