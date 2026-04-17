// Purpose: MongoDB Atlas connection with retry logic — falls back to in-memory server in dev
'use strict';

const mongoose = require('mongoose');
const { getEnv } = require('./env');

let isConnected = false;

/**
 * connectDB — Connect to MongoDB with exponential backoff retry.
 * In development without a real URI, falls back to mongodb-memory-server.
 *
 * @param {number} [retries=5] Maximum number of retry attempts
 * @returns {Promise<void>}
 */
async function connectDB(retries = 5) {
  if (isConnected) return;

  let uri = process.env.MONGODB_URI;
  const isDev = process.env.NODE_ENV !== 'production';

  // Dev fallback: use in-memory MongoDB if no real URI provided
  if (isDev && (!uri || uri.startsWith('your_') || uri.includes('placeholder'))) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log('[DB] 🧠 Using in-memory MongoDB (dev mode)');
    } catch (err) {
      console.error('[DB] Failed to start in-memory server:', err.message);
      process.exit(1);
    }
  }

  if (!uri) {
    console.error('[DB] MONGODB_URI is required in production');
    process.exit(1);
  }

  let attempt = 0;
  let delay = 1000;

  while (attempt < retries) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS:          30000,
      });
      isConnected = true;
      console.log(`[DB] ✅ MongoDB connected (attempt ${attempt + 1})`);
      return;
    } catch (err) {
      attempt++;
      console.error(`[DB] ❌ Connection failed (attempt ${attempt}/${retries}): ${err.message}`);
      if (attempt >= retries) {
        console.error('[DB] Exhausted all retries. Exiting.');
        process.exit(1);
      }
      console.log(`[DB] Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 2, 15000); // exponential backoff, max 15s
    }
  }
}

/**
 * disconnectDB — Graceful shutdown (used in tests and process signals).
 */
async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[DB] Disconnected from MongoDB');
  }
}

module.exports = { connectDB, disconnectDB };
