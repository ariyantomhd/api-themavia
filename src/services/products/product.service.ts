import { supabaseAdmin } from '@/lib/supabase/admin';
import { Product, NewData } from '@/types/marketplace';

// 🌟 Buat interface kontrak parameter filter baru agar type-safe
export interface ListProductsParams {
  search?: string;
  category?: string;
  sort?: string;
}

export class ProductsService {
  /**
   * Fetches the public directory of listed digital assets with full server-side filtering.
   * Melakukan filtrasi super cepat langsung di mesin database Supabase.
   */
  static async listPublicProducts(params: ListProductsParams = {}): Promise<Product[]> {
    try {
      const { search, category, sort } = params;

      // 1. Inisialisasi Kueri Dasar Supabase
      let query = supabaseAdmin.from('products').select('*');

      // 2. SERVER-SIDE FILTER: Filter Kategori (Jika dipilih dan bukan 'all')
      if (category && category !== 'all') {
        query = query.eq('category_id', category);
      }

      // 3. SERVER-SIDE FILTER: Filter Pencarian Teks (Ililike = Case Insensitive)
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      // 4. SERVER-SIDE SORTING: Pengurutan Data Dinamis
      if (sort === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (sort === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else if (sort === 'popular') {
        query = query.order('sales', { ascending: false });
      } else {
        // Default: 'latest' (Produk Terbaru)
        query = query.order('created_at', { ascending: false });
      }

      // 5. Eksekusi Kueri Tunggal
      const { data: products, error } = await query;

      if (error || !products) return [];
      return products as Product[];
    } catch {
      return [];
    }
  }

  /**
   * Safely registers a brand new digital asset package inside the marketplace index ledger.
   */
  static async createProduct(input: NewData<Product>): Promise<Product | null> {
    try {
      const { data: newAsset, error } = await supabaseAdmin
        .from('products')
        .insert([
          {
            ...input,
            sales: 0,       // Anti-Hack: Force fresh products to 0 sales to prevent false popularity injection
            rating: 5.0,    // Establish an initial high baseline rating for the digital script
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error || !newAsset) return null;
      return newAsset as Product;
    } catch {
      return null;
    }
  }
}