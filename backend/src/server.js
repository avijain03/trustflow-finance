// Purpose: Server entry point — connects DB, then starts HTTP listener
'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const { validateEnv } = require('./config/env');
const { connectDB } = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    validateEnv();
    await connectDB();

    // Seed dev data automatically
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { seedCustomers } = require('./scripts/seedCustomers');
        await seedCustomers({ silent: true });
      } catch (e) {
        console.warn('[SEED] Seed skipped:', e.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 TrustFlow Finance API v2.0 running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/v1/health`);
      console.log(`   Mode:   ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('[STARTUP] Fatal error:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[SHUTDOWN] SIGTERM received — shutting down gracefully');
  const { disconnectDB } = require('./config/db');
  await disconnectDB();
  process.exit(0);
});

start();
