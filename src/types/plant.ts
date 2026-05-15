/**
 * Plant & Machinery Module — shared type definitions
 * Covers: machines, inspections, parts, sites, qualifications, billing
 */

import { Timestamp } from 'firebase/firestore';

// ============================================
// MACHINE TYPES
// ============================================

export type MachineCategory =
  | 'lifting_equipment'     // LOLER — cranes, hoists, forklift trucks, cherry pickers
  | 'work_equipment'        // PUWER — compressors, generators, power tools, mixers
  | 'access_equipment'      // PUWER — mobile towers, scissor lifts, access platforms
  | 'earth_moving'          // excavators, dumpers, rollers
  | 'other';

export type MachineStatus = 'active' | 'prohibited' | 'under_repair' | 'retired' | 'on_hire';

export type RegulationType = 'LOLER' | 'PUWER' | 'both';

export interface Machine {
  id: string;
  company_id: string;

  // Identity
  name: string;
  asset_number: string;             // user-defined identifier e.g. "EX-001"
  serial_number?: string;
  make?: string;
  model?: string;
  year?: number;
  category: MachineCategory;
  regulation_type: RegulationType;

  // Operational
  status: MachineStatus;
  site_id?: string;                 // ref → company_sites
  assigned_to?: string;             // user uid
  is_hired?: boolean;               // true = hired-in plant
  hire_company?: string;
  hire_start?: Timestamp | string;
  hire_end?: Timestamp | string;

  // Compliance dates
  next_loler_due?: Timestamp | string;
  next_service_due?: Timestamp | string;
  next_puwer_due?: Timestamp | string;

  // Prohibition
  prohibited_at?: Timestamp | string;
  prohibited_by?: string;           // user uid
  prohibition_reason?: string;
  prohibition_cleared_at?: Timestamp | string;
  prohibition_cleared_by?: string;

  // Media
  image_url?: string;

  created_at?: Timestamp | string;
  updated_at?: Timestamp | string;
  created_by?: string;
}

// ============================================
// PLANT INSPECTION TYPES
// ============================================

export type InspectionType = 'LOLER' | 'PUWER' | 'service' | 'hire_check';

export type InspectionOutcome = 'pass' | 'fail' | 'advisory';

export type DefectSeverityPlant = 'immediate' | 'monitor' | 'minor';

export interface PlantInspectionDefect {
  part_id?: string;                 // ref → plant_parts
  part_name: string;
  severity: DefectSeverityPlant;
  description: string;
  photo_url?: string;
}

export interface PlantInspectionAmendment {
  amended_at: Timestamp | string;
  amended_by: string;
  field: string;
  old_value: unknown;
  new_value: unknown;
  reason: string;
}

export interface PlantInspection {
  id: string;
  company_id: string;
  machine_id: string;
  machine_asset_number: string;
  machine_name: string;

  // Meta
  reference_number: string;         // e.g. "STP-INSP-2026-000042"
  inspection_type: InspectionType;
  regulation_type: RegulationType;

  // Inspector
  inspector_uid: string;
  inspector_name: string;
  inspector_qualification?: string;
  inspector_signature_url?: string;

  // Date / Location
  inspected_at: Timestamp | string;
  site_id?: string;
  site_name?: string;

  // Outcome
  outcome: InspectionOutcome;
  defects: PlantInspectionDefect[];
  notes?: string;

  // Next inspection
  next_inspection_due?: Timestamp | string;

  // PDF
  pdf_url?: string;

  // Amendments (admin only)
  amendments?: PlantInspectionAmendment[];

  created_at?: Timestamp | string;
  created_by?: string;
}

// ============================================
// PLANT PARTS LIBRARY
// ============================================

export interface PlantPart {
  id: string;
  company_id: string;
  name: string;
  category?: string;                // e.g. "hydraulics", "safety", "electrical"
  applicable_categories?: MachineCategory[];
  description?: string;
  created_at?: Timestamp | string;
  created_by?: string;
}

// ============================================
// COMPANY SITES
// ============================================

export interface CompanySite {
  id: string;
  company_id: string;
  name: string;
  address?: string;
  postcode?: string;
  contact_name?: string;
  contact_phone?: string;
  created_at?: Timestamp | string;
  created_by?: string;
}

// ============================================
// USER PLANT QUALIFICATION
// ============================================

export interface PlantQualification {
  id: string;
  company_id: string;
  user_uid: string;
  qualification_name: string;       // e.g. "IPAF", "PASMA", "CPCS"
  certificate_number?: string;
  issued_at?: Timestamp | string;
  expires_at?: Timestamp | string;
  document_url?: string;
  created_at?: Timestamp | string;
  created_by?: string;
}

// ============================================
// PLANT MODULE COMPANY CONFIG
// (stored on organisations/{id} doc)
// ============================================

export interface PlantModuleConfig {
  has_plant_module: boolean;
  plant_module_status?: 'active' | 'inactive' | 'trial';
  plant_module_activated_at?: Timestamp | string;
  plant_stripe_subscription_id?: string;
}

// ============================================
// USER PLANT ACCESS
// (stored on profiles/{uid} doc)
// ============================================

export interface UserPlantAccess {
  can_access_plant_module: boolean;
  plant_role?: 'inspector' | 'viewer';
  plant_qualifications?: string[];  // qualification ids
}

// ============================================
// NOTIFICATION / ALERT TYPES
// ============================================

export type PlantAlertType =
  | 'loler_due_soon'
  | 'loler_overdue'
  | 'puwer_due_soon'
  | 'puwer_overdue'
  | 'service_due_soon'
  | 'service_overdue'
  | 'hire_expiring'
  | 'prohibition_issued'
  | 'inspection_fail';

export interface PlantAlert {
  id: string;
  company_id: string;
  machine_id: string;
  machine_name: string;
  alert_type: PlantAlertType;
  due_date?: Timestamp | string;
  sent_at?: Timestamp | string;
  acknowledged?: boolean;
}

// ============================================
// API PAYLOAD TYPES
// ============================================

export interface CreateMachinePayload {
  name: string;
  asset_number: string;
  serial_number?: string;
  make?: string;
  model?: string;
  year?: number;
  category: MachineCategory;
  regulation_type: RegulationType;
  site_id?: string;
  assigned_to?: string;
  is_hired?: boolean;
  hire_company?: string;
  hire_start?: string;
  hire_end?: string;
  next_loler_due?: string;
  next_service_due?: string;
  next_puwer_due?: string;
  image_url?: string;
}

export interface ProhibitMachinePayload {
  reason: string;
}

export interface CreatePlantInspectionPayload {
  machine_id: string;
  inspection_type: InspectionType;
  inspected_at: string;
  site_id?: string;
  outcome: InspectionOutcome;
  defects?: PlantInspectionDefect[];
  notes?: string;
  next_inspection_due?: string;
  inspector_qualification?: string;
  inspector_signature_url?: string;
}

export interface AmendInspectionPayload {
  field: string;
  new_value: unknown;
  reason: string;
}
