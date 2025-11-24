/**
 * Cleanup Flight Storage
 * 
 * This script removes the flight_offers table from your PostgreSQL database
 * Run with: node scripts/cleanup-flight-storage.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupFlightStorage() {
  try {
    console.log('🧹 Cleaning up flight storage...\n');

    // Check if table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'flight_offers'
    `;

    if (tableCheck.length === 0) {
      console.log('✅ flight_offers table does not exist - nothing to clean up');
      return;
    }

    console.log('📝 Dropping indexes...');
    
    // Drop indexes
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "flight_offers_offerId_key"`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "flight_offers_offerId_idx"`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "flight_offers_expiresAt_idx"`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "flight_offers_departureCode_arrivalCode_idx"`);

    console.log('📝 Dropping flight_offers table...');
    
    // Drop table
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "flight_offers"`);

    console.log('✅ Flight storage cleanup complete!\n');

    // Verify the table is gone
    const verifyCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'flight_offers'
    `;

    if (verifyCheck.length === 0) {
      console.log('✅ Verified: flight_offers table has been removed');
      console.log('\n📝 Next steps:');
      console.log('   1. Run: npx prisma generate');
      console.log('   2. Restart your dev server');
    } else {
      console.log('⚠️  Warning: Table still exists after cleanup');
    }

  } catch (error) {
    console.error('❌ Error cleaning up flight storage:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your DATABASE_URL in .env');
    console.error('2. Ensure PostgreSQL is running');
    console.error('3. Verify database permissions');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupFlightStorage();
