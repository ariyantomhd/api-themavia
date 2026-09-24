// src/modules/products/product.service.ts
import { ProductRepository } from './product.repo';
import { CreateProductInput } from '../../types/product';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  async getAllProducts() {
    return await this.repository.findAll();
  }

  async getProductById(id: string) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new Error('Produk tidak ditemukan');
    }
    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await this.repository.findBySlug(slug);
    if (!product) {
      throw new Error('Produk tidak ditemukan');
    }
    return product;
  }

  async getNewReleases(limit: number = 10) {
    return await this.repository.findNewReleases(limit);
  }

  async trackAffiliateClick(productId: string) {
    await this.getProductById(productId);
    await this.repository.trackProductClick(productId);
    return { message: 'Click tracked successfully' };
  }

  async createProduct(input: CreateProductInput) {
    if (input.slug) {
      const existing = await this.repository.findBySlug(input.slug);
      if (existing) {
        throw new Error('Produk dengan slug tersebut sudah ada.');
      }
    }
    return await this.repository.create(input);
  }
}