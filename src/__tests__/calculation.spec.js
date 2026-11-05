const { add, subtract } = require('../calculation');

describe('add', () => {
  it('should return 5 when adding 2 + 3', () => {
    // Arrange & Act
    const result = add(2, 3);

    // Assert
    expect(result).toBe(5);
  });

  it('should return 0 when adding -1 + 1', () => {
    // Arrange & Act
    const result = add(-1, 1);

    // Assert
    expect(result).toBe(0);
  });

  test.each([
    [0, 0, 0],
    [10, 5, 15],
    [-2, -3, -5],
  ])('should return %i when adding %i + %i', (a, b, expected) => {
    // Act
    const result = add(a, b);

    // Assert
    expect(result).toBe(expected);
  });
});

describe('subtract', () => {
  it('should return 3 when subtracting 5 - 2', () => {
    // Arrange & Act
    const result = subtract(5, 2);

    // Assert
    expect(result).toBe(3);
  });

  it('should return -3 when subtracting 2 - 5', () => {
    // Arrange & Act
    const result = subtract(2, 5);

    // Assert
    expect(result).toBe(-3);
  });
});
