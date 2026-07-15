import { companyHasPlantModuleAccess, type CompanyPlantAccessFields } from './access';

export function getPlantMachineSeatLimit(company: CompanyPlantAccessFields | null | undefined): number | null {
  if (!company) return null;
  if (company.legacy === true) return null;
  if (!companyHasPlantModuleAccess(company)) return null;
  const n = Number((company as { plant_module_machine_count?: number }).plant_module_machine_count);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.floor(n);
}

export function formatPlantSeatLimitMessage(limit: number, activeCount: number): string {
  return `You have ${activeCount} of ${limit} machines on your Plant subscription. Add more seats on the Fleet Track PRO website before registering another machine.`;
}

export function assertCanAddPlantMachine(
  company: CompanyPlantAccessFields | null | undefined,
  activeMachineCount: number
): void {
  const limit = getPlantMachineSeatLimit(company);
  if (limit == null) return;
  if (activeMachineCount >= limit) {
    throw new Error(formatPlantSeatLimitMessage(limit, activeMachineCount));
  }
}
