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

const registerAndVerify = async (email = 'user@example.com') => {
  const res = await request(app).post('/api/auth/register').send({ name: 'U', email, password: 'password123' }).expect(201);
  const token = res.body.token;
  await request(app).post('/api/kyc/upload').set('Authorization', `Bearer ${token}`).send({ idNumber: 'ID1' }).expect(200);
  await request(app).post('/api/kyc/verify-face').set('Authorization', `Bearer ${token}`).expect(200);
  return token;
};

test('members can contribute and distribute when all paid', async () => {
  const token = await registerAndVerify('owner@example.com');
  const token2 = await registerAndVerify('m1@example.com');
  const token3 = await registerAndVerify('m2@example.com');

  const createRes = await request(app).post('/api/groups').set('Authorization', `Bearer ${token}`).send({ name: 'Gtest', amount: 50, maxMembers: 3 }).expect(201);
  const groupId = createRes.body.group._id;

  // other members join via invite
  await request(app).post(`/api/groups/${groupId}/invite`).set('Authorization', `Bearer ${token}`).send({ emails: ['m1@example.com', 'm2@example.com'] }).expect(200);

  // each member contributes
  await request(app).post(`/api/contributions/group/${groupId}/contribute`).set('Authorization', `Bearer ${token}`).send({ amount: 50 }).expect(201);
  await request(app).post(`/api/contributions/group/${groupId}/contribute`).set('Authorization', `Bearer ${token2}`).send({ amount: 50 }).expect(201);
  await request(app).post(`/api/contributions/group/${groupId}/contribute`).set('Authorization', `Bearer ${token3}`).send({ amount: 50 }).expect(201);

  // distribute by owner
  const dist = await request(app).post(`/api/groups/${groupId}/distribute`).set('Authorization', `Bearer ${token}`).expect(200);
  expect(dist.body.success).toBe(true);
  expect(dist.body.payment).toBeDefined();
});
