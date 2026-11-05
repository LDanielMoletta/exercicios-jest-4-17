const request = require('supertest');
const app = require('../app');

describe('GET /saudacao/:nome', () => {
  it('should return the greeting with the provided name', async () => {
    // Act
    const response = await request(app).get('/saudacao/Maria');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ mensagem: 'Olá, Maria' });
  });

  it('should keep spaces in the name when properly encoded', async () => {
    // Act
    const response = await request(app).get('/saudacao/Ana%20Paula');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ mensagem: 'Olá, Ana Paula' });
  });
});

describe('POST /soma', () => {
  it('should return the sum of two positive numbers', async () => {
    // Arrange
    const payload = { a: 2, b: 3 };

    // Act
    const response = await request(app).post('/soma').send(payload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ resultado: 5 });
  });

  it('should return the sum of a negative and a positive number', async () => {
    // Arrange
    const payload = { a: -5, b: 2 };

    // Act
    const response = await request(app).post('/soma').send(payload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ resultado: -3 });
  });

  it('should return 400 when field "b" is missing', async () => {
    // Arrange
    const payload = { a: 2 };

    // Act
    const response = await request(app).post('/soma').send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/valid numbers/);
  });

  it('should return 400 when a value is not a number', async () => {
    // Arrange
    const payload = { a: 'x', b: 3 };

    // Act
    const response = await request(app).post('/soma').send(payload);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/valid numbers/);
  });
});

describe('unknown routes', () => {
  it('should return 404 for a route that does not exist', async () => {
    // Act
    const response = await request(app).get('/rota-inexistente');

    // Assert
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Route not found.' });
  });
});
