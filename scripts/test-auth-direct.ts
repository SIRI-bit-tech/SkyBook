import { config } from 'dotenv';
import { resolve } from 'path';
import axios from 'axios';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

async function testDirectAuth() {
  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;
  const baseUrl = process.env.AMADEUS_API_BASE_URL || 'https://test.api.amadeus.com';

  console.log('🔍 Direct Authentication Test\n');
  console.log('Configuration:');
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  API Key: ${apiKey}`);
  console.log(`  API Secret: ${apiSecret}\n`);

  try {
    const authUrl = `${baseUrl}/v1/security/oauth2/token`;
    console.log(`📡 Making request to: ${authUrl}\n`);

    const response = await axios.post(
      authUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: apiKey!,
        client_secret: apiSecret!,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('✅ Authentication successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('❌ Authentication failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', JSON.stringify(error.response?.data, null, 2));
    console.error('\n📝 Please verify:');
    console.error('1. You copied the FULL API Key and Secret from Amadeus portal');
    console.error('2. You are using TEST credentials (not production)');
    console.error('3. The app is active in your Amadeus Self-Service Workspace');
    console.error('4. There are no extra spaces or line breaks in your .env.local file');
  }
}

testDirectAuth();
