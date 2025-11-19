#!/usr/bin/env node

/**
 * Generate a secure random secret for BETTER_AUTH_SECRET
 * 
 * Usage: node scripts/generate-secret.js
 */

const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

const secret = generateSecret();

console.log('\n🔐 Generated Secure Secret for BETTER_AUTH_SECRET:\n');
console.log(secret);
console.log('\n📋 Add this to your .env.local file:');
console.log(`BETTER_AUTH_SECRET=${secret}`);
console.log('\n⚠️  Keep this secret secure and never commit it to version control!\n');
