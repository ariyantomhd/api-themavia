// src/modules/products/product.controller.ts
import { Request, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabase/admin';
import { ProductService } from './product.service';

export class ProductController {
  private service: ProductService;

  constructor() {
    this.service = new ProductService();
  }

  getProducts = async (req: Request, res: Response) => {
    try {
      // Definisi parameter secara spesifik dan detail (tidak universal)
      const { 
        category, 
        category_id, 
        is_featured, 
        is_popular, 
        is_flash_sale, 
        limit, 
        sort, 
        filter 
      } = req.query;

      // Query langsung ke tabel products agar aman dari error relasi schema cache Supabase
      let query = supabaseAdmin.from('products').select('*');

      // 1. Filter wajib: Status harus PUBLISHED
      query = query.eq('status', 'PUBLISHED');

      // 2. Filter spesifik berdasarkan kategori (mencocokkan slug Navbar ke category_id database)
      const targetCategory = category || category_id;
      if (targetCategory && targetCategory !== 'ALL') {
        const { data: catData, error: catError } = await supabaseAdmin
          .from('product_categories')
          .select('id')
          .eq('slug', targetCategory)
          .single();

        if (catData && !catError) {
          query = query.eq('category_id', catData.id);
        } else {
          query = query.eq('category_id', targetCategory);
        }
      }

      // 3. Filter spesifik status produk
      if (is_featured === 'true') {
        query = query.eq('is_featured', true);
      }
      if (is_popular === 'true') {
        query = query.eq('is_popular', true);
      }
      if (is_flash_sale === 'true') {
        query = query.eq('is_flash_sale', true);
      }

      // 4. Filter khusus berdasarkan menu Navbar (filter=new / filter=deals)
      if (filter === 'new') {
        query = query.order('created_at', { ascending: false });
      } else if (filter === 'deals') {
        query = query.not('discount_price', 'is', null);
      }

      // 5. Definisi detail logika Sorting (bestseller, trending, atau default terbaru)
      if (sort === 'bestseller') {
        query = query.order('regular_price', { ascending: true });
      } else if (sort === 'trending') {
        query = query.order('id', { ascending: false });
      } else if (!filter) {
        query = query.order('created_at', { ascending: false });
      }

      // 6. Batasan limit data
      const parsedLimit = limit ? parseInt(limit as string, 10) : 100;
      query = query.limit(parsedLimit);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        items: data,
      });
    } catch (error: any) {
      console.error("Get Products Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getProductBySlug = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;

      const product = await this.service.getProductBySlug(slug);

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (err: any) {
      console.error("Controller Error:", err);

      return res.status(404).json({
        success: false,
        message: err.message || "Product not found",
      });
    }
  };

  // Endpoint Tracking Affiliate / Click Product Link
  trackClick = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this.service.trackAffiliateClick(id);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };

  createProduct = async (req: Request, res: Response) => {
    try {
      const product = await this.service.createProduct(req.body);
      return res.status(201).json({
        success: true,
        data: product,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };
}