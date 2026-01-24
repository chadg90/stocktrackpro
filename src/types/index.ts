/**
 * Shared type definitions for the Stock Track PRO application
 */

import { Timestamp } from 'firebase/firestore';

// ============================================
// USER & PROFILE TYPES
// ============================================

export type UserRole = 'admin' | 'manager' | 'user';

export interface Profile {
  id: string;
  company_id: string;
  role: UserRole;
  email?: string;
  displayName?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at?: Timestamp | string;
  last_login?: Timestamp | string;
}

// ============================================
// COMPANY TYPES
// ============================================

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled';
export type SubscriptionTier = 'basic' | 'professional' | 'enterprise';

export interface Company {
  id: string;
  name?: string;
  subscription_status?: SubscriptionStatus;
  subscription_type?: string;
  subscription_tier?: SubscriptionTier;
  subscription_expiry_date?: Timestamp | string;
  created_at?: Timestamp | string;
  updated_at?: Timestamp | string;
}

export interface CompanyWithCounts extends Company {
  vehiclesCount: number;
  assetsCount: number;
  usersCount: number;
}

// ============================================
// VEHICLE TYPES
// ============================================

export type VehicleStatus = 'active' | 'inactive' | 'maintenance' | 'retired';

export interface Vehicle {
  id: string;
  company_id: string;
  registration: string;
  make: string;
  model: string;
  year?: number;
  vin?: string;
  color?: string;
  mileage?: number;
  status?: VehicleStatus;
  image_url?: string;
  notes?: string;
  created_at?: Timestamp | string;
  updated_at?: Timestamp | string;
}

// ============================================
// ASSET/TOOL TYPES
// ============================================

export type AssetStatus = 'active' | 'checked_out' | 'maintenance' | 'retired' | 'lost';

export interface Asset {
  id: string;
  company_id: string;
  name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  type?: string;
  category?: string;
  status?: AssetStatus;
  location?: string;
  location_id?: string;
  condition?: string;
  purchase_date?: Timestamp | string;
  purchase_price?: number;
  image_url?: string;
  qr_code?: string;
  notes?: string;
  created_at?: Timestamp | string;
  updated_at?: Timestamp | string;
}

// Alias for backward compatibility
export type Tool = Asset;

// ============================================
// INSPECTION TYPES
// ============================================

export interface Inspection {
  id: string;
  company_id: string;
  vehicle_id: string;
  inspected_by: string;
  inspected_at: Timestamp | string;
  has_defect: boolean;
  mileage?: number;
  notes?: string;
  photo_urls?: Record<string, string>;
  created_at?: Timestamp | string;
}

// ============================================
// DEFECT TYPES
// ============================================

export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';
export type DefectStatus = 'pending' | 'investigating' | 'resolved';

export interface Defect {
  id: string;
  company_id: string;
  vehicle_id: string;
  reported_by?: string;
  reported_at?: Timestamp | string;
  severity?: DefectSeverity;
  description?: string;
  status: DefectStatus;
  photo_url?: string;
  photo_urls?: Record<string, string>;
  resolved_at?: Timestamp | string;
  resolved_by?: string;
  resolution_notes?: string;
}

// ============================================
// HISTORY TYPES
// ============================================

export type HistoryAction = 'checkout' | 'checkin' | 'transfer' | 'maintenance' | 'update';

export interface HistoryItem {
  id: string;
  company_id: string;
  tool_id?: string;
  vehicle_id?: string;
  user_id?: string;
  action?: HistoryAction | string;
  timestamp?: Timestamp | string;
  notes?: string;
  location?: string;
  location_id?: string;
}

// ============================================
// LOCATION TYPES
// ============================================

export interface Location {
  id: string;
  company_id: string;
  name: string;
  address?: string;
  type?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  created_at?: Timestamp | string;
  updated_at?: Timestamp | string;
}

// ============================================
// ACCESS CODE TYPES
// ============================================

export interface AccessCode {
  id: string;
  code: string;
  company_id: string;
  role: UserRole;
  used?: boolean;
  used_by?: string;
  used_at?: Timestamp | string;
  expires_at?: Timestamp | string;
  created_at?: Timestamp | string;
  created_by?: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'defect_reported' 
  | 'defect_resolved' 
  | 'inspection_due' 
  | 'asset_checkout'
  | 'asset_checkin'
  | 'system';

export interface Notification {
  id: string;
  company_id: string;
  user_id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  created_at?: Timestamp | string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DailyMetric {
  date: string;
  count: number;
}

export interface StatusBreakdown {
  name: string;
  value: number;
}

export interface UserActivity {
  id: string;
  name: string;
  inspections: number;
  actions: number;
  total: number;
}

export interface VehiclePerformance {
  id: string;
  name: string;
  inspections: number;
  defects: number;
  resolved: number;
  score: number;
}

// ============================================
// EXPORT TYPES
// ============================================

export interface ExportSheet {
  name: string;
  data: Record<string, unknown>[];
  fieldMappings?: Record<string, string>;
}
