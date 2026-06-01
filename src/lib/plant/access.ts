/**
 * Whether an organisation may use Plant & Machinery (no separate Stripe add-on).
 * Legacy customers are included at no extra charge.
 */
export type CompanyPlantAccessFields = {
  legacy?: boolean;
  has_plant_module?: boolean;
  plant_module_status?: string | null;
  plant_module_past_due_since?: string | { toDate?: () => Date } | null;
};

const PAST_DUE_GRACE_DAYS = 7;

function plantSubscriptionUsable(company: CompanyPlantAccessFields): boolean {
  if (!company.has_plant_module) return false;
  const status = company.plant_module_status;
  if (!status || status === 'active') return true;
  if (status === 'past_due') {
    const since = company.plant_module_past_due_since;
    if (!since) return true;
    const started =
      typeof since === 'string'
        ? new Date(since)
        : typeof since === 'object' && since?.toDate
          ? since.toDate()
          : null;
    if (!started || Number.isNaN(started.getTime())) return true;
    const days = (Date.now() - started.getTime()) / (1000 * 60 * 60 * 24);
    return days < PAST_DUE_GRACE_DAYS;
  }
  return false;
}

export function companyHasPlantModuleAccess(
  company: CompanyPlantAccessFields | null | undefined
): boolean {
  if (!company) return false;
  if (company.legacy === true) return true;
  return plantSubscriptionUsable(company);
}
