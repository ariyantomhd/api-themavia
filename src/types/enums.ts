// src/types/enums.ts

export type UserRole = 'ADMIN' | 'STAFF' | 'SELLER' | 'BUYER' | 'REGULATOR' | 'USER';
export const UserRole = {
  ADMIN: 'ADMIN' as UserRole,
  STAFF: 'STAFF' as UserRole,
  SELLER: 'SELLER' as UserRole,
  BUYER: 'BUYER' as UserRole,
  REGULATOR: 'REGULATOR' as UserRole,
  USER: 'USER' as UserRole,
} as const;

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export const AccountStatus = {
  ACTIVE: 'ACTIVE' as AccountStatus,
  SUSPENDED: 'SUSPENDED' as AccountStatus,
  PENDING_VERIFICATION: 'PENDING_VERIFICATION' as AccountStatus,
} as const;

export type AuthStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';
export const AuthStatus = {
  PENDING: 'PENDING' as AuthStatus,
  ACTIVE: 'ACTIVE' as AuthStatus,
  SUSPENDED: 'SUSPENDED' as AuthStatus,
} as const;

export type AffiliateStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'DENIED';
export type ProductStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type LicenseType = 'REGULAR' | 'EXTENDED';
export type LicenseStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';
export type OrderStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUNDED';
export type PayoutStatus = 'REQUEST' | 'PENDING' | 'APPROVED' | 'DENIED' | 'SUCCESS';
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type RefundStatus = 'PENDING' | 'UNDER_INVESTIGATION' | 'APPROVED' | 'REJECTED';
export type FeeType = 'FIXED' | 'PERCENTAGE';
export type PostStatus = 'DRAFT' | 'PUBLISHED';
export type BlogPostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type PaymentGateway = 'PAYPAL' | 'STRIPE' | 'MIDTRANS';
export const PaymentGateway = {
  PAYPAL: 'PAYPAL' as PaymentGateway,
  STRIPE: 'STRIPE' as PaymentGateway,
  MIDTRANS: 'MIDTRANS' as PaymentGateway,
} as const;

export type DiscountType = 'percentage' | 'fixed';

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export const TransactionStatus = {
  PENDING: 'PENDING' as TransactionStatus,
  SUCCESS: 'SUCCESS' as TransactionStatus,
  PAID: 'PAID' as TransactionStatus,
  FAILED: 'FAILED' as TransactionStatus,
  REFUNDED: 'REFUNDED' as TransactionStatus,
  CANCELLED: 'CANCELLED' as TransactionStatus,
} as const;

export type DownloadStatus = 'SUCCESS' | 'FAILED' | 'UNAUTHORIZED';
export const DownloadStatus = {
  SUCCESS: 'SUCCESS' as DownloadStatus,
  FAILED: 'FAILED' as DownloadStatus,
  UNAUTHORIZED: 'UNAUTHORIZED' as DownloadStatus,
} as const;

// Security & Regulator Enums
export type ModuleKey =
  | 'MARKETPLACE_FRONTEND'
  | 'BUYER_DASHBOARD'
  | 'SELLER_DASHBOARD'
  | 'ADMIN_DASHBOARD'
  | 'AFFILIATE_PORTAL'
  | 'CHECKOUT_SERVICE'
  | 'PAYMENT_GATEWAY'
  | 'AUTH_SERVICE'
  | 'FILE_STORAGE'
  | 'LICENSE_MODULE'
  | 'API_SERVICE';

export type ThreatType =
  | 'SQL_INJECTION'
  | 'XSS_ATTEMPT'
  | 'CSRF_ATTEMPT'
  | 'COMMAND_INJECTION'
  | 'PATH_TRAVERSAL'
  | 'SSRF_ATTEMPT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'BRUTE_FORCE_ATTEMPT'
  | 'SUSPICIOUS_PAYLOAD'
  | 'MALICIOUS_FILE_UPLOAD'
  | 'UNAUTHORIZED_MODULE_ACCESS'
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  | 'REPLAY_ATTACK'
  | 'SUSPICIOUS_LOGIN'
  | 'BOT_ACTIVITY'
  | 'ACCOUNT_TAKEOVER_ATTEMPT';

export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SecurityAction =
  | 'LOGGED'
  | 'RATE_LIMITED'
  | 'REQUEST_BLOCKED'
  | 'SESSION_REVOKED'
  | 'USER_SUSPENDED'
  | 'IP_BLOCKED'
  | 'MODULE_DISABLED'
  | 'ADMIN_ALERTED';

export type SystemStatus = 'ONLINE' | 'MAINTENANCE' | 'DISABLED';

export type IPBlockReason =
  | 'MANUAL_BAN_BY_REGULATOR'
  | 'EXCEEDED_RATE_LIMIT'
  | 'DETECTED_SQL_INJECTION'
  | 'DETECTED_XSS_ATTEMPT'
  | 'DETECTED_BRUTE_FORCE'
  | 'SUSPICIOUS_ACTIVITY'
  | 'MALICIOUS_FILE_UPLOAD'
  | 'AUTOMATIC_SECURITY_RULE';

export type IPReputation = 'TRUSTED' | 'UNKNOWN' | 'SUSPICIOUS' | 'MALICIOUS' | 'BLOCKED';
export type SessionStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'SUSPICIOUS';

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGED'
  | 'EMAIL_CHANGED'
  | 'TWO_FACTOR_ENABLED'
  | 'TWO_FACTOR_DISABLED'
  | 'SESSION_CREATED'
  | 'SESSION_REVOKED'
  | 'ROLE_CHANGED'
  | 'PERMISSION_DENIED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_RESTORED';

export type SecurityAlertStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';

export type AuditAction =
  | 'MODULE_ENABLED'
  | 'MODULE_DISABLED'
  | 'MODULE_MAINTENANCE_ENABLED'
  | 'IP_BLOCKED'
  | 'IP_UNBLOCKED'
  | 'USER_SUSPENDED'
  | 'USER_RESTORED'
  | 'ROLE_CHANGED'
  | 'PERMISSION_CHANGED'
  | 'SECURITY_SETTING_CHANGED'
  | 'SESSION_REVOKED'
  | 'SECURITY_ALERT_RESOLVED';

// Dashboard & User Activity Enums
export type DashboardWidgetType = 
  | 'STATS_OVERVIEW' 
  | 'RECENT_ORDERS' 
  | 'DOWNLOADS_LIST' 
  | 'QUICK_ACTIONS' 
  | 'ANALYTICS_CHART';

export type DashboardTabType = 
  | 'OVERVIEW' 
  | 'ORDERS' 
  | 'DOWNLOADS' 
  | 'WISHLIST' 
  | 'SETTINGS';

export type ActivityActionType = 
  | 'PRODUCT_PURCHASED' 
  | 'PROFILE_UPDATED' 
  | 'PASSWORD_UPDATED' 
  | 'LICENSE_DOWNLOADED' 
  | 'WISHLIST_ADDED';