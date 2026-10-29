const { divide } = require('../divide');

describe('divide', () => {
  it('should return 5 when dividing 10 by 2', () => {
    // Act
    const result = divide(10, 2);

    // Assert
    expect(result).toBe(5);
  });

  it('should return -5 when dividing -10 by 2', () => {
    // Act
    const result = divide(-10, 2);

    // Assert
    expect(result).toBe(-5);
  });

  it('should return 0 when dividing 0 by 5', () => {
    // Act
    const result = divide(0, 5);

    // Assert
    expect(result).toBe(0);
  });

  it('should return 3.5 when dividing 7 by 2', () => {
    // Act
    const result = divide(7, 2);

    // Assert
    expect(result).toBe(3.5);
  });

  it('should throw an error when dividing by zero', () => {
    // Act & Assert
    expect(() => divide(10, 0)).toThrow();
  });

  it('should throw an error containing the expected message', () => {
    // Act & Assert
    expect(() => divide(10, 0)).toThrow('division by zero');
  });

  it('should throw an error matching the expected pattern', () => {
    // Act & Assert
    expect(() => divide(10, 0)).toThrow(/zero/);
  });

  it('should throw an Error instance when dividing by zero', () => {
    // Act & Assert
    expect(() => divide(10, 0)).toThrow(Error);
  });

  it('should not throw when dividing 10 by 5', () => {
    // Act & Assert
    expect(() => divide(10, 5)).not.toThrow();
  });
});
