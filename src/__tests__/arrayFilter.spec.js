const { filterEvens } = require('../arrayFilter');

describe('filterEvens', () => {
  it('should return only the even numbers', () => {
    // Arrange
    const numbers = [1, 2, 3, 4, 5, 6];

    // Act
    const result = filterEvens(numbers);

    // Assert
    expect(result).toEqual([2, 4, 6]);
  });

  it('should return an empty array when there are no even numbers', () => {
    // Act
    const result = filterEvens([1, 3, 5]);

    // Assert
    expect(result).toEqual([]);
  });

  it('should return an empty array when the input is empty', () => {
    // Act
    const result = filterEvens([]);

    // Assert
    expect(result).toEqual([]);
  });

  it('should keep negative even numbers and zero', () => {
    // Act
    const result = filterEvens([-4, -3, 0, 7]);

    // Assert
    expect(result).toEqual([-4, 0]);
  });

  it('should contain the number 12 in the result', () => {
    // Act
    const result = filterEvens([10, 11, 12]);

    // Assert
    expect(result).toContain(12);
  });

  it('should return an array with four elements', () => {
    // Act
    const result = filterEvens([2, 4, 6, 8]);

    // Assert
    expect(result).toHaveLength(4);
  });

  it('should not contain the number 2 when there are no even numbers', () => {
    // Act
    const result = filterEvens([1, 3, 5]);

    // Assert
    expect(result).not.toContain(2);
  });
});
