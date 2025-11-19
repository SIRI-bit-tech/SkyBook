import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
config({ path: resolve(process.cwd(), envFile) });

import { connectToDatabase } from '../lib/mongodb';
import { AirlineModel } from '../models/Airline';
import { AirportModel } from '../models/Airport';

/**
 * Production-Ready Database Seeding Script
 * 
 * PURPOSE: Populates database with essential airline and airport data
 * 
 * FEATURES:
 * - Real airline data with official websites
 * - Comprehensive airport coverage
 * - Environment-aware (dev/production)
 * - Idempotent (safe to run multiple times)
 * - Proper error handling and logging
 * 
 * USAGE: 
 * - Development: npm run seed
 * - Production: NODE_ENV=production npm run seed
 */

interface AirlineData {
  name: string;
  code: string;
  country: string;
  logo: string;
  website: string;
  description: string;
  fleetSize: number;
  popularRoutes: string[];
  isFeatured: boolean;
}

async function seedDatabase() {
  const startTime = Date.now();

  try {
    console.log(`🌱 Starting database seeding [${process.env.NODE_ENV || 'development'}]...\n`);

    await connectToDatabase();
    console.log('✅ Database connected\n');

    // Production-ready airline data with real information
    console.log('✈️  Seeding airlines...');
    const airlines: AirlineData[] = [
      {
        name: 'Delta Air Lines',
        code: 'DL',
        country: 'United States',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Delta_logo.svg',
        website: 'https://www.delta.com',
        description: 'Delta Air Lines is a major American airline, with its headquarters and largest hub at Hartsfield-Jackson Atlanta International Airport.',
        fleetSize: 900,
        popularRoutes: ['JFK-LAX', 'ATL-LAX', 'JFK-LHR'],
        isFeatured: true,
      },
      {
        name: 'United Airlines',
        code: 'UA',
        country: 'United States',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/United_Airlines_Logo.svg',
        website: 'https://www.united.com',
        description: 'United Airlines is a major American airline headquartered in Chicago, Illinois.',
        fleetSize: 800,
        popularRoutes: ['ORD-LAX', 'SFO-JFK', 'ORD-LHR'],
        isFeatured: true,
      },
      {
        name: 'American Airlines',
        code: 'AA',
        country: 'United States',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/American_Airlines_logo_2013.svg',
        website: 'https://www.aa.com',
        description: 'American Airlines is a major US airline headquartered in Fort Worth, Texas.',
        fleetSize: 850,
        popularRoutes: ['DFW-LAX', 'JFK-LAX', 'DFW-LHR'],
        isFeatured: true,
      },
      {
        name: 'British Airways',
        code: 'BA',
        country: 'United Kingdom',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/British_Airways_Logo.svg',
        website: 'https://www.britishairways.com',
        description: 'British Airways is the flag carrier airline of the United Kingdom, headquartered in London.',
        fleetSize: 250,
        popularRoutes: ['LHR-JFK', 'LHR-DXB', 'LHR-SIN'],
        isFeatured: true,
      },
      {
        name: 'Emirates',
        code: 'EK',
        country: 'United Arab Emirates',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg',
        website: 'https://www.emirates.com',
        description: 'Emirates is the largest airline in the Middle East, operating from its hub at Dubai International Airport.',
        fleetSize: 270,
        popularRoutes: ['DXB-LHR', 'DXB-JFK', 'DXB-SYD'],
        isFeatured: true,
      },
      {
        name: 'Qatar Airways',
        code: 'QR',
        country: 'Qatar',
        logo: 'https://upload.wikimedia.org/wikipedia/en/e/e0/Qatar_Airways_Logo.svg',
        website: 'https://www.qatarairways.com',
        description: 'Qatar Airways is the state-owned flag carrier of Qatar, based at Hamad International Airport in Doha.',
        fleetSize: 200,
        popularRoutes: ['DOH-LHR', 'DOH-JFK', 'DOH-SIN'],
        isFeatured: true,
      },
      {
        name: 'Singapore Airlines',
        code: 'SQ',
        country: 'Singapore',
        logo: 'https://upload.wikimedia.org/wikipedia/en/6/6b/Singapore_Airlines_Logo.svg',
        website: 'https://www.singaporeair.com',
        description: 'Singapore Airlines is the flag carrier airline of Singapore, with its hub at Singapore Changi Airport.',
        fleetSize: 150,
        popularRoutes: ['SIN-LHR', 'SIN-JFK', 'SIN-SYD'],
        isFeatured: true,
      },
      {
        name: 'Lufthansa',
        code: 'LH',
        country: 'Germany',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lufthansa_Logo_2018.svg',
        website: 'https://www.lufthansa.com',
        description: 'Lufthansa is the largest German airline and the flag carrier of Germany.',
        fleetSize: 300,
        popularRoutes: ['FRA-JFK', 'MUC-LHR', 'FRA-DXB'],
        isFeatured: false,
      },
      {
        name: 'Air France',
        code: 'AF',
        country: 'France',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Air_France_Logo.svg',
        website: 'https://www.airfrance.com',
        description: 'Air France is the flag carrier of France headquartered in Paris.',
        fleetSize: 220,
        popularRoutes: ['CDG-JFK', 'CDG-DXB', 'CDG-NRT'],
        isFeatured: false,
      },
      {
        name: 'Cathay Pacific',
        code: 'CX',
        country: 'Hong Kong',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Cathay_Pacific_logo.svg',
        website: 'https://www.cathaypacific.com',
        description: 'Cathay Pacific is the flag carrier of Hong Kong, with its head office and main hub at Hong Kong International Airport.',
        fleetSize: 200,
        popularRoutes: ['HKG-JFK', 'HKG-LHR', 'HKG-SYD'],
        isFeatured: false,
      },
    ];

    let airlinesCreated = 0;
    let airlinesUpdated = 0;

    for (const airline of airlines) {
      const result = await AirlineModel.updateOne(
        { code: airline.code },
        {
          $set: {
            ...airline,
            isActive: true,
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) airlinesCreated++;
      else if (result.modifiedCount > 0) airlinesUpdated++;
    }

    console.log(`✅ Airlines: ${airlinesCreated} created, ${airlinesUpdated} updated`);

    // Production-ready airport data - Major international airports
    console.log('\n🛫 Seeding airports...');
    const airports = [
      // United States
      { name: 'John F. Kennedy International Airport', code: 'JFK', city: 'New York', country: 'United States', timezone: 'America/New_York' },
      { name: 'Los Angeles International Airport', code: 'LAX', city: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles' },
      { name: 'Chicago O\'Hare International Airport', code: 'ORD', city: 'Chicago', country: 'United States', timezone: 'America/Chicago' },
      { name: 'Dallas/Fort Worth International Airport', code: 'DFW', city: 'Dallas', country: 'United States', timezone: 'America/Chicago' },
      { name: 'San Francisco International Airport', code: 'SFO', city: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles' },
      { name: 'Miami International Airport', code: 'MIA', city: 'Miami', country: 'United States', timezone: 'America/New_York' },
      { name: 'Seattle-Tacoma International Airport', code: 'SEA', city: 'Seattle', country: 'United States', timezone: 'America/Los_Angeles' },
      { name: 'Hartsfield-Jackson Atlanta International Airport', code: 'ATL', city: 'Atlanta', country: 'United States', timezone: 'America/New_York' },

      // Europe
      { name: 'London Heathrow Airport', code: 'LHR', city: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
      { name: 'Paris Charles de Gaulle Airport', code: 'CDG', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
      { name: 'Frankfurt Airport', code: 'FRA', city: 'Frankfurt', country: 'Germany', timezone: 'Europe/Berlin' },
      { name: 'Amsterdam Airport Schiphol', code: 'AMS', city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam' },
      { name: 'Munich Airport', code: 'MUC', city: 'Munich', country: 'Germany', timezone: 'Europe/Berlin' },
      { name: 'Rome Fiumicino Airport', code: 'FCO', city: 'Rome', country: 'Italy', timezone: 'Europe/Rome' },
      { name: 'Madrid-Barajas Airport', code: 'MAD', city: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid' },

      // Asia
      { name: 'Tokyo Narita International Airport', code: 'NRT', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
      { name: 'Tokyo Haneda Airport', code: 'HND', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
      { name: 'Singapore Changi Airport', code: 'SIN', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
      { name: 'Hong Kong International Airport', code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
      { name: 'Beijing Capital International Airport', code: 'PEK', city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai' },
      { name: 'Shanghai Pudong International Airport', code: 'PVG', city: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai' },
      { name: 'Seoul Incheon International Airport', code: 'ICN', city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul' },
      { name: 'Bangkok Suvarnabhumi Airport', code: 'BKK', city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok' },

      // Middle East
      { name: 'Dubai International Airport', code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai' },
      { name: 'Hamad International Airport', code: 'DOH', city: 'Doha', country: 'Qatar', timezone: 'Asia/Qatar' },
      { name: 'Abu Dhabi International Airport', code: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', timezone: 'Asia/Dubai' },

      // Oceania
      { name: 'Sydney Kingsford Smith Airport', code: 'SYD', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
      { name: 'Melbourne Airport', code: 'MEL', city: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne' },
      { name: 'Auckland Airport', code: 'AKL', city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland' },
    ];

    let airportsCreated = 0;
    let airportsUpdated = 0;

    for (const airport of airports) {
      const result = await AirportModel.updateOne(
        { code: airport.code },
        { $set: airport },
        { upsert: true }
      );

      if (result.upsertedCount > 0) airportsCreated++;
      else if (result.modifiedCount > 0) airportsUpdated++;
    }

    console.log(`✅ Airports: ${airportsCreated} created, ${airportsUpdated} updated`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Database seeding completed successfully in ${duration}s!`);
    console.log(`\n📊 Summary:`);
    console.log(`   Airlines: ${airlines.length} total`);
    console.log(`   Airports: ${airports.length} total`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n💡 Next steps:`);
      console.log(`   - Run: npm run dev`);
      console.log(`   - Visit: http://localhost:3000`);
      console.log(`   - Flight data will be fetched from Amadeus API or created via admin panel\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    console.error('\nPlease check:');
    console.error('  - MongoDB connection string is correct');
    console.error('  - Database is accessible');
    console.error('  - Network connectivity\n');
    process.exit(1);
  }
}

seedDatabase();

