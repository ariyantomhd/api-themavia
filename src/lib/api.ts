// src/lib/api.ts
import { supabase } from '@/lib/supabase/client';
import { Product, User } from '@/types/marketplace';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface GetProductsParams {
  search?: string;
  category?: string;
  sort?: string;
}

export const api = {
  // ----------------------------------------
  // 🔐 AUTH OPERATIONS
  // ----------------------------------------

  /**
   * POST: Mendaftarkan akun baru ke ekosistem Themavia
   * Endpoint: /api/v1/auth/register
   */
  register: async (payload: Record<string, string>): Promise<ApiResponse<{ userId: string; email: string }>> => {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal mendaftarkan akun baru.');
    return result;
  },

  /**
   * POST: Autentikasi masuk pengguna via Endpoint API internal
   */
  login: async (payload: Record<string, string>): Promise<ApiResponse<User>> => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal masuk ke akun Anda.');
    return result;
  },

  /**
   * GET: Sinkronisasi metadata profil, role, dan saldo user aktif
   * Endpoint: /api/v1/auth/me
   */
  getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
    try {
      // 1. Ambil token JWT session langsung dari Supabase Client Browser
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      // 🟢 FIX UTAMA: Jika token tidak ada (misal karena baru saja logout), 
      // jangan throw error, cukup kembalikan data null dengan aman jaya.
      if (!token) {
        console.log('ℹ️ [API.getCurrentUser] Tidak ada session aktif (User dalam posisi Guest/Logout).');
        return {
          success: true,
          message: 'No active session found.',
          data: null
        };
      }

      // Kirim request membawa token segar ke backend jika token tersedia
      const response = await fetch('/api/v1/auth/me', { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Invalid or expired authentication session signature.');
      }
      
      return result; 
    } catch (error) {
      console.error('❌ [API.getCurrentUser] Error:', error);
      throw error;
    }
  },

  /**
   * POST: Invalidation token akses / Revoke sesi lokal
   * Endpoint: /api/v1/auth/logout
   */
  logout: async (): Promise<ApiResponse<null>> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await supabase.auth.signOut();

    const response = await fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: headers,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal memproses logout server.');
    return result;
  },

  // ----------------------------------------
  // 📦 PRODUCTS OPERATIONS
  // ----------------------------------------
  
  getProducts: async (params: GetProductsParams = {}): Promise<Product[]> => {
    const { search, category, sort } = params;
    const queryParams = new URLSearchParams();
    
    if (search) queryParams.set('search', search);
    if (category) queryParams.set('category', category);
    if (sort) queryParams.set('sort', sort);

    try {
      const response = await fetch(`/api/v1/products?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Gagal fetch data produk.');
      const result: ApiResponse<Product[]> = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error pada getProducts:', error);
      return [];
    }
  },
};