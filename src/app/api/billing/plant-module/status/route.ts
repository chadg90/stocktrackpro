import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyManagerCheckout } from '@/lib/checkout-request';
import { companyHasPlantModuleAccess } from '@/lib/plant/access';

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('company_id');
  if (!companyId) {
    return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
  }

  const verified = await verifyManagerCheckout(request, companyId);
  if (verified instanceof NextResponse) return verified;

  const snap = await getAdminDb().collection('companies').doc(verified.companyId).get();
  if (!snap.exists) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const data = snap.data()!;
  return NextResponse.json({
    has_access: companyHasPlantModuleAccess(data),
    has_plant_module: data.has_plant_module === true,
    plant_module_status: data.plant_module_status ?? null,
    plant_module_machine_count: data.plant_module_machine_count ?? null,
    plant_module_stripe_subscription_id: data.plant_module_stripe_subscription_id ?? null,
    legacy: data.legacy === true,
  });
}
