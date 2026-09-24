// src/modules/products/product.repository.ts
import { supabaseAdmin } from '../../lib/supabase/admin';
import { Product, CreateProductInput } from '../../types/product';

export class ProductRepository {
  // Ambil semua produk publik yang berstatus PUBLISHED
  async findAll(): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Product[];
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data as Product;
  }

  // Ambil detail produk berdasarkan slug
  async findBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'PUBLISHED')
      .single();

    if (error && error.code !== 'PGRST116') return null;
    return data as Product;
  }

  // Ambil produk berdasarkan kriteria flag publik (menggunakan snake_case kolom database)
  async findByFlag(flagColumn: 'is_featured' | 'is_popular' | 'is_flash_sale'): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('status', 'PUBLISHED')
      .eq(flagColumn, true);

    if (error) throw new Error(error.message);
    return data as Product[];
  }

  // Ambil produk rilis terbaru berdasarkan created_at
  async findNewReleases(limit: number = 10): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data as Product[];
  }

  // Tracking klik affiliate atau preview produk
  async trackProductClick(productId: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc('increment_product_clicks', { product_id: productId });
    if (error) {
      console.warn('Tracking click RPC warning:', error.message);
    }
  }

  async create(input: CreateProductInput): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([input])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Product;
  }
}