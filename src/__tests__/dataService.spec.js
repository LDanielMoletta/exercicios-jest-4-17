const { fetchData, fetchDataWithError } = require('../dataService');

describe('fetchData', () => {
  it('should resolve with the complete object', async () => {
    // Act & Assert
    await expect(fetchData()).resolves.toEqual({ ok: true });
  });

  it('should resolve with the ok property set to true', async () => {
    // Act & Assert
    await expect(fetchData()).resolves.toHaveProperty('ok', true);
  });

  it('should resolve with an object that matches ok: true', async () => {
    // Act & Assert
    await expect(fetchData()).resolves.toMatchObject({ ok: true });
  });

  it('should return a promise', () => {
    // Act
    const result = fetchData();

    // Assert
    expect(result).toBeInstanceOf(Promise);
  });

  it('should return ok: true when using async/await directly', async () => {
    // Act
    const result = await fetchData();

    // Assert
    expect(result).toEqual({ ok: true });
  });
});

describe('fetchDataWithError', () => {
  it('should reject with the expected message', async () => {
    // Act & Assert
    await expect(fetchDataWithError()).rejects.toThrow('failed to fetch data');
  });

  it('should reject with an Error instance', async () => {
    // Act & Assert
    await expect(fetchDataWithError()).rejects.toBeInstanceOf(Error);
  });

  it('should reject with an Error when using try/catch', async () => {
    // Arrange
    expect.assertions(1);

    try {
      // Act
      await fetchDataWithError();
    } catch (error) {
      // Assert
      expect(error).toBeInstanceOf(Error);
    }
  });
});
