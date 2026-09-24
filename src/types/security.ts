import {
  ModuleKey,
  ThreatType,
  ThreatSeverity,
  SecurityAction,
  SystemStatus,
  IPBlockReason,
  IPReputation,
  SessionStatus,
  SecurityEventType,
  SecurityAlertStatus,
  AuditAction,
} from './enums';

// Log Aktivitas & Keamanan Pengguna
export interface SecurityEventLog {
  id: string;
  user_id: string | null;
  event_type: SecurityEventType;
  ip_address: string;
  user_agent: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
}

// Log Deteksi Ancaman Siber
export interface SecurityThreatLog {
  id: string;
  threat_type: ThreatType;
  severity: ThreatSeverity;
  source_ip: string;
  module_key: ModuleKey;
  action_taken: SecurityAction;
  payload_sample?: string | null;
  created_at: string;
}

// Aturan Pemblokiran IP
export interface IPBlockRule {
  id: string;
  ip_address: string;
  reason: IPBlockReason;
  reputation: IPReputation;
  blocked_by_user_id?: string | null;
  notes?: string | null;
  expires_at?: string | null;
  created_at: string;
}

// Manajemen Sesi Pengguna
export interface SecuritySession {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  status: SessionStatus;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

// Peringatan Keamanan
export interface SecurityAlert {
  id: string;
  title: string;
  threat_type: ThreatType;
  severity: ThreatSeverity;
  status: SecurityAlertStatus;
  affected_module?: ModuleKey | null;
  details?: Record<string, unknown> | null;
  resolved_at?: string | null;
  resolved_by_user_id?: string | null;
  created_at: string;
}

// Audit Trail Tindakan Perubahan Sistem / Regulasi
export interface AuditLog {
  id: string;
  actor_id: string;
  action: AuditAction;
  target_entity?: string | null;
  target_id?: string | null;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  ip_address: string;
  created_at: string;
}

// Konfigurasi Status Modul Sistem
export interface SystemModuleConfig {
  id: string;
  module_key: ModuleKey;
  status: SystemStatus;
  maintenance_message?: string | null;
  updated_at: string;
}