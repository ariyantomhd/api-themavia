'use client';

// ==========================================
// 🔐 --- USER & AUTH ENTITIES ---
// ==========================================
export interface User {
  id: string;
  email: string;
  full_name: string;         // Synced with 'profiles' table column
  username?: string;
  avatar_url?: string | null;
  role: 'buyer' | 'vendor' | 'affiliate' | 'admin';
  status: 'active' | 'suspended' | 'banned'; // 🌟 Pastikan baris ini ada dan terekspos!
  balance: number;           // Main seller/vendor earnings balance
  affiliate_balance: number; // Affiliate commission balance
  total_withdrawn: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUserRegistry {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'admin';
  isAffiliate: boolean;
  date: string;
}


// ==========================================
// 📊 --- DASHBOARD UI STATE ---
// ==========================================
export type DashboardMenuType =
  | 'overview'
  | 'library'
  | 'transaction'
  | 'settings';

  
// ==========================================
// 📦 --- PRODUCT & MARKETPLACE ENTITIES ---
// ==========================================
export interface ProductFile {
  name: string;
  url: string;
  size?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  product_id: string;
  rating: number;
  comment: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  regular_price?: number;
  extended_price?: number;
  category_id: string;      // PostgreSQL snake_case standard
  tags?: string[];
  preview_url: string;
  gallery?: string[];       // Array of supporting image URLs
  files: ProductFile[];     // Structure for digital assets (UI Kits / DeFi Scripts)
  reviews?: Review[];
  demo_url?: string;
  rating: number;
  sales: number;
  version: string;
  platform: string;         // Example: "React", "Next.js", "Solidity"
  is_popular?: boolean;
  is_featured?: boolean;
  is_flash_sale?: boolean;
  discount_price?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminProductAsset {
  id: string;
  name: string;
  category: 'Scripts' | 'UI Kits';
  price: number;
  sales: number;
  status: 'Active' | 'Maintenance';
}

// ==========================================
// 🛒 --- TRANSACTION, ORDERS & DOWNLOADS ---
// ==========================================
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense' | 'withdrawal' | 'affiliate_commission';
  status: 'pending' | 'success' | 'failed';
  description: string;
  reference_id?: string;
  metadata?: {
    tier_at_time?: string;  // Snapshot of affiliate tier at the moment of trade
    rate_at_time?: number;  // Snapshot of active commission rate (e.g., 0.40)
  };
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_ids: string[];
  total_price: number;
  status: 'pending' | 'paid' | 'failed';
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  price: number;
}

export interface AdminOrderLedger {
  id: string;
  invoice: string;
  asset: string;
  buyer: string;
  gross: number;
  comm: number;
  status: 'success' | 'failed' | 'pending';
}

export interface Payment {
  id: string;
  order_id: string;
  provider: 'paypal' | 'midtrans';
  transaction_id: string;
  status: 'pending' | 'success' | 'failed';
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface Download {
  id: string;
  user_id: string;
  product_id: string;
  file_id: string;
  downloaded_at: string;
}

export interface AdminDownloadLog {
  id: string;
  user: string;
  asset: string;
  ip: string;
  date: string;
}

// ==========================================
// 👥 --- PRODUCT-BASED AFFILIATE SYSTEM ---
// ==========================================
export interface Affiliate {
  id: string;
  user_id: string;
  code: string;              // Unique affiliate link identifier (e.g., dev_cuan2026)
  total_clicks: number;
  total_referrals: number;
  current_tier: 'basic' | 'pro' | 'elite'; // Gamified tiers
  commission_rate: number;  // Decimal rate percentage (e.g., 0.20 for 20%)
  status: 'active' | 'suspended';
  created_at: string;
}

export interface CommissionRule {
  id: string;
  name: string;              // "Basic", "Pro Tier", "Elite Tier"
  threshold: number;        // Minimum sales count required (e.g., 0, 30, 100)
  rate: number;             // Commission percentage award (e.g., 20, 40, 50)
}

export interface AffiliateEarning {
  id: string;
  affiliate_id: string;
  order_id: string;
  product_id: string;       // Rigid product-based referral correlation
  amount: number;           // Net commission amount received
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface AdminAffiliatePerformance {
  id: string;
  name: string;
  email: string;
  balance: number;
  totalSales: number;
  joinDate: string;
}

export interface AdminCommissionLogEntry {
  id: string;
  invoice: string;
  agent: string;
  asset: string;
  rate: string;
  amount: number;
  date: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: 'paypal' | 'bank_transfer' | 'crypto';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  account_details: string;  // Payment target details (e.g., crypto address, paypal email)
  created_at: string;
}

export interface AdminWithdrawalRequest {
  id: string;
  name: string;
  email: string;
  amount: number;
  bank: string;
  accNo: string;
  status: 'pending' | 'success' | 'rejected';
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  affiliate_balance: number;
  hold_balance: number;     // Escrow balance for clearance/refund cycles
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  expiry_date: string;
  is_active: boolean;
}

// ==========================================
// 📰 --- CONTENT & KNOWLEDGE (BLOG) ENTITIES ---
// ==========================================
export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  views: number;
  created_at: string;
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
}

// ==========================================
// ⚙️ --- PLATFORM ANALYTICS & MONITOR CONFIG ---
// ==========================================
export interface AdminAnalyticsStat {
  day: string;
  revenue: number;
  height: string;
}

export interface AdminCoreConfig {
  siteName: string;
  supportEmail: string;
  affiliateCommission: number;
  maintenanceMode: boolean;
}

// ==========================================
// 🧰 --- UTILITY & UTILS TYPES ---
// ==========================================
export type NewData<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

// ==========================================
// 🛒 --- EXTRA CHECKOUT INPUT TYPES ---
// ==========================================
export interface CheckoutItemInput {
  productId: string;
  priceType: 'regular_price' | 'extended_price';
}

export interface CreateIntentInput {
  userId: string;
  items: CheckoutItemInput[];
  couponCode?: string;
}

// ==========================================
// 🔔 --- CHECKOUT WEBHOOK PAYLOAD TYPE ---
// ==========================================
export interface GatewayWebhookPayload {
  orderId: string;
  transactionStatus: 'COMPLETED' | 'PENDING' | 'FAILED' | 'settlement' | 'expire';
  providerReferenceId: string;
  affiliateCode?: string;
}