// Purpose: Jest config — unit + integration test projects, coverage thresholds
'use strict';

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  collectCoverage: false, // enable explicitly with --coverage flag
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: { lines: 80 },
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  projects: [
    {
      displayName: 'unit',
      testMatch:   ['<rootDir>/src/modules/**/*.test.js'],
    },
    {
      displayName:  'integration',
      testMatch:    ['<rootDir>/tests/**/*.test.js'],
      globalSetup:  '<rootDir>/tests/setup.js',
      globalTeardown: '<rootDir>/tests/teardown.js',
    },
  ],
};
