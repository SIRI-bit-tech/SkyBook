import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * MINIMAL SEED DATA - API-DRIVEN APPROACH
 * 
 * This seed file creates ONLY essential data for testing:
 * - Test user accounts
 * - No flights, airlines, or airports (comes from Duffel API)
 * 
 * WHY THIS APPROACH?
 * ==================
 * Your app now uses REAL DATA from Duffel API for:
 * ✅ Flight searches (real-time availability)
 * ✅ Airport lookups (live airport data)
 * ✅ Airline information (from flight results)
 * 
 * Your database stores ONLY:
 * ✅ User accounts (authentication)
 * ✅ User bookings (when someone books a flight)
 * ✅ Payment records (Stripe transactions)
 * ✅ Booking history (past trips)
 * 
 * BENEFITS:
 * =========
 * ✅ Always up-to-date flight data
 * ✅ Real-time pricing
 * ✅ Actual flight availability
 * ✅ No stale data in database
 * ✅ Smaller database size
 * ✅ No manual data updates needed
 */

async function main() {
  console.log('🌱 Starting minimal database seed...');
  console.log('📝 Creating test users only (flights come from Duffel API)\n');

  // ============================================
  // TEST USERS - For development and testing
  // ============================================
  console.log('Creating test users...');

  // Hash password for test accounts
  const testPassword = 'password123';
  const hashedPassword = await bcrypt.hash(testPassword, 12);

  // Regular test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@skybook.com' },
    update: {},
    create: {
      email: 'test@skybook.com',
      name: 'Test User',
      emailVerified: true,
      role: 'user',
      password: hashedPassword,
    },
  });

  // Admin test user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@skybook.com' },
    update: {},
    create: {
      email: 'admin@skybook.com',
      name: 'Admin User',
      emailVerified: true,
      role: 'admin',
      password: hashedPassword,
    },
  });

  console.log('✅ Created test users:');
  console.log(`   - Regular user: ${testUser.email}`);
  console.log(`   - Admin user: ${adminUser.email}\n`);

  console.log('🎉 Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📌 IMPORTANT: Your app now uses REAL DATA from Duffel API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✈️  Flights:  Fetched from Duffel API (real-time)');
  console.log('🏢 Airports: Fetched from Duffel API (live data)');
  console.log('🛫 Airlines: Extracted from flight search results');
  console.log('💾 Database: Stores only user bookings & accounts');
  console.log('');
  console.log('🔑 Test Credentials:');
  console.log('   User:  test@skybook.com / password123');
  console.log('   Admin: admin@skybook.com / password123');
  console.log('');
  console.log('⚙️  Make sure your .env.local has:');
  console.log('   - DUFFEL_API_TOKEN');
  console.log('   - DATABASE_URL');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
