/**
 * Plant & Machinery Module — DEV MODE flag
 *
 * PLANT_MODULE_DEV_MODE=true  → module is accessible without a paid Stripe subscription.
 *                               Use this during development and QA.
 * PLANT_MODULE_DEV_MODE=false → module requires an active plant_module Stripe subscription
 *                               (Phase 2 billing — production).
 */
export const PLANT_MODULE_DEV_MODE =
  process.env.NEXT_PUBLIC_PLANT_MODULE_DEV_MODE === 'true';
