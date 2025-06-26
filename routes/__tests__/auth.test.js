const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const authRoutes = require('../auth');

// Middleware mock pentru injectarea bazei de date
function mockDbMiddleware(mockQueryFn) {
  return (req, res, next) => {
    req.db = {
      query: mockQueryFn,
    };
    next();
  };
}

describe('Testare funcțională /auth cu DB mockuit', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it('✅ POST /auth/register - utilizator nou', async () => {
    const mockQuery = jest.fn()
      // Primul query: verificare dacă există deja
      .mockImplementationOnce((sql, params, cb) => cb(null, []))
      // Al doilea query: inserare utilizator
      .mockImplementationOnce((sql, params, cb) => cb(null, { insertId: 1 }));

    app.use(mockDbMiddleware(mockQuery));
    app.use('/auth', authRoutes);

    const response = await request(app).post('/auth/register').send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'test123'
    });

    expect(response.statusCode).toBe(200); // În codul tău original nu trimiți 201, ci 200
    expect(response.body).toHaveProperty('message');
  });

  it('❌ POST /auth/register - email deja folosit', async () => {
    const mockQuery = jest.fn()
      .mockImplementationOnce((sql, params, cb) => cb(null, [{ id: 1 }]));

    app.use(mockDbMiddleware(mockQuery));
    app.use('/auth', authRoutes);

    const response = await request(app).post('/auth/register').send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'test123'
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('✅ POST /auth/login - date corecte', async () => {
    const mockQuery = jest.fn()
      .mockImplementationOnce((sql, params, cb) =>
        cb(null, [{ id: 1, email: 'test@example.com', password: 'test123' }])
      );

    app.use(mockDbMiddleware(mockQuery));
    app.use('/auth', authRoutes);

    const response = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'test123'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('❌ POST /auth/login - date greșite', async () => {
    const mockQuery = jest.fn()
      .mockImplementationOnce((sql, params, cb) =>
        cb(null, [])
      );

    app.use(mockDbMiddleware(mockQuery));
    app.use('/auth', authRoutes);

    const response = await request(app).post('/auth/login').send({
      email: 'gresit@example.com',
      password: 'gresit123'
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message');
  });
});
