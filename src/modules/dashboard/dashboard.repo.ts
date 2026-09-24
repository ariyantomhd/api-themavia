// src/modules/dashboard/dashboard.repo.ts
import { supabaseAdmin as supabase } from '../../lib/supabase/admin';

export class DashboardRepository {
  static async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, avatar_url, role, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) {
      return {
        id: userId,
        full_name: 'User',
        display_name: 'User',
        email: '',
        avatar_url: null,
        role: 'BUYER',
        created_at: new Date().toISOString(),
      };
    }

    return {
      ...data,
      display_name: data.full_name || 'User',
    };
  }

  static async getStats(userId: string) {
    const { count: activeOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'COMPLETED');

    const { count: downloadableItems } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: wishlistCount } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { data: ordersData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', userId)
      .eq('status', 'COMPLETED');

    const totalSpent = ordersData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

    return {
      active_orders: activeOrders || 0,
      downloadable_items: downloadableItems || 0,
      wishlist_count: wishlistCount || 0,
      total_spent: totalSpent,
    };
  }

  static async getRecentOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, total_amount, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw new Error(error.message);

    return (data || []).map((order: any) => ({
      id: order.id,
      order_number: `#${order.id.slice(0, 8).toUpperCase()}`,
      product_name: 'Digital Product Order',
      created_at: order.created_at,
      total_amount: order.total_amount || 0,
      status: order.status || 'PENDING',
    }));
  }

  static async getAllOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, total_amount, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map((order: any) => ({
      id: order.id,
      order_number: `#${order.id.slice(0, 8).toUpperCase()}`,
      product_name: 'Digital Product Order',
      created_at: order.created_at,
      total_amount: order.total_amount || 0,
      status: order.status || 'PENDING',
    }));
  }

  static async getDownloads(userId: string) {
    const { data, error } = await supabase
      .from('downloads')
      .select('id, title, version, download_url, purchased_at')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  static async updateProfile(userId: string, updateData: { display_name?: string; avatar_url?: string }) {
    const dbPayload: any = { id: userId };
    if (updateData.display_name !== undefined) {
      dbPayload.full_name = updateData.display_name;
    }
    if (updateData.avatar_url !== undefined) {
      dbPayload.avatar_url = updateData.avatar_url;
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(dbPayload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);

    const updatedUser = data || {
      id: userId,
      full_name: updateData.display_name || 'User',
      avatar_url: updateData.avatar_url || null,
    };

    return {
      ...updatedUser,
      display_name: updatedUser.full_name,
    };
  }
}