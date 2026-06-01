import type Stripe from 'stripe';
import type { Firestore } from 'firebase-admin/firestore';

export const PLANT_STRIPE_PRODUCT_METADATA = 'plant';

export function isPlantStripeMetadata(
  metadata: Stripe.Metadata | null | undefined
): boolean {
  return metadata?.product === PLANT_STRIPE_PRODUCT_METADATA;
}

export function plantModuleStatusFromStripe(
  status: Stripe.Subscription.Status
): 'active' | 'past_due' | 'cancelled' {
  if (status === 'active' || status === 'trialing') return 'active';
  if (status === 'past_due' || status === 'unpaid') return 'past_due';
  return 'cancelled';
}

export function machineCountFromSubscription(
  subscription: Stripe.Subscription,
  metadataCount?: string | null
): number | null {
  const qty = subscription.items?.data?.[0]?.quantity;
  if (typeof qty === 'number' && qty > 0) return qty;
  if (metadataCount) {
    const parsed = parseInt(metadataCount, 10);
    if (parsed > 0) return parsed;
  }
  return null;
}

export async function revokePlantModuleUserAccess(
  db: Firestore,
  companyId: string
): Promise<void> {
  const snap = await db.collection('profiles').where('company_id', '==', companyId).get();
  if (snap.empty) return;
  const batch = db.batch();
  const now = new Date().toISOString();
  snap.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      can_access_plant_module: false,
      updated_at: now,
    });
  });
  await batch.commit();
}

export async function applyPlantSubscriptionToCompany(
  db: Firestore,
  companyId: string,
  subscription: Stripe.Subscription,
  machineCount: number | null
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  const moduleStatus = plantModuleStatusFromStripe(subscription.status);
  const patch: Record<string, unknown> = {
    has_plant_module: moduleStatus !== 'cancelled',
    plant_module_plan: 'per_machine',
    plant_module_stripe_subscription_id: subscription.id,
    plant_module_status: moduleStatus,
    updated_at: new Date().toISOString(),
  };

  if (machineCount != null) {
    patch.plant_module_machine_count = machineCount;
  }
  if (customerId) {
    patch.stripe_customer_id = customerId;
  }
  if (moduleStatus === 'active') {
    patch.plant_module_past_due_since = null;
  }

  await db.collection('companies').doc(companyId).set(patch, { merge: true });
}

export async function applyPlantCheckoutCompleted(
  db: Firestore,
  companyId: string,
  subscription: Stripe.Subscription,
  machineCountRaw: string | null | undefined
): Promise<void> {
  const machineCount = machineCountFromSubscription(
    subscription,
    machineCountRaw ?? subscription.metadata?.machine_count
  );
  await applyPlantSubscriptionToCompany(db, companyId, subscription, machineCount);
}

export async function applyPlantSubscriptionCancelled(
  db: Firestore,
  companyId: string
): Promise<void> {
  await db.collection('companies').doc(companyId).set(
    {
      has_plant_module: false,
      plant_module_status: 'cancelled',
      plant_module_past_due_since: null,
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
  await revokePlantModuleUserAccess(db, companyId);
}

export async function applyPlantPaymentFailed(
  db: Firestore,
  companyId: string
): Promise<void> {
  await db.collection('companies').doc(companyId).set(
    {
      plant_module_status: 'past_due',
      plant_module_past_due_since: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
}
