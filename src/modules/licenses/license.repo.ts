// src/modules/licenses/license.repo.ts
import { supabaseAdmin } from '../../lib/supabase/admin';

export class LicenseRepository {
  static async createLicenses(licensesData: { 
    user_id: string; 
    product_id: string; 
    order_id: string; 
    license_key: string; 
    license_type?: string 
  }[]) {
    const { data, error } = await supabaseAdmin
      .from('licenses')
      .insert(licensesData)
      .select();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getLicensesByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('licenses')
      .select(`
        id,
        license_key,
        license_type,
        status,
        created_at,
        expires_at,
        products (
          id,
          title,
          slug,
          short_description,
          file_source_url,
          thumbnail_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  static async getLicenseByKey(licenseKey: string) {
    const { data, error } = await supabaseAdmin
      .from('licenses')
      .select(`
        id,
        license_key,
        license_type,
        status,
        created_at,
        expires_at,
        users (
          id,
          email,
          full_name
        ),
        products (
          id,
          title,
          slug,
          file_source_url
        )
      `)
      .eq('license_key', licenseKey)
      .single();

    if (error) return null;
    return data;
  }
}