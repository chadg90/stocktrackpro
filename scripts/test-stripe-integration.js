#!/usr/bin/env node

/**
 * Quick Stripe Integration Test Script
 * 
 * This script helps verify your Stripe integration setup.
 * Run: node scripts/test-stripe-integration.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Stripe Integration Setup...\n');

// Check .env.local file
const envPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      envVars[key.trim()] = value.trim();
    }
  });
} else {
  console.log('⚠️  .env.local file not found\n');
}

// Required environment variables
const requiredVars = {
  'STRIPE_SECRET_KEY': 'Stripe Secret Key',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': 'Stripe Publishable Key',
  'STRIPE_WEBHOOK_SECRET': 'Stripe Webhook Secret',
  'STRIPE_PRICE_STARTER': 'Starter Price ID',
  'STRIPE_PRICE_TEAM': 'Team Price ID',
  'STRIPE_PRICE_BUSINESS': 'Business Price ID',
  'STRIPE_PRICE_ENTERPRISE': 'Enterprise Price ID',
  'NEXT_PUBLIC_APP_URL': 'App URL',
  'FIREBASE_SERVICE_ACCOUNT_JSON': 'Firebase Service Account JSON',
};

console.log('📋 Environment Variables Check:\n');

let allPresent = true;
for (const [key, description] of Object.entries(requiredVars)) {
  const value = envVars[key];
  if (value && value.length > 0) {
    // Mask sensitive values
    let displayValue = value;
    if (key.includes('SECRET') || key.includes('KEY')) {
      displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 4);
    } else if (key === 'FIREBASE_SERVICE_ACCOUNT_JSON') {
      try {
        const json = JSON.parse(value);
        displayValue = `{project_id: ${json.project_id}, ...}`;
      } catch {
        displayValue = '[JSON string]';
      }
    } else {
      displayValue = value;
    }
    
    // Check if test or live
    const isTest = key.includes('STRIPE') && (
      value.includes('test') || value.includes('sk_test') || value.includes('pk_test') || value.includes('whsec_test')
    );
    const mode = isTest ? '🧪 TEST' : '🚀 LIVE';
    
    console.log(`✅ ${key}: ${mode}`);
    console.log(`   ${description}: ${displayValue}\n`);
  } else {
    console.log(`❌ ${key}: MISSING`);
    console.log(`   ${description}: Not set\n`);
    allPresent = false;
  }
}

// Check Stripe mode
const secretKey = envVars['STRIPE_SECRET_KEY'] || '';
const isTestMode = secretKey.includes('sk_test_');
const isLiveMode = secretKey.includes('sk_live_');

if (isTestMode) {
  console.log('🧪 Mode: TEST MODE (recommended for testing)\n');
} else if (isLiveMode) {
  console.log('🚀 Mode: LIVE MODE (production)\n');
} else {
  console.log('⚠️  Mode: Unknown (check STRIPE_SECRET_KEY)\n');
}

// Check price IDs format
console.log('📦 Price IDs Format Check:\n');
const priceIds = {
  'STRIPE_PRICE_STARTER': envVars['STRIPE_PRICE_STARTER'],
  'STRIPE_PRICE_TEAM': envVars['STRIPE_PRICE_TEAM'],
  'STRIPE_PRICE_BUSINESS': envVars['STRIPE_PRICE_BUSINESS'],
  'STRIPE_PRICE_ENTERPRISE': envVars['STRIPE_PRICE_ENTERPRISE'],
};

for (const [key, value] of Object.entries(priceIds)) {
  if (value) {
    const isValid = value.startsWith('price_');
    if (isValid) {
      console.log(`✅ ${key}: Valid format (${value})`);
    } else {
      console.log(`⚠️  ${key}: Invalid format (should start with "price_")`);
      console.log(`   Current: ${value}`);
    }
  }
}

console.log('\n');

// Check webhook secret format
const webhookSecret = envVars['STRIPE_WEBHOOK_SECRET'];
if (webhookSecret) {
  const isValid = webhookSecret.startsWith('whsec_');
  if (isValid) {
    console.log('✅ Webhook Secret: Valid format');
  } else {
    console.log('⚠️  Webhook Secret: Invalid format (should start with "whsec_")');
  }
}

console.log('\n');

// Summary
if (allPresent) {
  console.log('✅ All required environment variables are set!\n');
  console.log('📝 Next Steps:');
  console.log('   1. Verify Stripe Dashboard → Products → Prices match your Price IDs');
  console.log('   2. Set up webhook endpoint in Stripe Dashboard');
  console.log('   3. Test checkout flow on /pricing page');
  console.log('   4. Check Firebase company documents update after checkout');
  console.log('   5. Review testing guide: docs/STRIPE_TESTING_GUIDE.md\n');
} else {
  console.log('❌ Some environment variables are missing!\n');
  console.log('📝 Please set all required variables in .env.local\n');
}
