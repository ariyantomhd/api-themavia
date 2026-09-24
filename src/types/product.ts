// src/types/product.ts
import { ProductStatus } from './enums';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
}

export interface ProductGallery {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  buyer_id: string;
  rating: number;
  review_text: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  userName?: string;
  comment?: string;
  date?: string;
  likes?: number;
}

export interface ProductFileAsset {
  name: string;
  size: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  long_description: string;
  regular_price: number;
  extended_price: number;
  discount_price: number | null;
  discount_ends_at: string | null;
  category_id: string | null;
  tags: string[];
  tech_stack: string[];
  current_version: string;
  thumbnail_url?: string | null;
  live_preview_url: string | null;
  file_source_url: string; // Internal system usage
  status: ProductStatus;
  is_featured?: boolean;
  is_popular?: boolean;
  is_flash_sale?: boolean;
  created_at: string;
  updated_at: string;
  gallery?: ProductGallery[];
  reviews?: ProductReview[];
}

export interface ProductChangelog {
  id: string;
  product_id: string;
  version: string;
  changes_text: string;
  released_at: string;
}

export interface ProductRelation {
  product_id: string;
  related_product_id: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProductInput = Partial<CreateProductInput>;