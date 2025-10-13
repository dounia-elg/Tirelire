import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';
import User from '../models/User.js';

dotenv.config();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tirelire');
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('KYC functionality', () => {
  let authToken;

  beforeEach(async () => {
    
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    authToken = registerResponse.body.token;
  });

  test('should get KYC status', async () => {
    const response = await request(app)
      .get('/api/kyc/status')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.kyc.status).toBe('pending');
  });

  test('should upload ID number', async () => {
    const response = await request(app)
      .post('/api/kyc/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ idNumber: '123456789' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.kycStatus).toBe('pending');
  });

  test('should verify face', async () => {
    const response = await request(app)
      .post('/api/kyc/verify-face')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.faceVerified).toBe(true);
  });
});