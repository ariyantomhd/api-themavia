// src/modules/dashboard/dashboard.service.ts
import { DashboardRepository } from './dashboard.repo';
import { 
  DashboardUser, 
  DashboardStats, 
  RecentOrder, 
  PurchasedProduct 
} from '../../types/dashboard';

export interface DashboardOverviewResponse {
  user: DashboardUser;
  stats: DashboardStats;
  recent_orders: RecentOrder[];
}

export class DashboardService {
  static async getDashboardOverview(userId: string): Promise<DashboardOverviewResponse> {
    const [user, stats, recentOrders] = await Promise.all([
      DashboardRepository.getUserById(userId),
      DashboardRepository.getStats(userId),
      DashboardRepository.getRecentOrders(userId),
    ]);

    return {
      user: user as DashboardUser,
      stats: stats as DashboardStats,
      recent_orders: recentOrders as RecentOrder[],
    };
  }

  static async getPurchases(userId: string): Promise<RecentOrder[]> {
    const orders = await DashboardRepository.getAllOrders(userId);
    return orders as RecentOrder[];
  }

  static async getDownloads(userId: string): Promise<PurchasedProduct[]> {
    const downloads = await DashboardRepository.getDownloads(userId);
    return downloads as PurchasedProduct[];
  }

  static async updateUserSettings(
    userId: string, 
    payload: { display_name?: string; avatar_url?: string }
  ): Promise<DashboardUser> {
    const updated = await DashboardRepository.updateProfile(userId, payload);
    return updated as DashboardUser;
  }
}