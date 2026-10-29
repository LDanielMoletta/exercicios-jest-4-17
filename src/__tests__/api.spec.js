const request = require('supertest');
const app = require('../app');

describe('API integration', () => {
  it('should return status 200 on GET /ping', async () => {
    // Act
    const response = await request(app).get('/ping');

    // Assert
    expect(response.status).toBe(200);
  });

  it('should return { status: "ok" } in the response body', async () => {
    // Act
    const response = await request(app).get('/ping');

    // Assert
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return a JSON content type on GET /ping', async () => {
    // Act
    const response = await request(app).get('/ping');

    // Assert
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return 404 for an unknown route', async () => {
    // Act
    const response = await request(app).get('/unknown-route');

    // Assert
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Route not found.' });
  });

  it('should return 404 when using POST on /ping', async () => {
    // Act
    const response = await request(app).post('/ping');

    // Assert
    expect(response.status).toBe(404);
  });
});
