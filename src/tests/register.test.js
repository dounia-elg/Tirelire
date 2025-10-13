import request from 'supertest';
import app from '../app.js';


describe('POST /api/auth/register', () => {
  
  test('should register a new user successfully', async () => {
    const userData = {
      name: 'Test test',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.token).toBeDefined();
  }, 10000); 

  test('should return error for missing email', async () => {
    const userData = {
      name: 'Test test',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test('should return error for short password', async () => {
    const userData = {
      name: 'Test test',
      email: 'test@example.com',
      password: '123' 
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test('should return error for duplicate email', async () => {
    const userData = {
      name: 'Test test',
      email: 'test@example.com',
      password: 'password123'
    };

    
    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);


    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBeGreaterThanOrEqual(400);
  }, 10000);
});