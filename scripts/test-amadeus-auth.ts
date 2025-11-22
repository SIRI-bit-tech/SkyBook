import axios from 'axios';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function testAmadeusAuth() {
  console.log('🔐 Testing Amadeus API Authentication...\n');
  
  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;
  const baseUrl = process.env.AMADEUS_API_BASE_URL || 'https://test.api.amadeus.com';

  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '❌ NOT SET');
  console.log('API Secret:', apiSecret ? `${apiSecret.substring(0, 5)}...` : '❌ NOT SET');
  console.log('Base URL:', baseUrl);
  console.log('');

  if (!apiKey || !apiSecret) {
    console.error('❌ Amadeus credentials not found in .env.local');
    process.exit(1);
  }

  try {
    console.log('Attempting authentication...');
    const response = await axios.post(
      `${baseUrl}/v1/security/oauth2/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: apiSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('✅ Authentication successful!');
    console.log('Access Token:', response.data.access_token.substring(0, 20) + '...');
    console.log('Expires in:', response.data.expires_in, 'seconds');
    console.log('');

    // Test airport search
    console.log('Testing airport search for "New York"...');
    const airportResponse = await axios.get(
      `${baseUrl}/v1/reference-data/locations`,
      {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
        params: {
          keyword: 'New York',
          subType: 'AIRPORT,CITY',
        },
      }
    );

    console.log('✅ Airport search successful!');
    console.log('Found', airportResponse.data.data.length, 'results');
    airportResponse.data.data.slice(0, 3).forEach((airport: any) => {
      console.log(`  - ${airport.name} (${airport.iataCode})`);
    });

  } catch (error: any) {
    console.error('❌ Amadeus API Error:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.error_description || error.message);
    console.error('Details:', JSON.stringify(error.response?.data, null, 2));
    process.exit(1);
  }
}

testAmadeusAuth();
