import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';
import User from '../models/User.js';
import Group from '../models/Group.js';

dotenv.config();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/tirelire_test');
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Group.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

const registerAndGetToken = async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'chiwahd', email: 'chiwahd@example.com', password: 'password123' })
    .expect(201);
  return res.body.token;
};

describe('POST /api/groups (simple)', () => {
  test('creates a group (success)', async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Tontine', amount: 1000, frequency: 30 })
      .expect(201);
    expect(res.body.success).toBe(true);
  });

  test('returns 400 when name missing', async () => {
    const token = await registerAndGetToken();
    await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1000, frequency: 30 })
      .expect(400);
  });
});


