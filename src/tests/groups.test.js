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

describe('POST /api/groups/:id/invite', () => {
  test('invites two members by email', async () => {
    const token = await registerAndGetToken();
    
    await request(app).post('/api/auth/register').send({ name: 'u1', email: 'u1@example.com', password: 'password123' }).expect(201);
    await request(app).post('/api/auth/register').send({ name: 'u2', email: 'u2@example.com', password: 'password123' }).expect(201);

   
    const createRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'G1', amount: 100, frequency: 30 })
      .expect(201);

    const groupId = createRes.body.group._id;

    
    const inviteRes = await request(app)
      .post(`/api/groups/${groupId}/invite`)
      .set('Authorization', `Bearer ${token}`)
      .send({ emails: ['u1@example.com', 'u2@example.com'] })
      .expect(200);

    expect(inviteRes.body.success).toBe(true);
    expect(inviteRes.body.added).toBe(2);
    expect(inviteRes.body.alreadyMembers.length).toBe(0);
    expect(inviteRes.body.notFound.length).toBe(0);
  });
});


