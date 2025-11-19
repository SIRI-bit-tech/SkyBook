import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { amadeusClient } from '../lib/amadeus-client';

async function testAmadeus() {
  console.log('🧪 Testing Amadeus API Connection...\n');
  
  // Debug: Show what credentials are being loaded
  console.log('📋 Environment Check:');
  console.log(`   API Key: ${process.env.AMADEUS_API_KEY ? process.env.AMADEUS_API_KEY.substring(0, 10) + '...' : 'NOT SET'}`);
  console.log(`   API Secret: ${process.env.AMADEUS_API_SECRET ? process.env.AMADEUS_API_SECRET.substring(0, 5) + '...' : 'NOT SET'}`);
  console.log(`   Base URL: ${process.env.AMADEUS_API_BASE_URL || 'NOT SET'}\n`);

  try {
    // Test 1: Authentication
    console.log('1️⃣  Testing Authentication...');
    const token = await amadeusClient.authenticate();
    console.log('✅ Authentication successful!');
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // Test 2: Airport Search
    console.log('2️⃣  Testing Airport Search (query: "London")...');
    const airports = await amadeusClient.getAirportData('London');
    console.log(`✅ Found ${airports.length} airports`);
    if (airports.length > 0) {
      console.log(`   Example: ${airports[0].name} (${airports[0].iataCode})\n`);
    }

    // Test 3: Flight Search
    console.log('3️⃣  Testing Flight Search (JFK → LAX)...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const departureDate = tomorrow.toISOString().split('T')[0];
    
    const flights = await amadeusClient.searchFlights(
      'JFK',
      'LAX',
      departureDate,
      1
    );
    
    console.log(`✅ Found ${flights.length} flights`);
    if (flights.length > 0) {
      const flight = flights[0];
      console.log(`   Example: ${flight.itineraries[0].segments[0].carrierCode}${flight.itineraries[0].segments[0].number}`);
      console.log(`   Price: ${flight.price.currency} ${flight.price.total}`);
      console.log(`   Duration: ${flight.itineraries[0].duration}\n`);
    }

    console.log('✅ All tests passed! Amadeus API is working correctly.\n');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('   API Error:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('\n💡 Check your AMADEUS_API_KEY and AMADEUS_API_SECRET in .env.local\n');
    process.exit(1);
  }
}

testAmadeus();
