/**
 * Server-side plant machine CRUD (website dashboard).
 * Uses Firebase Admin — same collections as the mobile app.
 */
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '../firebase-admin';

const MACHINES = 'plant_machines';

export type PlantMachineInput = {
  plant_number: string;
  serial_number: string;
  internal_id?: string | null;
  make: string;
  model: string;
  year?: number | null;
  date_of_manufacture?: string | null;
  equipment_description?: string | null;
  usual_location?: string | null;
  safe_working_load: string;
  lifts_persons?: boolean;
  examination_interval_months?: number;
  examination_scheme?: boolean;
  last_examination_date?: string | null;
  next_examination_due?: string | null;
};

function buildPayload(data: PlantMachineInput, companyId: string, userId: string) {
  const liftsPersons = !!data.lifts_persons;
  let interval = data.examination_interval_months ?? 12;
  if (liftsPersons) interval = 6;

  return {
    company_id: companyId,
    plant_number: data.plant_number.trim(),
    serial_number: data.serial_number.trim(),
    internal_id: data.internal_id?.trim() || null,
    make: data.make.trim(),
    model: data.model.trim(),
    year: data.year ?? null,
    date_of_manufacture: data.date_of_manufacture || null,
    equipment_description: data.equipment_description?.trim() || null,
    usual_location: data.usual_location?.trim() || null,
    safe_working_load: data.safe_working_load.trim(),
    lifts_persons: liftsPersons,
    examination_interval_months: interval,
    examination_scheme: !!data.examination_scheme,
    last_examination_date: data.last_examination_date || null,
    next_examination_due: data.next_examination_due || null,
    prohibited: false,
    prohibition_reason: null,
    is_active: true,
    status: 'operational',
    created_by: userId,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };
}

export async function listPlantMachines(companyId: string, activeOnly = true) {
  const db = getAdminDb();
  let q = db.collection(MACHINES).where('company_id', '==', companyId);
  if (activeOnly) {
    q = q.where('is_active', '==', true);
  }
  const snap = await q.orderBy('plant_number', 'asc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createPlantMachine(
  companyId: string,
  userId: string,
  data: PlantMachineInput
) {
  const db = getAdminDb();
  const ref = await db.collection(MACHINES).add(buildPayload(data, companyId, userId));
  return ref.id;
}

export async function updatePlantMachine(
  machineId: string,
  companyId: string,
  userId: string,
  data: PlantMachineInput
) {
  const db = getAdminDb();
  const ref = db.collection(MACHINES).doc(machineId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.company_id !== companyId) {
    throw new Error('Machine not found');
  }
  const payload = buildPayload(data, companyId, userId);
  delete (payload as { created_at?: unknown }).created_at;
  delete (payload as { created_by?: unknown }).created_by;
  await ref.update({ ...payload, updated_at: FieldValue.serverTimestamp() });
}

export async function archivePlantMachine(machineId: string, companyId: string) {
  const db = getAdminDb();
  const ref = db.collection(MACHINES).doc(machineId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.company_id !== companyId) {
    throw new Error('Machine not found');
  }
  await ref.update({ is_active: false, updated_at: FieldValue.serverTimestamp() });
}
