import { UserRole } from './enums';

export interface DashboardStats {
  total_spent: number;
  active_orders: number;
  downloadable_items: number;
  wishlist_count: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  product_name: string;
  product_image?: string | null;
  total_amount: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  created_at: string;
}

export interface PurchasedProduct {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  download_url: string;
  version: string;
  purchased_at: string;
}

export interface UserDashboardData {
  user: {
    id: string;
    username: string;
    email: string;
    avatar_url: string | null;
    role: UserRole;
    created_at: string;
  };
  stats: DashboardStats;
  recent_orders: RecentOrder[];
  purchased_products: PurchasedProduct[];
}