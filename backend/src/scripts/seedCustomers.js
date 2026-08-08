// Purpose: Seed script — idempotent seeding of 10 TrustFlow Finance test customers
'use strict';

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });
dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const Customer     = require('../models/Customer.model');
const { hashPII }  = require('../utils/hashPII');

/* ─── Customer Profiles (cover all underwriting rule branches) ──────────── */
const CUSTOMERS = [
  // APPROVE cases
  { name: 'Aarav Sharma',   phone: '9876543201', pan: 'ABCPS1234A', aadhaar: '123456789001', employmentType: 'SALARIED',     monthlyIncome: 75000, existingEMI: 10000, creditScore: 780, expectedDecision: 'APPROVE'        },
  { name: 'Priya Nair',     phone: '9876543202', pan: 'ABCPN5678B', aadhaar: '123456789002', employmentType: 'SALARIED',     monthlyIncome: 55000, existingEMI: 8000,  creditScore: 760, expectedDecision: 'APPROVE'        },
  { name: 'Deepak Joshi',   phone: '9876543209', pan: 'ABCPD9012I', aadhaar: '123456789009', employmentType: 'SALARIED',     monthlyIncome: 45000, existingEMI: 3000,  creditScore: 755, expectedDecision: 'APPROVE'        },
  { name: 'Anjali Mehta',   phone: '9876543210', pan: 'ABCPA3456J', aadhaar: '123456789010', employmentType: 'CONTRACT',     monthlyIncome: 50000, existingEMI: 2000,  creditScore: 770, expectedDecision: 'APPROVE'        },

  // REJECT — R001 (Credit Score < 700)
  { name: 'Rohit Verma',    phone: '9876543203', pan: 'ABCPR7890C', aadhaar: '123456789003', employmentType: 'SALARIED',     monthlyIncome: 40000, existingEMI: 5000,  creditScore: 680, expectedDecision: 'REJECT(R001)'   },
  { name: 'Sunita Patel',   phone: '9876543204', pan: 'ABCPS2345D', aadhaar: '123456789004', employmentType: 'SELF_EMPLOYED', monthlyIncome: 35000, existingEMI: 4000,  creditScore: 650, expectedDecision: 'REJECT(R001)'   },

  // REJECT — R002 (Income < ₹15,000)
  { name: 'Vikram Iyer',    phone: '9876543205', pan: 'ABCPV6789E', aadhaar: '123456789005', employmentType: 'SALARIED',     monthlyIncome: 12000, existingEMI: 0,     creditScore: 740, expectedDecision: 'REJECT(R002)'   },

  // REJECT — R003 (EMI > 50% of salary)
  { name: 'Meena Gupta',    phone: '9876543206', pan: 'ABCPM1234F', aadhaar: '123456789006', employmentType: 'CONTRACT',     monthlyIncome: 30000, existingEMI: 16000, creditScore: 720, expectedDecision: 'REJECT(R003)'   },

  // MANUAL_REVIEW
  { name: 'Arjun Reddy',    phone: '9876543207', pan: 'ABCPA5678G', aadhaar: '123456789007', employmentType: 'SALARIED',     monthlyIncome: 60000, existingEMI: 22000, creditScore: 725, expectedDecision: 'MANUAL_REVIEW(R005)' },
  { name: 'Kavita Singh',   phone: '9876543208', pan: 'ABCPK9012H', aadhaar: '123456789008', employmentType: 'SELF_EMPLOYED', monthlyIncome: 80000, existingEMI: 5000,  creditScore: 710, expectedDecision: 'MANUAL_REVIEW'   },
];

/**
 * seedCustomers — Drop and recreate the Customer collection with 10 test profiles.
 * Each customer's PAN and Aadhaar are hashed with argon2id before insertion.
 *
 * @param {{ silent?: boolean }} [opts]
 */
async function seedCustomers(opts = {}) {
  const log = opts.silent ? () => {} : console.log;

  log('\n[SEED] 🌱 Seeding TrustFlow Finance customers...');

  // Drop existing data (idempotent)
  await Customer.deleteMany({});
  log('[SEED] Cleared existing customers');

  for (const c of CUSTOMERS) {
    const panHash     = await hashPII(c.pan);
    const aadhaarHash = await hashPII(c.aadhaar);

    await Customer.create({
      name:           c.name,
      phone:          c.phone,
      panHash,
      aadhaarHash,
      employmentType: c.employmentType,
      monthlyIncome:  c.monthlyIncome,
      existingEMI:    c.existingEMI,
      creditScore:    c.creditScore,
      kycStatus:      'INCOMPLETE',
    });

    log(`[SEED] ✅ ${c.name.padEnd(20)} | ${c.employmentType.padEnd(12)} | Income: ₹${c.monthlyIncome.toLocaleString('en-IN')} | Expected: ${c.expectedDecision}`);
  }

  log(`\n[SEED] 🎉 Seeded ${CUSTOMERS.length} customers successfully\n`);
}

/* ─── Run directly: node src/scripts/seedCustomers.js ───────────────────── */
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedCustomers();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[SEED] ❌ Error:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = { seedCustomers };
