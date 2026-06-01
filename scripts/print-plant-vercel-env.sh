#!/usr/bin/env bash
# Prints Plant Stripe env vars for Vercel (from .env.local or .env.local.example).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"
EXAMPLE="$ROOT/.env.local.example"

pick() {
  local key="$1"
  if [[ -f "$ENV_FILE" ]] && grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    grep "^${key}=" "$ENV_FILE" | head -1
  elif [[ -f "$EXAMPLE" ]] && grep -q "^${key}=" "$EXAMPLE" 2>/dev/null; then
    grep "^${key}=" "$EXAMPLE" | head -1
  fi
}

echo "Add these in Vercel → Project → Settings → Environment Variables → Production:"
echo ""
pick STRIPE_PRICE_PLANT_PER_MACHINE || echo "STRIPE_PRICE_PLANT_PER_MACHINE=(missing — set in .env.local)"
pick STRIPE_PRICE_PLANT_PER_MACHINE_YEARLY || echo "STRIPE_PRICE_PLANT_PER_MACHINE_YEARLY=(missing — set in .env.local)"
echo ""
echo "Then Redeploy. Use LIVE price IDs if STRIPE_SECRET_KEY on Vercel is sk_live_."
