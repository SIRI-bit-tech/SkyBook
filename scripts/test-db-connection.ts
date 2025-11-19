import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { connectToDatabase } from '../lib/mongodb';
import mongoose from 'mongoose';

async function testConnection() {
    try {
        console.log('Testing database connection...');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? '✓ Found' : '✗ Not found');
        console.log('URI value:', process.env.MONGODB_URI?.substring(0, 30) + '...');

        await connectToDatabase();

        console.log('✓ Successfully connected to MongoDB!');
        console.log('Database name:', mongoose.connection.db?.databaseName);
        console.log('Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');

        // List collections
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log('\nExisting collections:');
        if (collections && collections.length > 0) {
            collections.forEach(col => console.log(`  - ${col.name}`));
        } else {
            console.log('  (No collections yet - run npm run seed to create them)');
        }

        process.exit(0);
    } catch (error) {
        console.error('✗ Database connection failed:', error);
        process.exit(1);
    }
}

testConnection();
