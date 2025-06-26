const request = require('supertest');
const express = require('express');
const vehiculeHistoryRouter = require('../../routes/vehiculeHistory');


// Middleware mock pentru autentificare
const authenticateTokenMock = (req, res, next) => {
  req.user = { id: 123 }; // mockăm un user id fix
  next();
};
jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 123 };
  next();
});
describe('Test ruta GET /vehicule/:id/history', () => {
  let app;
  let queryMock;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Middleware-ul nostru injectează req.db cu queryMock
    app.use((req, res, next) => {
      req.db = { query: queryMock };
      next();
    });

    app.use('/vehicule', vehiculeHistoryRouter);
  });

  beforeEach(() => {
    queryMock = jest.fn();
  });

  test('Ar trebui să returneze lista istoric pentru vehicul', async () => {
    const mockResults = [/*...*/];
    queryMock.mockImplementation((sql, params, callback) => {
      callback(null, mockResults);
    });

    const response = await request(app)
      .get('/vehicule/45/history')
      .set('Authorization', 'Bearer faketoken');

    expect(queryMock).toHaveBeenCalledWith(expect.any(String), ['45', 123], expect.any(Function));
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockResults);
  });

  test('Ar trebui să returneze eroare 500 la eroare DB', async () => {
    queryMock.mockImplementation((sql, params, callback) => {
      callback(new Error('DB error'), null);
    });

    const response = await request(app)
      .get('/vehicule/45/history')
      .set('Authorization', 'Bearer faketoken');

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('message', 'Eroare server.');
  });
});
