/**
 * THEM_AVIA CORE ADMIN NETWORK SERVICES
 * Pusat kendali integrasi data antara UI Components (Frontend) dan API Routes (Backend)
 * Status: Cleaned & Streamlined - Menghubungkan langsung ke Core Types Global.
 */

import { 
  AdminBlogPost, 
  CreateBlogPostInput, 
  AdminAnalyticsStat, 
  AdminProductAsset, 
  AdminOrderLedger, 
  AdminDownloadLog, 
  AdminAffiliatePerformance, 
  AdminCommissionLogEntry, 
  AdminWithdrawalRequest, 
  AdminUserRegistry, 
  AdminCoreConfig 
} from '@/types/marketplace'; 

// ==========================================
// CORE FETCHING ENGINE HELPER
// ==========================================

async function fetchAdminData<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `API Network Error [${response.status}]`);
  }

  return payload.data as T;
}

// ==========================================
// OBJECT EXPORT MANAGEMENT
// ==========================================

export const adminService = {
  
  // 1. CORE MONITOR & BLOG HUB
  blog: {
    getAll: () => 
      fetchAdminData<AdminBlogPost[]>('/api/v1/admin/blog'),
    
    create: (data: CreateBlogPostInput) => 
      fetchAdminData<AdminBlogPost>('/api/v1/admin/blog', { method: 'POST', body: JSON.stringify(data) }),
  },

  analytics: {
    getWeeklyRevenue: () => 
      fetchAdminData<AdminAnalyticsStat[]>('/api/v1/admin/analytics'),
  },

  // 2. STORE MANAGEMENT
  products: {
    getAll: () => 
      fetchAdminData<AdminProductAsset[]>('/api/v1/admin/products'),
    
    create: (data: Omit<AdminProductAsset, 'id' | 'sales'>) => 
      fetchAdminData<AdminProductAsset>('/api/v1/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    
    update: (id: string, data: Partial<AdminProductAsset>) => 
      fetchAdminData<AdminProductAsset>(`/api/v1/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
    delete: (id: string) => 
      fetchAdminData<{ success: boolean }>(`/api/v1/admin/products/${id}`, { method: 'DELETE' }),
  },

  orders: {
    getAllLedger: () => 
      fetchAdminData<AdminOrderLedger[]>('/api/v1/admin/orders'),
  },

  downloads: {
    getAuditLogs: () => 
      fetchAdminData<AdminDownloadLog[]>('/api/v1/admin/downloads'),
  },

  // 3. AFFILIATE SYSTEM
  affiliates: {
    getPerformance: () => 
      fetchAdminData<AdminAffiliatePerformance[]>('/api/v1/admin/affiliates'),
  },

  commissions: {
    getAuditLogs: () => 
      fetchAdminData<AdminCommissionLogEntry[]>('/api/v1/admin/commissions'),
  },

  withdrawals: {
    getPendingRequests: () => 
      fetchAdminData<AdminWithdrawalRequest[]>('/api/v1/admin/withdrawals'),
    
    approve: (id: string) => 
      fetchAdminData<AdminWithdrawalRequest>(`/api/v1/admin/withdrawals/${id}/approve`, { method: 'POST' }),
    
    reject: (id: string, reason: string) => 
      fetchAdminData<AdminWithdrawalRequest>(`/api/v1/admin/withdrawals/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  },

  // 4. CONTROLS & SYSTEM SETTINGS
  users: {
    getRegistry: () => 
      fetchAdminData<AdminUserRegistry[]>('/api/v1/admin/users'),
    
    mutateRole: (id: string, role: 'buyer' | 'admin') => 
      fetchAdminData<AdminUserRegistry>(`/api/v1/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  },

  settings: {
    getCoreConfig: () => 
      fetchAdminData<AdminCoreConfig>('/api/v1/admin/settings'),
    
    updateConfig: (data: AdminCoreConfig) => 
      fetchAdminData<AdminCoreConfig>('/api/v1/admin/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  }
};