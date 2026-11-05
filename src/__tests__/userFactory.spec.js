const { createUser } = require('../userFactory');

describe('createUser', () => {
  it('should return an object with the provided name and age', () => {
    // Act
    const result = createUser('Maria', 30);

    // Assert
    expect(result).toEqual({ id: expect.any(Number), name: 'Maria', age: 30 });
  });

  it('should include the name property', () => {
    // Act
    const result = createUser('Maria', 30);

    // Assert
    expect(result).toHaveProperty('name');
  });

  it('should set age to exactly 30', () => {
    // Act
    const result = createUser('Maria', 30);

    // Assert
    expect(result).toHaveProperty('age', 30);
  });

  it('should contain at least the provided fields', () => {
    // Act
    const result = createUser('Maria', 30);

    // Assert
    expect(result).toMatchObject({ name: 'Maria', age: 30 });
  });

  it('should keep the name non-empty', () => {
    // Act
    const result = createUser('Maria', 30);

    // Assert
    expect(result.name).toBeTruthy();
  });
});
