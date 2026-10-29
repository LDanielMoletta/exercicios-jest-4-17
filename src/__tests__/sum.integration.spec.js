const request = require('supertest');
const app = require('../app');

describe('POST /api/soma', () => {
  it('should return the correct sum for two positive numbers', async () => {
    // Arrange
    const payload = { a: 5, b: 3 };

    // Act
    const response = await request(app).post('/api/soma').send(payload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ resultado: 8 });
  });

  it('should return the correct sum when one value is zero', async () => {
    // Arrange
    const payload = { a: 0, b: 7 };

    // Act
    const response = await request(app).post('/api/soma').send(payload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ resultado: 7 });
  });

  it('should return the correct sum for two negative numbers', async () => {
    // Arrange
    const payload = { a: -5, b: -3 };

    // Act
    const response = await request(app).post('/api/soma').send(payload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ resultado: -8 });
  });

  it('should return the correct sum for a positive and a negative number', async () => {
    // Arrange
    const payload = { a: 10, b: -4 };

    // Act
    const response = await request(app).post('/api/soma').send(payload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ resultado: 6 });
  });

  it('should return 400 when a value is a string', async () => {
    // Arrange
    const payload = { a: '5', b: 3 };

    // Act
    const response = await request(app).post('/api/soma').send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/valid numbers/);
  });

  it('should return 400 when field "a" is missing', async () => {
    // Arrange
    const payload = { b: 3 };

    // Act
    const response = await request(app).post('/api/soma').send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/valid numbers/);
  });

  it('should return 400 when field "b" is missing', async () => {
    // Arrange
    const payload = { a: 5 };

    // Act
    const response = await request(app).post('/api/soma').send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/valid numbers/);
  });

  it('should return 400 when both fields are missing', async () => {
    // Arrange
    const payload = {};

    // Act
    const response = await request(app).post('/api/soma').send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/valid numbers/);
  });

  it('should return 400 when the request has no body', async () => {
    // Act
    const response = await request(app).post('/api/soma');

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/valid numbers/);
  });

  it('should return 400 when a value is null', async () => {
    // Arrange
    const payload = { a: null, b: 3 };

    // Act
    const response = await request(app).post('/api/soma').send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/valid numbers/);
  });
});
