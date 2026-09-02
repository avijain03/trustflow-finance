// Purpose: Integration tests for authentication API (/api/v1/auth/register and /api/v1/auth/login)
'use strict';

const request = require('supertest');
const app     = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User     = require('../src/models/User.model');
const Customer = require('../src/models/Customer.model');
const { seedCustomers } = require('../src/scripts/seedCustomers');

describe('Auth API Routes', () => {
  beforeAll(async () => {
    await connectDB();
    await seedCustomers({ silent: true });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name:     'Test New User',
          phone:    '9123456789',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.phone).toBe('9123456789');
    });

    it('returns 409 DUPLICATE_PHONE when registering an existing phone', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name:     'Duplicate User',
          phone:    '9876543201', // already seeded
          password: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('DUPLICATE_PHONE');
    });

    it('returns 400 VALIDATION_ERROR on short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name:     'Short Pass',
          phone:    '9111111111',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('logs in a seeded test customer (Aarav Sharma)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone:    '9876543201',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.name).toBe('Aarav Sharma');
    });

    it('auto-provisions user login for unseeded phone in dev mode', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone:    '9998887776',
          password: 'AnyPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.phone).toBe('9998887776');
    });

    it('returns 401 INVALID_CREDENTIALS for wrong password on existing user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone:    '9876543201',
          password: 'WrongPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('INVALID_CREDENTIALS');
    });
  });
});
