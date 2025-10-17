// jest.setup.js - runs before tests
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_please_replace';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_please_replace';
process.env.NODE_ENV = 'test';
// Use a per-worker test database to avoid collisions when Jest runs tests in parallel
const workerId = process.env.JEST_WORKER_ID || '1';
process.env.MONGO_URI_TEST = process.env.MONGO_URI_TEST || `mongodb://127.0.0.1:27017/tirelire_test_${workerId}`;
// Disable scheduled jobs during tests
process.env.DISABLE_CRON = 'true';

// any other global test setup can go here
