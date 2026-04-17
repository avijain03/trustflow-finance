// Purpose: Jest global setup — start in-memory MongoDB for integration tests
'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI     = mongod.getUri();
  process.env.JWT_SECRET      = 'test_jwt_secret_minimum_32_chars__';
  process.env.INTERNAL_JWT_SECRET = 'test_internal_secret_32_chars_ok';
  process.env.NODE_ENV        = 'test';
  process.env.FRONTEND_URL    = 'http://localhost:3000';
  global.__MONGOD__           = mongod;
};
