// Database Connection Test Script
// This script tests the MongoDB connection using the MONGO_URI from .env

import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually load environment variables from .env files
function loadEnvFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        content.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim();
                    if (!process.env[key.trim()]) {
                        process.env[key.trim()] = value;
                    }
                }
            }
        });
    } catch (error) {
        // File doesn't exist, skip
    }
}

// Load .env.local first (higher priority), then .env
loadEnvFile(join(__dirname, '..', '.env.local'));
loadEnvFile(join(__dirname, '..', '.env'));

const MONGO_URI = process.env.MONGO_URI;

console.log('🔍 Testing MongoDB Connection...\n');

if (!MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI is not defined in .env or .env.local');
    console.log('\nPlease make sure you have a .env.local file with:');
    console.log('MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-booking?retryWrites=true&w=majority');
    process.exit(1);
}

console.log('📝 Connection String Found:');
console.log(`   ${MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}\n`);

async function testConnection() {
    try {
        console.log('⏳ Attempting to connect to MongoDB...');

        await mongoose.connect(MONGO_URI);

        console.log('✅ Successfully connected to MongoDB!\n');
        console.log('📊 Connection Details:');
        console.log(`   Database: ${mongoose.connection.db.databaseName}`);
        console.log(`   Host: ${mongoose.connection.host}`);
        console.log(`   Port: ${mongoose.connection.port || 'N/A (Atlas)'}`);
        console.log(`   Ready State: ${mongoose.connection.readyState} (1 = connected)\n`);

        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Collections in database:');
        if (collections.length === 0) {
            console.log('   (No collections yet - database is empty)');
        } else {
            collections.forEach(col => {
                console.log(`   - ${col.name}`);
            });
        }

        console.log('\n✨ Database connection test completed successfully!');

    } catch (error) {
        console.error('\n❌ Failed to connect to MongoDB:');
        console.error(`   Error: ${error.message}\n`);

        if (error.message.includes('authentication')) {
            console.log('💡 Tip: Check your username and password in the connection string');
        } else if (error.message.includes('network')) {
            console.log('💡 Tip: Check your internet connection and MongoDB Atlas network access settings');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('💡 Tip: Check your cluster URL in the connection string');
        }

        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Connection closed.');
    }
}

testConnection();
