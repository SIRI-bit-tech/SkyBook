import { connectToDatabase } from '../lib/mongodb';
import { AirlineModel } from '../models/Airline';
import { AirportModel } from '../models/Airport';
import { FlightModel } from '../models/Flight';
import { MAJOR_AIRLINES } from '../config/constants';

async function seedDatabase() {
  try {
    await connectToDatabase();

    console.log('Seeding airlines...');
    const airlineData = [
      ...MAJOR_AIRLINES,
      { name: 'Qatar Airways', code: 'QR', country: 'Qatar', logo: 'https://upload.wikimedia.org/wikipedia/en/e/e0/Qatar_Airways_Logo.svg' },
      { name: 'Singapore Airlines', code: 'SQ', country: 'Singapore', logo: 'https://upload.wikimedia.org/wikipedia/en/6/6b/Singapore_Airlines_Logo.svg' },
    ];

    for (const airline of airlineData) {
      await AirlineModel.updateOne(
        { code: airline.code },
        {
          ...airline,
          description: `Official ${airline.name} booking`,
          website: 'https://example.com',
          popularRoutes: [],
          fleetSize: Math.floor(Math.random() * 500) + 100,
          isActive: true,
          isFeatured: ['DL', 'UA', 'EK', 'BA'].includes(airline.code),
        },
        { upsert: true }
      );
    }

    console.log('Seeding airports...');
    const airports = [
      { name: 'John F. Kennedy International Airport', code: 'JFK', city: 'New York', country: 'United States', timezone: 'America/New_York' },
      { name: 'Los Angeles International Airport', code: 'LAX', city: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles' },
      { name: 'Chicago O\'Hare International Airport', code: 'ORD', city: 'Chicago', country: 'United States', timezone: 'America/Chicago' },
      { name: 'London Heathrow Airport', code: 'LHR', city: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
      { name: 'Paris Charles de Gaulle Airport', code: 'CDG', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
      { name: 'Tokyo Narita International Airport', code: 'NRT', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
      { name: 'Dubai International Airport', code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai' },
    ];

    for (const airport of airports) {
      await AirportModel.updateOne({ code: airport.code }, airport, { upsert: true });
    }

    console.log('Seeding sample flights...');
    // This will be done separately with real flight data

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

seedDatabase();
