#!/usr/bin/env node
/**
 * Helper script to extract FIREBASE_SERVICE_ACCOUNT_JSON as a single-line string
 * for pasting into Vercel environment variables
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

// Extract FIREBASE_SERVICE_ACCOUNT_JSON
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_JSON=(\{[\s\S]*?\})/);

if (!match) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_JSON not found in .env.local');
  process.exit(1);
}

// Parse and re-stringify to ensure valid JSON, then minify
try {
  const jsonObj = JSON.parse(match[1]);
  const singleLine = JSON.stringify(jsonObj);
  
  console.log('\n✅ Copy this entire line and paste it into Vercel:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(singleLine);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Steps:');
  console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('2. Add new variable: FIREBASE_SERVICE_ACCOUNT_JSON');
  console.log('3. Paste the line above as the value');
  console.log('4. Select "Production" (and "Preview" if needed)');
  console.log('5. Save and redeploy\n');
} catch (error) {
  console.error('❌ Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON:', error.message);
  process.exit(1);
}
